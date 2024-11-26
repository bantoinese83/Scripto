import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional

from fastapi import File, UploadFile, HTTPException, Depends, Query, Request, APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ValidationError
from sqlalchemy import desc, func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from tqdm import tqdm

from app_config import MetadataKeys, init_genai, init_logger
from db_config import get_db
from models import ScriptMetadata, ScriptDownvotes, IPLikes, IPDownvotes, ScriptLikes, ScriptRequest
from schemas import ScriptMetadataModel, ScriptMetadataIn, UpdateMetadata, AnalyticsResponse, ScriptRequestModel
from services import read_file_content, generate_prompt, extract_metadata, validate_metadata
from websockets_routes import manager

router = APIRouter()


@router.post("/v1/input-script/", tags=["📤 Input Script"], response_model=ScriptMetadataModel,
             responses={400: {"model": BaseModel}})
async def input_script_v1(metadata: ScriptMetadataIn, db: Session = Depends(get_db)):
    try:
        existing_script = db.query(ScriptMetadata).filter(
            ScriptMetadata.script_content == metadata.script_content).first()
        if existing_script:
            raise HTTPException(status_code=409, detail="Script content already exists.")

        db_metadata = ScriptMetadata(
            title=metadata.title,
            language=metadata.language,
            tags=metadata.tags,
            description=metadata.description,
            how_it_works=metadata.how_it_works,
            script_content=metadata.script_content,
            category=metadata.category,
            filename=f"input_script_{uuid.uuid4()}.txt"
        )

        db.add(db_metadata)
        db.commit()
        db.refresh(db_metadata)
        return db_metadata

    except ValidationError as e:
        init_logger().error(f"❌ Validation error: {e.errors()}")
        return JSONResponse(status_code=400, content={"detail": e.errors()})
    except IntegrityError as e:
        db.rollback()
        init_logger().error(f"❌ Database Integrity Error: {e}")
        raise HTTPException(status_code=409, detail="Database error. This may indicate a unique constraint violation.")
    except Exception as e:
        db.rollback()
        init_logger().error(f"❌ An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred.")


@router.post("/v1/upload-script/", tags=["📤 Upload Script"])
async def upload_script_v1(file: UploadFile = File(...), request_id: Optional[uuid.UUID] = None,
                           db: Session = Depends(get_db)):
    try:
        init_logger().info("🚀 Starting script upload process.")
        script_content = await read_file_content(file)
        file_extension = file.filename.split(".")[-1]
        chat_session = init_genai().start_chat(history=[])
        prompt = generate_prompt(script_content, file_extension)

        with tqdm(total=100, desc="Generating metadata", bar_format="{l_bar}{bar} [ time left: {remaining} ]") as pbar:
            for attempt in range(3):
                response = chat_session.send_message(prompt)
                pbar.update(50)
                metadata = extract_metadata(response.text)
                try:
                    validate_metadata(metadata)
                    pbar.update(50)
                    init_logger().info("🎉 Script metadata generated successfully.")

                    db_metadata = ScriptMetadata(
                        filename=file.filename,
                        title=metadata[MetadataKeys.TITLE.value],
                        language=metadata[MetadataKeys.LANGUAGE.value],
                        tags=metadata[MetadataKeys.TAGS.value],
                        description=metadata[MetadataKeys.DESCRIPTION.value],
                        how_it_works=metadata[MetadataKeys.HOW_IT_WORKS.value],
                        script_content=script_content,
                        category=metadata[MetadataKeys.CATEGORY.value]
                    )
                    db.add(db_metadata)
                    db.commit()
                    db.refresh(db_metadata)

                    if request_id:
                        await fulfill_script_request(request_id, db)

                    return {"id": str(db_metadata.id), "filename": file.filename, **metadata}
                except ValueError as e:
                    init_logger().warning(f"⚠️ Attempt {attempt + 1}: {e}")
                    if attempt == 2:
                        raise e

    except (ValueError, ValidationError) as e:
        init_logger().error(f"❌ Validation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except IntegrityError as e:
        db.rollback()
        init_logger().error(f"❌ Database Integrity Error: {e}")
        raise HTTPException(status_code=409, detail="Script content already exists.")
    except Exception as e:
        init_logger().error(f"❌ An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.get("/v1/search-scripts/", tags=["🔍 Search Scripts"])
def search_scripts(
        title: Optional[str] = Query(None),
        language: Optional[str] = Query(None),
        tags: Optional[str] = Query(None),
        category: Optional[str] = Query(None),
        db: Session = Depends(get_db)
):
    try:
        query = db.query(ScriptMetadata)

        if title:
            query = query.filter(ScriptMetadata.title.ilike(f"%{title}%"))
        if language:
            query = query.filter(ScriptMetadata.language.ilike(f"%{language}%"))
        if tags:
            tags_list = [tag.strip() for tag in tags.split(",")]
            for tag in tags_list:
                query = query.filter(ScriptMetadata.tags.ilike(f"%{tag}%"))
        if category:
            query = query.filter(ScriptMetadata.category.ilike(f"%{category}%"))

        results = query.all()
        return results

    except Exception as e:
        init_logger().error(f"❌ An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.get("/v1/get-all-scripts/", tags=["📜 Get All Scripts"])
def get_all_scripts(db: Session = Depends(get_db)):
    try:
        return db.query(ScriptMetadata).all()
    except Exception as e:
        init_logger().error(f"❌ An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.get("/v1/get-all-tags/", tags=["🏷️ Get All Tags"])
def get_all_tags(db: Session = Depends(get_db)):
    try:
        tags = db.query(ScriptMetadata.tags).distinct().all()
        unique_tags = set()
        for tag_list in tags:
            for tag in tag_list[0].split(","):
                unique_tags.add(tag.strip())
        return list(unique_tags)
    except Exception as e:
        init_logger().error(f"❌ An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.put("/v1/update-script/{script_id}/", tags=["🔄 Update Script"])
def update_script(script_id: uuid.UUID, metadata: UpdateMetadata, db: Session = Depends(get_db)):
    try:
        script = db.query(ScriptMetadata).filter(ScriptMetadata.id == script_id).first()
        if not script:
            raise HTTPException(status_code=404, detail="Script not found")

        for key, value in metadata.model_dump(exclude_unset=True).items():
            setattr(script, key, value)

        db.commit()
        db.refresh(script)
        return script

    except Exception as e:
        init_logger().error(f"❌ An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.delete("/v1/delete-script/{script_id}/", tags=["🗑️ Delete Script"])
def delete_script(script_id: uuid.UUID, db: Session = Depends(get_db)):
    try:
        script = db.query(ScriptMetadata).filter(ScriptMetadata.id == script_id).first()
        if not script:
            raise HTTPException(status_code=404, detail="Script not found")

        db.delete(script)
        db.commit()
        return {"detail": "Script deleted successfully"}

    except Exception as e:
        init_logger().error(f"❌ An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.post("/v1/like-script/{script_id}/", tags=["👍 Like Script"])
def like_script(script_id: uuid.UUID, request: Request, db: Session = Depends(get_db)):
    try:
        ip_address = request.client.host

        ip_like = db.query(IPLikes).filter(IPLikes.ip_address == ip_address, IPLikes.script_id == script_id).first()
        if ip_like:
            raise HTTPException(status_code=400, detail="IP address has already liked this script.")

        ip_downvote = db.query(IPDownvotes).filter(IPDownvotes.ip_address == ip_address,
                                                   IPDownvotes.script_id == script_id).first()
        if ip_downvote:
            db.delete(ip_downvote)
            script_downvote = db.query(ScriptDownvotes).filter(ScriptDownvotes.script_id == script_id).first()
            if script_downvote:
                script_downvote.downvote_count -= 1
                if script_downvote.downvote_count == 0:
                    db.delete(script_downvote)

        new_like = IPLikes(ip_address=ip_address, script_id=script_id)
        db.add(new_like)

        script_like = db.query(ScriptLikes).filter(ScriptLikes.script_id == script_id).first()
        if script_like:
            script_like.like_count += 1
        else:
            script_like = ScriptLikes(script_id=script_id, like_count=1)
            db.add(script_like)

        db.commit()
        return {"script_id": script_id, "like_count": script_like.like_count}
    except Exception as e:
        db.rollback()
        init_logger().error(f"❌ An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.post("/v1/downvote-script/{script_id}/", tags=["👎 Downvote Script"])
def downvote_script(script_id: uuid.UUID, request: Request, db: Session = Depends(get_db)):
    try:
        ip_address = request.client.host

        ip_downvote = db.query(IPDownvotes).filter(IPDownvotes.ip_address == ip_address,
                                                   IPDownvotes.script_id == script_id).first()
        if ip_downvote:
            raise HTTPException(status_code=400, detail="IP address has already downvoted this script.")

        ip_like = db.query(IPLikes).filter(IPLikes.ip_address == ip_address, IPLikes.script_id == script_id).first()
        if ip_like:
            db.delete(ip_like)
            script_like = db.query(ScriptLikes).filter(ScriptLikes.script_id == script_id).first()
            if script_like:
                script_like.like_count -= 1
                if script_like.like_count == 0:
                    db.delete(script_like)

        new_downvote = IPDownvotes(ip_address=ip_address, script_id=script_id)
        db.add(new_downvote)

        script_downvote = db.query(ScriptDownvotes).filter(ScriptDownvotes.script_id == script_id).first()
        if script_downvote:
            script_downvote.downvote_count += 1
        else:
            script_downvote = ScriptDownvotes(script_id=script_id, downvote_count=1)
            db.add(script_downvote)

        if script_downvote.downvote_count >= 100:
            script = db.query(ScriptMetadata).filter(ScriptMetadata.id == script_id).first()
            if script:
                db.delete(script)
                db.commit()
                return {"detail": "Script deleted due to reaching 100 downvotes"}

        db.commit()
        return {"script_id": script_id, "downvote_count": script_downvote.downvote_count}
    except Exception as e:
        db.rollback()
        init_logger().error(f"❌ An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.get("/v1/get-script-likes/{script_id}/", tags=["👍 Get Script Likes"])
def get_script_likes(script_id: uuid.UUID, db: Session = Depends(get_db)):
    try:
        script_like = db.query(ScriptLikes).filter(ScriptLikes.script_id == script_id).first()
        if not script_like:
            return {"script_id": script_id, "like_count": 0}
        return {"script_id": script_id, "like_count": script_like.like_count}
    except Exception as e:
        init_logger().error(f"❌ An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.get("/v1/get-script-downvotes/{script_id}/", tags=["👎 Get Script Downvotes"])
def get_script_downvotes(script_id: uuid.UUID, db: Session = Depends(get_db)):
    try:
        script_downvote = db.query(ScriptDownvotes).filter(ScriptDownvotes.script_id == script_id).first()
        if not script_downvote:
            return {"script_id": script_id, "downvote_count": 0}
        return {"script_id": script_id, "downvote_count": script_downvote.downvote_count}
    except Exception as e:
        init_logger().error(f"❌ An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.get("/v1/recent-scripts/", tags=["🆕 Recent Scripts"])
def get_recent_scripts(limit: int = 10, db: Session = Depends(get_db)):
    try:
        twenty_four_hours_ago = datetime.now(timezone.utc) - timedelta(hours=24)
        recent_scripts = db.query(ScriptMetadata).filter(ScriptMetadata.upload_time >= twenty_four_hours_ago).order_by(
            desc(ScriptMetadata.upload_time)).limit(limit).all()
        return recent_scripts
    except Exception as e:
        init_logger().error(f"❌ An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.get("/v1/trending-scripts/", tags=["🔥 Trending Scripts"])
def get_scripts_with_100_likes(db: Session = Depends(get_db)):
    try:
        scripts_with_100_likes = db.query(ScriptMetadata).join(ScriptLikes,
                                                               ScriptMetadata.id == ScriptLikes.script_id).filter(
            ScriptLikes.like_count >= 100).all()
        return scripts_with_100_likes
    except Exception as e:
        init_logger().error(f"❌ An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.get("/v1/get-script-by-id/{script_id}/", tags=["📜 Get Script by ID"])
def get_script_by_id(script_id: uuid.UUID, db: Session = Depends(get_db)):
    try:
        script = db.query(ScriptMetadata).filter(ScriptMetadata.id == script_id).first()
        if not script:
            raise HTTPException(status_code=404, detail="Script not found")
        return script
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.get("/v1/analytics/", tags=["📊 Analytics"], response_model=AnalyticsResponse)
def get_analytics(db: Session = Depends(get_db)):
    try:
        total_scripts = db.query(ScriptMetadata).count()
        total_likes = db.query(ScriptLikes).with_entities(func.sum(ScriptLikes.like_count)).scalar() or 0
        most_liked_script = db.query(ScriptMetadata).join(ScriptLikes,
                                                          ScriptMetadata.id == ScriptLikes.script_id).order_by(
            desc(ScriptLikes.like_count)).first()
        recent_uploads = db.query(ScriptMetadata).filter(
            ScriptMetadata.upload_time >= datetime.now(timezone.utc) - timedelta(hours=24)).count()
        trending_scripts = db.query(ScriptMetadata).join(ScriptLikes,
                                                         ScriptMetadata.id == ScriptLikes.script_id).filter(
            ScriptLikes.like_count > 0).count()

        most_liked_script_instance = None
        if most_liked_script:
            most_liked_script_instance = ScriptMetadataModel.model_validate(most_liked_script)

        return AnalyticsResponse(
            total_scripts=total_scripts,
            total_likes=total_likes,
            most_liked_script=most_liked_script_instance,
            recent_uploads=recent_uploads,
            trending_scripts=trending_scripts
        )
    except Exception as e:
        init_logger().error(f"❌ An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.post("/v1/request-script/", tags=["📤 Request Script"])
async def request_script(request: ScriptRequestModel, db: Session = Depends(get_db)):
    new_request = ScriptRequest(
        title=request.title,
        description=request.description,
        language=request.language,
        tags=request.tags
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    return new_request


@router.get("/v1/get-script-requests/", tags=["📜 Get Script Requests"])
def get_script_requests(db: Session = Depends(get_db)):
    try:
        script_requests = db.query(ScriptRequest).all()
        return script_requests
    except Exception as e:
        init_logger().error(f"❌ An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred while fetching script requests.")


@router.put("/v1/fulfill-script-request/{request_id}/", tags=["🔄 Fulfill Script Request"])
async def fulfill_script_request(request_id: uuid.UUID, db: Session = Depends(get_db)):
    script_request = db.query(ScriptRequest).filter(ScriptRequest.id == request_id).first()
    if not script_request:
        raise HTTPException(status_code=404, detail="Script request not found")
    script_request.is_fulfilled = True
    db.commit()
    db.refresh(script_request)
    await manager.broadcast(f"Script request '{script_request.title}' has been fulfilled!")
    return {"message": f"Script request '{script_request.title}' fulfilled successfully."}
