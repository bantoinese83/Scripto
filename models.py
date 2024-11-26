import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID

from db_config import Base


# --- Database Models ---
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
    upload_time = Column(DateTime, default=lambda: datetime.now(timezone.utc))

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


class ScriptRequest(Base):
    __tablename__ = "script_requests"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    language = Column(String)
    tags = Column(String)
    is_fulfilled = Column(Boolean, default=False)
    request_time = Column(DateTime, default=lambda: datetime.now(timezone.utc))

