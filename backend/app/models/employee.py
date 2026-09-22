import uuid
from datetime import date, datetime

from sqlalchemy import String, ForeignKey, Numeric, Date, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.user import TimestampMixin, UUIDPrimaryKeyMixin


class Employee(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "employees"

    # Identity
    employee_id: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    nik: Mapped[str | None] = mapped_column(String(16), unique=True, nullable=True)
    npwp: Mapped[str | None] = mapped_column(String(20), unique=True, nullable=True)

    # Personal
    place_of_birth: Mapped[str | None] = mapped_column(String(100), nullable=True)
    date_of_birth: Mapped[date | None] = mapped_column(Date, nullable=True)
    gender: Mapped[str | None] = mapped_column(String(20), nullable=True)
    blood_type: Mapped[str | None] = mapped_column(String(5), nullable=True)
    religion: Mapped[str | None] = mapped_column(String(50), nullable=True)
    marital_status: Mapped[str | None] = mapped_column(String(20), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    email: Mapped[str | None] = mapped_column(String(200), unique=True, nullable=True)
    address_ktp: Mapped[str | None] = mapped_column(Text, nullable=True)
    address_domisili: Mapped[str | None] = mapped_column(Text, nullable=True)
    emergency_contact_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    emergency_contact_phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    emergency_contact_relation: Mapped[str | None] = mapped_column(String(50), nullable=True)

    # Employment
    join_date: Mapped[date] = mapped_column(Date, nullable=False)
    contract_start: Mapped[date | None] = mapped_column(Date, nullable=True)
    contract_end: Mapped[date | None] = mapped_column(Date, nullable=True)
    probation_end: Mapped[date | None] = mapped_column(Date, nullable=True)
    employment_status: Mapped[str] = mapped_column(String(20), nullable=False, default="contract")
    employment_type: Mapped[str] = mapped_column(String(20), nullable=False, default="full-time")
    department_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("departments.id"), nullable=True
    )
    position_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("positions.id"), nullable=True
    )
    reporting_to: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
    branch: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Compensation
    base_salary: Mapped[float | None] = mapped_column(Numeric(15, 2), nullable=True)
    bank_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    bank_account: Mapped[str | None] = mapped_column(String(50), nullable=True)
    bank_account_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    bpjs_kesehatan_no: Mapped[str | None] = mapped_column(String(30), nullable=True)
    bpjs_ketenagakerjaan_no: Mapped[str | None] = mapped_column(String(30), nullable=True)

    # Status
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active")

    # Relationships
    department = relationship("Department")
    position = relationship("Position")
