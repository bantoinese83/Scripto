import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field
from pydantic.v1 import validator


# --- Pydantic Models ---
class UpdateMetadata(BaseModel):
    title: Optional[str]
    language: Optional[str]
    tags: Optional[str]
    description: Optional[str]
    how_it_works: Optional[str]
    category: Optional[str]

    class Config:
        str_min_length = 1
        str_strip_whitespace = True


class ScriptMetadataIn(BaseModel):
    title: str = Field(..., min_length=3, max_length=100)
    language: str = Field(..., min_length=2, max_length=50)
    tags: str = Field(..., min_length=3)
    description: str = Field(..., min_length=10)
    how_it_works: str = Field(..., min_length=10)
    category: str = Field(..., min_length=3, max_length=50)
    script_content: str = Field(..., min_length=1)

    @validator('tags')
    def validate_tags(cls, v):
        tags = [tag.strip() for tag in v.split(',')]
        if not tags:
            raise ValueError("At least one tag is required.")
        return ','.join(tags)

    class Config:
        str_min_length = 1
        str_strip_whitespace = True


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


class ScriptRequestModel(BaseModel):
    title: str
    description: str
    language: Optional[str] = None
    tags: Optional[str] = None

    class Config:
        validate_assignment = True
        str_min_length = 1
        str_strip_whitespace = True
