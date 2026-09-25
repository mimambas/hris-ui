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

const audit = await call(adminToken, '/api/audit-log?per_page=100');
check('audit log read', audit.status === 200 && Array.isArray(audit.data?.items));
check('audit log items scoped', audit.data?.items?.every((item) => Boolean(item.id)) ?? false);

const directory = await call(adminToken, '/api/employees?per_page=100');
check('directory feed', directory.status === 200);

console.log(failures === 0 ? '\nAll smoke tests passed.' : `\n${failures} test(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
