from pydantic import BaseModel, Field, EmailStr
from datetime import date, datetime
from uuid import UUID


class EmployeeCreate(BaseModel):
    full_name: str = Field(..., max_length=200)
    nik: str | None = Field(None, max_length=16)
    npwp: str | None = Field(None, max_length=20)
    place_of_birth: str | None = None
    date_of_birth: date | None = None
    gender: str | None = None
    phone: str | None = None
    email: EmailStr | None = None
    address_ktp: str | None = None
    address_domisili: str | None = None
    emergency_contact_name: str | None = None
    emergency_contact_phone: str | None = None
    emergency_contact_relation: str | None = None
    join_date: date
    contract_start: date | None = None
    contract_end: date | None = None
    probation_end: date | None = None
    employment_status: str = "contract"
    employment_type: str = "full-time"
    department_id: UUID | None = None
    position_id: UUID | None = None
    reporting_to: UUID | None = None
    branch: str | None = None
    base_salary: float | None = None
    bank_name: str | None = None
    bank_account: str | None = None
    bank_account_name: str | None = None


class EmployeeUpdate(BaseModel):
    full_name: str | None = None
    nik: str | None = None
    npwp: str | None = None
    phone: str | None = None
    email: EmailStr | None = None
    address_ktp: str | None = None
    address_domisili: str | None = None
    emergency_contact_name: str | None = None
    emergency_contact_phone: str | None = None
    employment_status: str | None = None
    department_id: UUID | None = None
    position_id: UUID | None = None
    reporting_to: UUID | None = None
    base_salary: float | None = None
    bank_name: str | None = None
    bank_account: str | None = None
    bank_account_name: str | None = None
    status: str | None = None


class EmployeeResponse(BaseModel):
    id: UUID
    employee_id: str
    full_name: str
    nik: str | None
    email: str | None
    phone: str | None
    join_date: date
    employment_status: str
    department_id: UUID | None
    position_id: UUID | None
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class EmployeeDetailResponse(EmployeeResponse):
    npwp: str | None = None
    place_of_birth: str | None = None
    date_of_birth: date | None = None
    gender: str | None = None
    religion: str | None = None
    marital_status: str | None = None
    address_ktp: str | None = None
    address_domisili: str | None = None
    emergency_contact_name: str | None = None
    emergency_contact_phone: str | None = None
    emergency_contact_relation: str | None = None
    contract_start: date | None = None
    contract_end: date | None = None
    probation_end: date | None = None
    employment_type: str | None = None
    reporting_to: UUID | None = None
    branch: str | None = None
    base_salary: float | None = None
    bank_name: str | None = None
    bank_account: str | None = None
    bank_account_name: str | None = None
    bpjs_kesehatan_no: str | None = None
    bpjs_ketenagakerjaan_no: str | None = None
