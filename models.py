import hashlib
import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey, Boolean, Index
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
    script_content = Column(Text)
    script_content_hash = Column(String, index=True)
    category = Column(String)
    upload_time = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        Index('ix_script_content_hash', 'script_content_hash'),
    )

    def __repr__(self):
        return f"<ScriptMetadata id={self.id} title={self.title}>"

    @staticmethod
    def compute_hash(content: str) -> str:
        return hashlib.md5(content.encode('utf-8')).hexdigest()


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
