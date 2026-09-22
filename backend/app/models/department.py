import uuid
from datetime import datetime

from sqlalchemy import String, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.user import TimestampMixin, UUIDPrimaryKeyMixin


class Department(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "departments"

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    parent_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("departments.id"), nullable=True
    )
    head_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
    cost_center: Mapped[str | None] = mapped_column(String(50), nullable=True)

    parent = relationship("Department", remote_side="Department.id", back_populates="children")
    children = relationship("Department", back_populates="parent")


class Position(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "positions"

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    level: Mapped[int | None] = mapped_column(nullable=True)
    grade: Mapped[str | None] = mapped_column(String(10), nullable=True)
    department_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("departments.id"), nullable=False
    )
    min_salary: Mapped[float | None] = mapped_column(nullable=True)
    max_salary: Mapped[float | None] = mapped_column(nullable=True)

    department = relationship("Department")
