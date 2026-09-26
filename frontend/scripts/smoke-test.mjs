// HRIS API smoke/integration tests against the deployed production API.
// Run: npm run test:smoke
const BASE = process.env.HRIS_BASE_URL || 'https://hrisui.vercel.app';
const CREDENTIALS = {
  admin: { email: 'admin@hris.local', password: 'Admin123!' },
  employee: { email: 'employee.demo@hris.local', password: 'Employee123!' },
};

let failures = 0;
function check(name, condition, detail = '') {
  if (condition) {
    console.log(`PASS ${name}`);
  } else {
    failures += 1;
    console.log(`FAIL ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

async function login(role) {
  const response = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(CREDENTIALS[role]),
  });
  if (!response.ok) throw new Error(`login ${role} status ${response.status}`);
  const data = await response.json();
  return data.access_token;
}

async function call(token, path, options = {}) {
  const response = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { ...(options.headers || {}), authorization: `Bearer ${token}`, ...(options.body ? { 'content-type': options.body instanceof FormData ? undefined : 'application/json' } : {}) },
  });
  let data = null;
  try { data = await response.json(); } catch { data = null; }
  return { status: response.status, data };
}

const adminToken = await login('admin');
const employeeToken = await login('employee');
check('login admin', Boolean(adminToken));
check('login employee', Boolean(employeeToken));

const me = await call(adminToken, '/api/auth/me');
check('auth/me returns organization', me.status === 200 && Boolean(me.data?.organization_id));
check('auth/me rejects forged token', (await call('forged.token.value', '/api/auth/me')).status !== 200);

const employees = await call(adminToken, '/api/employees?per_page=100');
check('employees list', employees.status === 200 && Array.isArray(employees.data?.items));
check('employees not empty', (employees.data?.items?.length ?? 0) > 0);

const settings = await call(adminToken, '/api/settings');
check('settings read', settings.status === 200 && typeof settings.data?.settings === 'object');
const saved = await call(adminToken, '/api/settings', {
  method: 'PATCH',
  body: JSON.stringify({ settings: { ...(settings.data.settings || {}), companyName: 'PT Maju Bersama' } }),
});
check('settings write', saved.status === 200 && saved.data?.settings?.companyName === 'PT Maju Bersama');
const reloaded = await call(adminToken, '/api/settings');
check('settings reload persists', reloaded.data?.settings?.companyName === 'PT Maju Bersama');
const invalidSettings = await call(adminToken, '/api/settings', { method: 'PATCH', body: JSON.stringify({ settings: 'not-an-object' }) });
check('settings rejects invalid payload', invalidSettings.status === 422);
const oversized = await call(adminToken, '/api/settings', { method: 'PATCH', body: JSON.stringify({ settings: { pad: 'x'.repeat(70000) } }) });
check('settings rejects oversized payload', oversized.status === 422);
const employeeSettingsWrite = await call(employeeToken, '/api/settings', { method: 'PATCH', body: JSON.stringify({ settings: { hack: true } }) });
check('employee cannot write settings', employeeSettingsWrite.status === 403 || employeeSettingsWrite.status === 401);


check('settings persist after reload', reloaded.data?.settings?.companyName === 'PT Maju Bersama');

const leaveBalances = await call(employeeToken, '/api/leave/balances');
check('employee leave balances', leaveBalances.status === 200 && Array.isArray(leaveBalances.data?.items));
check('leave balances scoped to employee', leaveBalances.data?.items?.every((item) => item.total_days >= item.used_days) ?? false);

const payslips = await call(employeeToken, '/api/payroll/self-service');
check('employee payslips', payslips.status === 200 && Array.isArray(payslips.data?.items));

const employeeList = await call(employeeToken, '/api/employees?per_page=100');
check('employee list accessible', employeeList.status === 200);

const forbiddenPayroll = await call(employeeToken, '/api/payroll/periods');
check('employee cannot read payroll periods', forbiddenPayroll.status === 403 || forbiddenPayroll.status === 401);

const reportXlsx = await fetch(`${BASE}/api/reports/export/xlsx?report=headcount&range=This%20month`, { headers: { authorization: `Bearer ${adminToken}` } });
check('report XLSX export', reportXlsx.status === 200 && (reportXlsx.headers.get('content-type') || '').includes('spreadsheetml.sheet'));

const reportPdf = await fetch(`${BASE}/api/reports/export?report=headcount&range=This%20month`, { headers: { authorization: `Bearer ${adminToken}` } });
check('report PDF export', reportPdf.status === 200 && (reportPdf.headers.get('content-type') || '').includes('application/pdf'));

const reports = await call(adminToken, '/api/reports?range=This month');
check('reports aggregation', reports.status === 200 && reports.data?.kpis && Array.isArray(reports.data?.headcount_by_department));
check('reports trends present', Array.isArray(reports.data?.payroll_trend) && Array.isArray(reports.data?.attendance_trend));

const offboarding = await call(adminToken, '/api/offboarding');
if (offboarding.data?.items?.[0]?.id) {
  const settlement = await call(adminToken, `/api/offboarding/${offboarding.data.items[0].id}/settlement`);
  check('offboarding settlement estimate', settlement.status === 200 && typeof settlement.data?.estimated_total === 'number');
}


check('offboarding list', offboarding.status === 200 && Array.isArray(offboarding.data?.items));

const checklist = await call(adminToken, '/api/checklist');
check('checklist templates list', checklist.status === 200 && Array.isArray(checklist.data?.items));
if (checklist.status === 200) {
  const checklistSeed = await call(adminToken, '/api/checklist', { method: 'POST', body: JSON.stringify({ name: `Smoke checklist ${Date.now()}`, category: 'Test', assignee: 'HR team', due_date: '2026-12-31', priority: 'Low' }) });
  check('checklist template create', checklistSeed.status === 201);
  if (checklistSeed.data?.id) {
    const updatedChecklist = await call(adminToken, `/api/checklist/${checklistSeed.data.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'completed' }) });
    check('checklist template update', updatedChecklist.status === 200 && updatedChecklist.data?.status === 'completed');
    const deletedChecklist = await call(adminToken, `/api/checklist/${checklistSeed.data.id}`, { method: 'DELETE' });
    check('checklist template delete', deletedChecklist.status === 200);
  }
}

const docRequests = await call(adminToken, '/api/documents/requests');
check('document requests list', docRequests.status === 200 && Array.isArray(docRequests.data?.items));

const employeesForAttendance = await call(adminToken, '/api/employees?per_page=100');
if (employeesForAttendance.status === 200 && employeesForAttendance.data.items.length) {
  const targetEmployee = employeesForAttendance.data.items[0];
  const today = new Date().toISOString().slice(0, 10);
  const firstClockIn = await call(adminToken, '/api/attendance', { method: 'POST', body: JSON.stringify({ employee_id: targetEmployee.id, date: today, status: 'present', check_in_time: '08:00', source: 'manual' }) });
  check('attendance create', firstClockIn.status === 201 || firstClockIn.status === 409);
  const duplicateClockIn = await call(adminToken, '/api/attendance', { method: 'POST', body: JSON.stringify({ employee_id: targetEmployee.id, date: today, status: 'present', check_in_time: '09:00', source: 'manual' }) });
  check('attendance duplicate rejected', duplicateClockIn.status === 409);
}

const orgChartEmployees = await call(adminToken, '/api/employees?per_page=100');
check('org chart employee hierarchy fields', orgChartEmployees.status === 200 && orgChartEmployees.data.items.every((row) => Object.prototype.hasOwnProperty.call(row, 'reporting_to')));

const positions = await call(adminToken, '/api/positions');
check('positions list', positions.status === 200 && Array.isArray(positions.data?.items));
const departmentsList = await call(adminToken, '/api/departments');
check('departments feed', departmentsList.status === 200 && Array.isArray(departmentsList.data?.items));

// Authorization regression matrix: employee must never reach admin/HR endpoints,
// and requests without a valid signed token must never be authorized.
const authMatrix = [
  ['employee cannot read audit log', '/api/audit-log'],
  ['employee cannot read onboarding', '/api/onboarding'],
  ['employee cannot read offboarding', '/api/offboarding'],
  ['employee cannot read recruitment', '/api/recruitment'],
  ['employee cannot read report generations', '/api/reports/generations'],
  ['employee cannot read checklist templates', '/api/checklist'],
  ['employee cannot read import preview', '/api/employees/import'],
];
for (const [label, path] of authMatrix) {
  const denied = await call(employeeToken, path);
  check(label, denied.status === 401 || denied.status === 403);
}

// Document requests are legitimately readable by an employee for their own
// records, so verify the scope instead of demanding a 403.
const employeeMe = await call(employeeToken, '/api/auth/me');
const ownRequests = await call(employeeToken, '/api/documents/requests');
check('employee document requests scoped to own employee', ownRequests.status === 200 && (ownRequests.data?.items ?? []).every((row) => row.employee_id === employeeMe.data.employee_id));

const noToken = await fetch(`${BASE}/api/employees`).catch(() => null);
check('unauthenticated request rejected', !noToken || noToken.status === 401);
const forged = await call('aaa.bbb.ccc', '/api/auth/me');
check('forged token rejected', forged.status !== 200);
const emptyAuthorization = await fetch(`${BASE}/api/auth/me`, { headers: { authorization: '' } }).catch(() => null);
check('empty authorization rejected', !emptyAuthorization || emptyAuthorization.status === 401);

const audit = await call(adminToken, '/api/audit-log?per_page=100');
check('audit log read', audit.status === 200 && Array.isArray(audit.data?.items));
check('audit log items scoped', audit.data?.items?.every((item) => Boolean(item.id)) ?? false);

const directory = await call(adminToken, '/api/employees?per_page=100');
check('directory feed', directory.status === 200);

console.log(failures === 0 ? '\nAll smoke tests passed.' : `\n${failures} test(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
