import re


def validate_nik(nik: str) -> bool:
    """NIK: 16 digit numeric"""
    return bool(re.match(r"^\d{16}$", nik))


def validate_npwp(npwp: str) -> bool:
    """NPWP: XX.XXX.XXX.X-XXX.XXX (15 digits with formatting)"""
    cleaned = re.sub(r"[.\-]", "", npwp)
    return bool(re.match(r"^\d{15}$", cleaned))


def generate_employee_id(db_date_str: str, sequence: int) -> str:
    """Format: EMP-YYYYMMDD-XXX"""
    return f"EMP-{db_date_str}-{sequence:03d}"
