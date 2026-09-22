import uuid
from datetime import date, datetime

from sqlalchemy import String, ForeignKey, Date, Numeric, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.user import UUIDPrimaryKeyMixin


class AttendanceRecord(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "attendance_records"

    employee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employees.id"), nullable=False, index=True
    )
    date: Mapped[date] = mapped_column(Date, nullable=False)
    check_in: Mapped[datetime | None] = mapped_column(nullable=True)
    check_out: Mapped[datetime | None] = mapped_column(nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="present")
    overtime_hours: Mapped[float] = mapped_column(Numeric(5, 2), default=0)
    late_minutes: Mapped[int] = mapped_column(default=0)
    source: Mapped[str] = mapped_column(String(20), default="web")
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    employee = relationship("Employee")


class LeaveRequest(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "leave_requests"

    employee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employees.id"), nullable=False, index=True
    )
    leave_type: Mapped[str] = mapped_column(String(10), nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    total_days: Mapped[float] = mapped_column(Numeric(4, 1), nullable=False)
    reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    attachment_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="pending")
    approved_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
    approved_at: Mapped[datetime | None] = mapped_column(nullable=True)
    rejection_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    employee = relationship("Employee")


class LeaveBalance(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "leave_balances"

    employee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employees.id"), nullable=False, index=True
    )
    leave_type: Mapped[str] = mapped_column(String(10), nullable=False)
    year: Mapped[int] = mapped_column(nullable=False)
    total_days: Mapped[float] = mapped_column(Numeric(4, 1), nullable=False)
    used_days: Mapped[float] = mapped_column(Numeric(4, 1), default=0)

    employee = relationship("Employee")
