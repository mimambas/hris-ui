/**
 * Indonesian statutory payroll calculation (PRD Module 5 + Appendix A/B).
 *
 * All functions are pure and unit-tested by `scripts/test-payroll.mjs`.
 * Monetary values are integer IDR rupiah.
 *
 * Reference rules implemented here:
 * - PTKP annual (UU HPP, 2022 onward): 54,000,000 base + 4,500,000 spouse
 *   + 4,500,000 for each of up to 3 dependants.
 * - Progressive annual PPh 21 headline-bracket rates (5/15/20/25/30%).
 * - BPJS Kesehatan: employee 1% / employer 4% on a wage cap of 12,000,000.
 * - BPJS JHT: employee 2% / employer 3.7% on a wage cap of 10,034,700.
 * - BPJS JP: employee 1% / employer 2% on a wage cap of 10,545,600.
 * - THR: prorated by calendar months worked (PP 78/2015).
 * - Overtime multipliers: 1.5x weekday, 2x first 8 rest hours, 3x holiday and 4x public holiday.
 */

export const PTKP = { base: 54_000_000, spouse: 4_500_000, dependant: 4_500_000, maxDependants: 3 };
export const BPJS_CAPS = { health: 12_000_000, jht: 10_034_700, pension: 10_545_600 };
export const RATES = { healthEmployee: 0.01, healthEmployer: 0.04, jhtEmployee: 0.02, jhtEmployer: 0.037, pensionEmployee: 0.01, pensionEmployer: 0.02 };
export const PPH21_BRACKETS = [
  { upTo: 60_000_000, base: 0, rate: 0.05 },
  { upTo: 250_000_000, base: 3_000_000, rate: 0.15 },
  { upTo: 500_000_000, base: 31_500_000, rate: 0.20 },
  { upTo: 5_000_000_000, base: 81_500_000, rate: 0.25 },
  { upTo: Infinity, base: 1_331_500_000, rate: 0.30 },
];

const r = (amount: number) => Math.round(amount);

export function ptkpAnnual(married: boolean, dependants: number): number {
  const dependantCount = Math.max(0, Math.min(PTKP.maxDependants, dependants));
  return PTKP.base + (married ? PTKP.spouse : 0) + dependantCount * PTKP.dependant;
}

export function pph21Annual(taxableAnnual: number): number {
  const income = Math.max(0, taxableAnnual);
  const bracket = PPH21_BRACKETS.find((item) => income <= item.upTo) ?? PPH21_BRACKETS[PPH21_BRACKETS.length - 1];
  return Math.max(0, r(bracket.base + bracket.rate * (income - (bracket.base ? bracket.base / bracket.rate : 0))));
}

/** Monthly payroll: gross is annualised through PTKP + progressive tax, then prorated to 12 months. */
export function pph21Monthly(grossAnnualised: number, married = false, dependants = 0): number {
  const taxable = Math.max(0, grossAnnualised - ptkpAnnual(married, dependants));
  return Math.max(0, r(pph21Annual(taxable) / 12));
}

export function bpjsKesehatan(gross: number) {
  const wage = Math.min(gross, BPJS_CAPS.health);
  return { employee: r(wage * RATES.healthEmployee), employer: r(wage * RATES.healthEmployer) };
}
export function bpjsJht(gross: number) {
  const wage = Math.min(gross, BPJS_CAPS.jht);
  return { employee: r(wage * RATES.jhtEmployee), employer: r(wage * RATES.jhtEmployer) };
}
export function bpjsJp(gross: number) {
  const wage = Math.min(gross, BPJS_CAPS.pension);
  return { employee: r(wage * RATES.pensionEmployee), employer: r(wage * RATES.pensionEmployer) };
}

/** PRD 5.1: overtime multipliers on hourly base salary. */
export function overtimePay(hourlyBase: number, hours: number, kind: 'weekday' | 'rest' | 'holiday' = 'weekday'): number {
  const multiplier = kind === 'weekday' ? 1.5 : kind === 'rest' ? 2 : 3;
  return r(hourlyBase * multiplier * hours);
}

/** PRD 5.5: THR = (basic + fixed allowances) × months worked / 12, only after 1 month tenure. */
export function thrPay(basicMonthly: number, fixedAllowanceMonthly: number, monthsWorked: number): number {
  if (monthsWorked < 1) return 0;
  return r((basicMonthly + fixedAllowanceMonthly) * (Math.min(12, monthsWorked) / 12));
}

export function calculatePayroll(input: {
  basicSalary: number; allowance?: number; overtimeHours?: number; overtimeKind?: 'weekday' | 'rest' | 'holiday';
  otherDeduction?: number; monthsWorked?: number; married?: boolean; dependants?: number; includeThr?: boolean;
}) {
  const basic = Math.max(0, Number(input.basicSalary ?? 0));
  const allowance = Math.max(0, Number(input.allowance ?? 0));
  const monthlyGross = basic + allowance;
  const grossAnnualised = monthlyGross * 12;
  const hourly = basic / 173.33;
  const overtime = overtimePay(hourly, Number(input.overtimeHours ?? 0), input.overtimeKind);
  const pph21 = pph21Monthly(grossAnnualised, input.married, input.dependants);
  const health = bpjsKesehatan(monthlyGross);
  const jht = bpjsJht(monthlyGross);
  const jp = bpjsJp(monthlyGross);
  const thr = input.includeThr ? thrPay(basic, allowance, Number(input.monthsWorked ?? 12)) : 0;
  const gross = monthlyGross + overtime + thr;
  const deductions = pph21 + health.employee + jht.employee + jp.employee + Math.max(0, Number(input.otherDeduction ?? 0));
  return {
    basic_salary: basic, allowance, overtime, gross_salary: gross, thr,
    pph21, bpjs_kes: health.employee, bpjs_tk: jht.employee + jp.employee, jp_employee: jp.employee,
    other_deduction: Math.max(0, Number(input.otherDeduction ?? 0)), net_salary: Math.max(0, gross - deductions),
    employer_bpjs: health.employer + jht.employer + jp.employer,
  };
}
