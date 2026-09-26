import assert from 'node:assert/strict';
import { bpjsJht, bpjsKesehatan, bpjsJp, calculatePayroll, overtimePay, pph21Monthly, ptkpAnnual, thrPay } from '../src/lib/payroll.ts';

// --- PTKP (UU HPP) ---
assert.equal(ptkpAnnual(false, 0), 54_000_000, 'single no dependant');
assert.equal(ptkpAnnual(true, 0), 58_500_000, 'married spouse only');
assert.equal(ptkpAnnual(true, 9), 72_000_000, 'dependants capped at 3');

// --- BPJS caps ---
assert.equal(bpjsKesehatan(100_000_000).employee, 120_000, 'health cap 12m x 1%');
assert.equal(bpjsKesehatan(100_000_000).employer, 480_000, 'health employer 4%');
assert.equal(bpjsKesehatan(1_000_000).employee, 10_000, 'health under cap');
assert.equal(bpjsJht(100_000_000).employee, 200_694, 'JHT employee capped');
assert.equal(bpjsJp(100_000_000).employee, 105_456, 'JP employee capped');

// --- Progressive PPh 21 ---
assert.equal(pph21Monthly(50_000_000), 0, 'below PTKP yields zero');
assert.equal(pph21Monthly(54_000_000), 0, 'at PTKP yields zero');
const high = pph21Monthly(1_000_000_000);
assert.ok(high > 0, 'taxable income pays tax');
assert.ok(pph21Monthly(600_000_000) > pph21Monthly(300_000_000), 'progressive increases with income');

// --- Overtime (PRD 5.1) ---
const hourly = 1_000;
assert.equal(overtimePay(hourly, 2, 'weekday'), 3_000, '1.5x weekday');
assert.equal(overtimePay(hourly, 2, 'rest'), 4_000, '2x rest day');
assert.equal(overtimePay(hourly, 2, 'holiday'), 6_000, '3x holiday');
assert.equal(overtimePay(hourly, 0, 'weekday'), 0, 'zero hours pays nothing');

// --- THR (PRD 5.5) ---
assert.equal(thrPay(10_000_000, 1_000_000, 0), 0, 'no THR under one month');
assert.equal(thrPay(10_000_000, 1_000_000, 6), 5_500_000, 'half-year proration');
assert.equal(thrPay(10_000_000, 1_000_000, 18), 11_000_000, 'months capped at 12');

// --- Full payroll invariant ---
const payroll = calculatePayroll({ basicSalary: 10_000_000, allowance: 1_000_000, overtimeHours: 10, includeThr: true, monthsWorked: 12 });
assert.equal(payroll.basic_salary, 10_000_000);
assert.equal(payroll.allowance, 1_000_000);
assert.ok(payroll.overtime > 0, 'overtime computed from hourly base');
assert.ok(payroll.gross_salary >= payroll.basic_salary + payroll.allowance, 'gross includes overtime and THR');
const totalDeductions = payroll.pph21 + payroll.bpjs_kes + payroll.bpjs_tk + payroll.other_deduction;
assert.equal(payroll.net_salary, payroll.gross_salary - totalDeductions, 'net = gross - deductions');
assert.ok(payroll.net_salary >= 0, 'net never negative');
assert.ok(payroll.employer_bpjs > 0, 'employer BPJS reported');

console.log('All payroll statutory tests passed.');
