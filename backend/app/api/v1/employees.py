import math
from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.employee import Employee
from app.models.department import Department, Position
from app.schemas.employee import EmployeeCreate, EmployeeUpdate, EmployeeResponse, EmployeeDetailResponse
from app.schemas.common import PaginatedResponse
from app.dependencies import CurrentUser, RequireAdmin, RequireHRManager
from app.utils.audit import log_audit
from app.utils.validators import validate_nik, validate_npwp, generate_employee_id

router = APIRouter(prefix="/employees", tags=["Employees"])


async def _get_employee_or_404(db: AsyncSession, employee_db_id: str) -> Employee:
    emp = await db.get(Employee, employee_db_id)
    if not emp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    return emp


@router.get("", response_model=PaginatedResponse[EmployeeResponse])
async def list_employees(
    db: Annotated[AsyncSession, Depends(get_db)],
    user: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: str | None = None,
    status_filter: str | None = Query(None, alias="status"),
    department_id: str | None = None,
):
    query = select(Employee)
    count_query = select(func.count(Employee.id))

    if search:
        like = f"%{search}%"
        query = query.where(or_(Employee.full_name.ilike(like), Employee.employee_id.ilike(like)))
        count_query = count_query.where(or_(Employee.full_name.ilike(like), Employee.employee_id.ilike(like)))
    if status_filter:
        query = query.where(Employee.status == status_filter)
        count_query = count_query.where(Employee.status == status_filter)
    if department_id:
        query = query.where(Employee.department_id == department_id)
        count_query = count_query.where(Employee.department_id == department_id)

    total = (await db.execute(count_query)).scalar() or 0
    query = query.order_by(Employee.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    items = result.scalars().all()

    return PaginatedResponse(
        items=[EmployeeResponse.model_validate(i) for i in items],
        total=total,
        page=page,
        per_page=per_page,
        total_pages=math.ceil(total / per_page),
    )


@router.get("/{employee_db_id}", response_model=EmployeeDetailResponse)
async def get_employee(
    employee_db_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: CurrentUser,
):
    emp = await _get_employee_or_404(db, employee_db_id)
    return EmployeeDetailResponse.model_validate(emp)


@router.post("", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
async def create_employee(
    data: EmployeeCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: RequireAdmin,
):
    if data.nik and not validate_nik(data.nik):
        raise HTTPException(status_code=400, detail="NIK must be 16 digits")
    if data.npwp and not validate_npwp(data.npwp):
        raise HTTPException(status_code=400, detail="Invalid NPWP format")

    # Generate employee_id
    date_str = date.today().strftime("%Y%m%d")
    count_result = await db.execute(
        select(func.count(Employee.id)).where(Employee.employee_id.like(f"EMP-{date_str}-%"))
    )
    seq = (count_result.scalar() or 0) + 1
    emp = Employee(
        employee_id=generate_employee_id(date_str, seq),
        **data.model_dump(exclude_unset=True),
    )
    db.add(emp)
    await db.flush()
    await log_audit(db, str(user.id), "employee", str(emp.id), "create", new_value=data.model_dump())
    await db.commit()
    await db.refresh(emp)
    return EmployeeResponse.model_validate(emp)


@router.put("/{employee_db_id}", response_model=EmployeeResponse)
async def update_employee(
    employee_db_id: str,
    data: EmployeeUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: RequireAdmin,
):
    emp = await _get_employee_or_404(db, employee_db_id)
    old_data = {c.name: getattr(emp, c.name) for c in Employee.__table__.columns}
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(emp, field, value)
    await log_audit(db, str(user.id), "employee", str(emp.id), "update", old_value=old_data, new_value=update_data)
    await db.commit()
    await db.refresh(emp)
    return EmployeeResponse.model_validate(emp)


@router.delete("/{employee_db_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deactivate_employee(
    employee_db_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: RequireHRManager,
):
    emp = await _get_employee_or_404(db, employee_db_id)
    old_status = emp.status
    emp.status = "inactive"
    await log_audit(db, str(user.id), "employee", str(emp.id), "deactivate", old_value={"status": old_status}, new_value={"status": "inactive"})
    await db.commit()
