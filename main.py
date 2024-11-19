import logging
import os
import uuid
from enum import Enum
from typing import Optional
from fastapi import Request
from datetime import datetime, timezone, timedelta

import google.generativeai as genai
import uvicorn
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi import Query
from fastapi.middleware.cors import CORSMiddleware
from google.generativeai import GenerationConfig
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, String, Text, Integer, DateTime, desc, func, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from tqdm import tqdm

# Initialize FastAPI app
app = FastAPI(
    title="📜 Scripto Metadata API",
    description="🚀 API for anonymously uploading scripts and building a collaborative script library for all developers! 🌟",
    version="1.0.0",
    docs_url="/",
)
# --- Setup CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Adjust this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Configure Google Gemini API
genai.configure(api_key=os.environ["GEMINI_API_KEY"])

generation_config = GenerationConfig(
    temperature=1,
    top_p=0.95,
    top_k=64,
    max_output_tokens=8192,
    response_mime_type="text/plain",
)

model = genai.GenerativeModel(
    model_name="gemini-1.5-pro",
    generation_config=generation_config,
)

# Database setup
DATABASE_URL = "sqlite:///./metadata.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class ScriptMetadata(Base):
    __tablename__ = "script_metadata"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    filename = Column(String, index=True)
    title = Column(String)
    language = Column(String)
    tags = Column(String)
    description = Column(Text)
    how_it_works = Column(Text)
    script_content = Column(Text, unique=True)
    category = Column(String)
    upload_time = Column(DateTime, default=lambda: datetime.now(timezone.utc))  # Updated column

    def __repr__(self):
        return f"<ScriptMetadata id={self.id} title={self.title}>"


class ScriptLikes(Base):
    __tablename__ = "script_likes"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    script_id = Column(UUID(as_uuid=True), index=True)
    like_count = Column(Integer, default=0)


class IPLikes(Base):
    __tablename__ = "ip_likes"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    ip_address = Column(String, index=True)
    script_id = Column(UUID(as_uuid=True), ForeignKey('script_metadata.id'), index=True)


class IPDownvotes(Base):
    __tablename__ = "ip_downvotes"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    ip_address = Column(String, index=True)
    script_id = Column(UUID(as_uuid=True), ForeignKey('script_metadata.id'), index=True)


class ScriptDownvotes(Base):
    __tablename__ = "script_downvotes"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    script_id = Column(UUID(as_uuid=True), index=True)
    downvote_count = Column(Integer, default=0)


# Create the database tables
Base.metadata.create_all(bind=engine)


class UpdateMetadata(BaseModel):
    title: Optional[str]
    language: Optional[str]
    tags: Optional[str]
    description: Optional[str]
    how_it_works: Optional[str]
    category: Optional[str]


class ScriptMetadataModel(BaseModel):
    id: uuid.UUID
    filename: str
    title: str
    language: str
    tags: str
    description: str
    how_it_works: str
    script_content: str
    category: str
    upload_time: datetime

    class Config:
        arbitrary_types_allowed = True
        from_attributes = True


class AnalyticsResponse(BaseModel):
    total_scripts: int
    total_likes: int
    most_liked_script: Optional[ScriptMetadataModel]
    recent_uploads: int
    trending_scripts: int

    class Config:
        arbitrary_types_allowed = True


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class MetadataKeys(Enum):
    TITLE = "Title"
    LANGUAGE = "Language"
    TAGS = "Tags"
    DESCRIPTION = "Description"
    HOW_IT_WORKS = "How it works"
    CATEGORY = "Category"


# Update the REQUIRED_FIELDS list
REQUIRED_FIELDS = [
    MetadataKeys.TITLE.value,
    MetadataKeys.TAGS.value,
    MetadataKeys.DESCRIPTION.value,
    MetadataKeys.LANGUAGE.value,
    MetadataKeys.HOW_IT_WORKS.value,
    MetadataKeys.CATEGORY.value,
]


async def read_file_content(file: UploadFile) -> str:
    try:
        content = await file.read()
        logger.info("📄 File content read successfully.")
        return content.decode("utf-8")
    except Exception as e:
        logger.error(f"❌ Error reading file content: {e}")
        raise HTTPException(status_code=500, detail="Error reading file content.")


def generate_prompt(script_content: str, file_extension: str) -> str:
    logger.info("📝 Generating prompt for the script.")
    return f"""
    Analyze the following {file_extension} script and provide the following metadata in the specified format:

    Title: <Descriptive title>
    Language: <Programming language>
    Tags: <Comma-separated tags>
    Description: <Detailed description of what the script does>
    How it works: <Brief explanation of how the script works>
    Category: <Category of the script (e.g., Image Processing, Web Scraper, Data Analyzer)>

    Ensure that all fields are filled out completely and accurately.

    Script:
    {script_content}
    """


def extract_metadata(response_text: str) -> dict:
    logger.info("🔍 Extracting metadata from the response.")
    generated_metadata = response_text.strip().split("\n")
    metadata = {key.value: None for key in MetadataKeys}
    for line in generated_metadata:
        for key in MetadataKeys:
            if line.lower().startswith(f"{key.value.lower()}:"):
                metadata[key.value] = line.split(":", 1)[-1].strip() or None
    return metadata


def validate_metadata(metadata: dict):
    logger.info("✅ Validating extracted metadata.")
    for field in REQUIRED_FIELDS:
        if not metadata[field]:
            logger.error(f"❌ Metadata validation failed: {field} is missing.")
            raise ValueError(f"Failed to generate complete metadata: {field} is missing.")


@app.post("/v1/upload-script/", tags=["📤 Upload Script"],
          summary="Upload a script and generate metadata using Google Gemini.",
          description="This endpoint allows you to upload a script file and generate metadata using Google Gemini.")
async def upload_script_v1(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Endpoint to upload a script and generate metadata using Google Gemini.
    """
    try:
        logger.info("🚀 Starting script upload process.")
        script_content = await read_file_content(file)
        file_extension = file.filename.split(".")[-1]
        chat_session = model.start_chat(history=[])
        prompt = generate_prompt(script_content, file_extension)

        # Use tqdm for progress feedback
        with tqdm(total=100, desc="Generating metadata", bar_format="{l_bar}{bar} [ time left: {remaining} ]") as pbar:
            for attempt in range(3):  # Retry up to 3 times
                response = chat_session.send_message(prompt)
                pbar.update(50)
                metadata = extract_metadata(response.text)
                try:
                    validate_metadata(metadata)
                    pbar.update(50)
                    logger.info("🎉 Script metadata generated successfully.")

                    # Store metadata and script content in the database
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

                    return {"id": str(db_metadata.id), "filename": file.filename, **metadata}
                except ValueError as e:
                    logger.warning(f"⚠️ Attempt {attempt + 1}: {e}")
                    if attempt == 2:
                        raise e

    except ValueError as e:
        logger.error(f"❌ Metadata validation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException as e:
        logger.error(f"❌ HTTPException: {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"❌ An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@app.get("/v1/search-scripts/", tags=["🔍 Search Scripts"],
         summary="Search for scripts based on metadata.",
         description="This endpoint allows you to search for scripts based on various metadata fields.")
def search_scripts(
        title: Optional[str] = Query(None, description="Search by title"),
        language: Optional[str] = Query(None, description="Search by programming language"),
        tags: Optional[str] = Query(None, description="Search by tags (comma-separated)"),
        category: Optional[str] = Query(None, description="Search by category"),
        db: Session = Depends(get_db)
):
    """
    Endpoint to search for scripts based on metadata.
    """
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
        logger.error(f"❌ An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@app.get("/v1/get-all-scripts/", tags=["📜 Get All Scripts"],
         summary="Get all scripts with metadata.",
         description="This endpoint allows you to retrieve all scripts with their metadata.")
def get_all_scripts(db: Session = Depends(get_db)):
    """
    Endpoint to retrieve all scripts with metadata.
    """
    try:
        return db.query(ScriptMetadata).all()
    except Exception as e:
        logger.error(f"❌ An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.get("/v1/get-all-tags/", tags=["🏷️ Get All Tags"], summary="Get all unique tags", description="This endpoint allows you to retrieve all unique tags from the scripts.")
def get_all_tags(db: Session = Depends(get_db)):
    """
    Endpoint to retrieve all unique tags from the scripts.
    """
    try:
        tags = db.query(ScriptMetadata.tags).distinct().all()
        unique_tags = set()
        for tag_list in tags:
            for tag in tag_list[0].split(","):
                unique_tags.add(tag.strip())
        return list(unique_tags)
    except Exception as e:
        logger.error(f"❌ An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.put("/v1/update-script/{script_id}/", tags=["🔄 Update Script"],
         summary="Update script metadata.",
         description="This endpoint allows you to update the metadata of an existing script.")
def update_script(script_id: uuid.UUID, metadata: UpdateMetadata, db: Session = Depends(get_db)):
    """
    Endpoint to update the metadata of an existing script.
    """
    try:
        script = db.query(ScriptMetadata).filter(ScriptMetadata.id == script_id).first()
        if not script:
            raise HTTPException(status_code=404, detail="Script not found")

        if metadata.title is not None:
            script.title = metadata.title
        if metadata.language is not None:
            script.language = metadata.language
        if metadata.tags is not None:
            script.tags = metadata.tags
        if metadata.description is not None:
            script.description = metadata.description
        if metadata.how_it_works is not None:
            script.how_it_works = metadata.how_it_works
        if metadata.category is not None:
            script.category = metadata.category

        db.commit()
        db.refresh(script)

        return script

    except Exception as e:
        logger.error(f"❌ An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@app.delete("/v1/delete-script/{script_id}/", tags=["🗑️ Delete Script"],
            summary="Delete a script.",
            description="This endpoint allows you to delete a script by its ID.")
def delete_script(script_id: uuid.UUID, db: Session = Depends(get_db)):
    """
    Endpoint to delete a script by its ID.
    """
    try:
        script = db.query(ScriptMetadata).filter(ScriptMetadata.id == script_id).first()
        if not script:
            raise HTTPException(status_code=404, detail="Script not found")

        db.delete(script)
        db.commit()

        return {"detail": "Script deleted successfully"}

    except Exception as e:
        logger.error(f"❌ An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@app.post("/v1/like-script/{script_id}/", tags=["👍 Like Script"],
          summary="Like a script.",
          description="This endpoint allows you to like a script by its ID.")
def like_script(script_id: uuid.UUID, request: Request, db: Session = Depends(get_db)):
    """
    Endpoint to like a script by its ID.
    """
    try:
        ip_address = request.client.host

        # Check if the IP address has already liked the script
        ip_like = db.query(IPLikes).filter(IPLikes.ip_address == ip_address, IPLikes.script_id == script_id).first()
        if ip_like:
            raise HTTPException(status_code=400, detail="IP address has already liked this script.")

        # Add the like
        new_like = IPLikes(ip_address=ip_address, script_id=script_id)
        db.add(new_like)

        # Update the like count
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
        logger.error(f"❌ An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@app.get("/v1/get-script-likes/{script_id}/", tags=["👍 Get Script Likes"],
         summary="Get script likes.",
         description="This endpoint allows you to get the number of likes for a script by its ID.")
def get_script_likes(script_id: uuid.UUID, db: Session = Depends(get_db)):
    """
    Endpoint to get the number of likes for a script by its ID.
    """
    try:
        script_like = db.query(ScriptLikes).filter(ScriptLikes.script_id == script_id).first()
        if not script_like:
            return {"script_id": script_id, "like_count": 0}
        return {"script_id": script_id, "like_count": script_like.like_count}
    except Exception as e:
        logger.error(f"❌ An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@app.get("/v1/get-script-downvotes/{script_id}/", tags=["👎 Get Script Downvotes"],
         summary="Get script downvotes.",
         description="This endpoint allows you to get the number of downvotes for a script by its ID.")
def get_script_downvotes(script_id: uuid.UUID, db: Session = Depends(get_db)):
    """
    Endpoint to get the number of downvotes for a script by its ID.
    """
    try:
        script_downvote = db.query(ScriptDownvotes).filter(ScriptDownvotes.script_id == script_id).first()
        if not script_downvote:
            return {"script_id": script_id, "downvote_count": 0}
        return {"script_id": script_id, "downvote_count": script_downvote.downvote_count}
    except Exception as e:
        logger.error(f"❌ An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@app.post("/v1/downvote-script/{script_id}/", tags=["👎 Downvote Script"],
          summary="Downvote a script.",
          description="This endpoint allows you to downvote a script by its ID.")
def downvote_script(script_id: uuid.UUID, request: Request, db: Session = Depends(get_db)):
    """
    Endpoint to downvote a script by its ID.
    """
    try:
        ip_address = request.client.host

        # Check if the IP address has already down-voted the script
        ip_downvote = db.query(IPDownvotes).filter(IPDownvotes.ip_address == ip_address,
                                                   IPDownvotes.script_id == script_id).first()
        if ip_downvote:
            raise HTTPException(status_code=400, detail="IP address has already downvoted this script.")

        # Add the downvote
        new_downvote = IPDownvotes(ip_address=ip_address, script_id=script_id)
        db.add(new_downvote)

        # Update the downvote count
        script_downvote = db.query(ScriptDownvotes).filter(ScriptDownvotes.script_id == script_id).first()
        if script_downvote:
            script_downvote.downvote_count += 1
        else:
            script_downvote = ScriptDownvotes(script_id=script_id, downvote_count=1)
            db.add(script_downvote)

        # Check if the script should be deleted
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
        logger.error(f"❌ An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")



@app.get("/v1/recent-scripts/", tags=["🆕 Recent Scripts"],
         summary="Get recently uploaded scripts.",
         description="This endpoint allows you to retrieve the most recently uploaded scripts from the last 24 hours.")
def get_recent_scripts(limit: int = 10, db: Session = Depends(get_db)):
    """
    Endpoint to retrieve the most recently uploaded scripts from the last 24 hours.
    """
    try:
        twenty_four_hours_ago = datetime.now(timezone.utc) - timedelta(hours=24)
        recent_scripts = db.query(ScriptMetadata).filter(ScriptMetadata.upload_time >= twenty_four_hours_ago).order_by(desc(ScriptMetadata.upload_time)).limit(limit).all()
        return recent_scripts
    except Exception as e:
        logger.error(f"❌ An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.get("/v1/trending-scripts/", tags=["🔥 Trending Scripts"],
         summary="Get trending scripts.",
         description="This endpoint allows you to retrieve the scripts with the highest number of likes.")
def get_trending_scripts(limit: int = 10, db: Session = Depends(get_db)):
    """
    Endpoint to retrieve the scripts with the highest number of likes.
    """
    try:
        trending_scripts = db.query(ScriptMetadata).join(ScriptLikes,
                                                         ScriptMetadata.id == ScriptLikes.script_id).filter(
            ScriptLikes.like_count > 100).order_by(desc(ScriptLikes.like_count)).limit(limit).all()
        return trending_scripts
    except Exception as e:
        logger.error(f"❌ An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@app.get("/v1/get-script-by-id/{script_id}/", tags=["📜 Get Script by ID"])
def get_script_by_id(script_id: uuid.UUID, db: Session = Depends(get_db)):
    """
    Retrieve a script by its ID.
    """
    try:
        script = db.query(ScriptMetadata).filter(ScriptMetadata.id == script_id).first()
        if not script:
            raise HTTPException(status_code=404, detail="Script not found")
        return script
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@app.get("/v1/analytics/", tags=["📊 Analytics"], response_model=AnalyticsResponse)
def get_analytics(db: Session = Depends(get_db)):
    """Get analytics and metrics."""
    try:
        total_scripts = db.query(ScriptMetadata).count()
        total_likes = db.query(ScriptLikes).with_entities(func.sum(ScriptLikes.like_count)).scalar() or 0
        most_liked_script = db.query(ScriptMetadata).join(ScriptLikes,
                                                          ScriptMetadata.id == ScriptLikes.script_id).order_by(
            desc(ScriptLikes.like_count)).first()
        recent_uploads = db.query(ScriptMetadata).filter(
            ScriptMetadata.upload_time >= datetime.now(timezone.utc) - timedelta(days=7)).count()
        trending_scripts = db.query(ScriptMetadata).join(ScriptLikes,
                                                         ScriptMetadata.id == ScriptLikes.script_id).filter(
            ScriptLikes.like_count > 100).count()

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
        logger.error(f"❌ An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)
