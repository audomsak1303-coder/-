import { FixedExpense, InstallmentItem, MonthSummary, UserFinancialProfile } from '../types/finance';

const STORAGE_KEYS = {
  FIXED_EXPENSES: 'thai_finance_fixed_expenses_v2',
  INSTALLMENTS: 'thai_finance_installments_v2',
  PROFILE: 'thai_finance_profile_v2',
};

const THAI_MONTH_NAMES_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
];

// Seed realistic data reflecting the user's explicit apps and expenses
export const DEFAULT_FIXED_EXPENSES: FixedExpense[] = [
  {
    id: 'fix-1',
    name: 'ค่าคอนโด / ค่าเช่าห้อง',
    category: 'housing',
    amount: 8500,
    dueDay: 1,
    active: true,
    notes: 'รวมค่าส่วนกลางแล้ว',
  },
  {
    id: 'fix-2',
    name: 'ค่าไฟฟ้า',
    category: 'utilities',
    amount: 1450,
    dueDay: 15,
    active: true,
    notes: 'เฉลี่ยรายเดือน',
  },
  {
    id: 'fix-3',
    name: 'ค่าน้ำประปา',
    category: 'utilities',
    amount: 180,
    dueDay: 18,
    active: true,
  },
  {
    id: 'fix-4',
    name: 'ค่าอินเทอร์เน็ตบ้าน & มือถือ',
    category: 'telecom',
    amount: 899,
    dueDay: 20,
    active: true,
  },
  {
    id: 'fix-5',
    name: 'ค่าเดินทาง / น้ำมัน',
    category: 'commute',
    amount: 2500,
    dueDay: 5,
    active: true,
  },
  {
    id: 'fix-6',
    name: 'งบกินอยู่ประจำวัน',
    category: 'personal',
    amount: 9000,
    dueDay: 1,
    active: true,
  },
];

export const DEFAULT_INSTALLMENTS: InstallmentItem[] = [
  {
    id: 'inst-1',
    title: 'Shopee SPayLater (เครื่องฟอกอากาศ & ของใช้)',
    provider: 'Shopee',
    monthlyAmount: 950,
    totalMonths: 6,
    paidMonths: 2, // Paid 2 of 6 (33% done, remaining 4)
    startYear: 2026,
    startMonth: 9,
    dueDay: 1,
    notes: 'ผ่อนดอกเบี้ย 0%',
  },
  {
    id: 'inst-2',
    title: 'Shopee SEasyCash (วงเงินหมุนเวียน)',
    provider: 'Shopee SEasyCash',
    monthlyAmount: 2150,
    totalMonths: 12,
    paidMonths: 4, // Paid 4 of 12 (33% done, remaining 8)
    startYear: 2026,
    startMonth: 7,
    dueDay: 5,
    notes: 'หักผ่านบัญชีอัตโนมัติ',
  },
  {
    id: 'inst-3',
    title: 'Lazada LazPayLater (แท็บเล็ตทำงาน)',
    provider: 'Lazada',
    monthlyAmount: 1420,
    totalMonths: 10,
    paidMonths: 3, // Paid 3 of 10 (30% done, remaining 7)
    startYear: 2026,
    startMonth: 8,
    dueDay: 10,
  },
  {
    id: 'inst-4',
    title: 'Thisshop T-PayLater (หูฟังไร้สาย & ลำโพง)',
    provider: 'Thisshop',
    monthlyAmount: 780,
    totalMonths: 8,
    paidMonths: 5, // Paid 5 of 8 (63% done, remaining 3)
    startYear: 2026,
    startMonth: 6,
    dueDay: 15,
  },
  {
    id: 'inst-5',
    title: 'อิออน AEON (เครื่องซักผ้าและตู้เย็น)',
    provider: 'AEON',
    monthlyAmount: 3200,
    totalMonths: 18,
    paidMonths: 7, // Paid 7 of 18 (39% done, remaining 11)
    startYear: 2026,
    startMonth: 4,
    dueDay: 2,
    notes: 'ตัดรอบทุกวันที่ 2 ของเดือน',
  },
];

export const DEFAULT_PROFILE: UserFinancialProfile = {
  monthlyIncome: 35000,
  currency: 'THB',
  salaryPayDay: 28,
  targetSavings: 5000,
};

export const loadFixedExpenses = (): FixedExpense[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FIXED_EXPENSES);
    if (!raw) return DEFAULT_FIXED_EXPENSES;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_FIXED_EXPENSES;
  }
};

export const saveFixedExpenses = (items: FixedExpense[]) => {
  localStorage.setItem(STORAGE_KEYS.FIXED_EXPENSES, JSON.stringify(items));
};

export const loadInstallments = (): InstallmentItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INSTALLMENTS);
    if (!raw) return DEFAULT_INSTALLMENTS;
    const parsed: InstallmentItem[] = JSON.parse(raw);
    return parsed.map((item) => {
      // Normalize paidMonths
      const paid = typeof item.paidMonths === 'number' 
        ? item.paidMonths 
        : typeof item.currentMonthIndex === 'number' 
          ? Math.max(0, item.currentMonthIndex - 1) 
          : 0;
      return {
        ...item,
        paidMonths: paid,
        isCompleted: paid >= item.totalMonths,
      };
    });
  } catch {
    return DEFAULT_INSTALLMENTS;
  }
};

export const saveInstallments = (items: InstallmentItem[]) => {
  localStorage.setItem(STORAGE_KEYS.INSTALLMENTS, JSON.stringify(items));
};

export const loadProfile = (): UserFinancialProfile => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROFILE;
  }
};

export const saveProfile = (profile: UserFinancialProfile) => {
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
};

export function calculate24MonthsForecast(
  fixedExpenses: FixedExpense[],
  installments: InstallmentItem[],
  baseYear = 2026,
  baseMonth = 10
): MonthSummary[] {
  const result: MonthSummary[] = [];

  const activeFixedTotal = fixedExpenses
    .filter((f) => f.active)
    .reduce((sum, f) => sum + f.amount, 0);

  for (let i = 0; i < 24; i++) {
    const totalMonthsOffset = baseMonth - 1 + i;
    const year = baseYear + Math.floor(totalMonthsOffset / 12);
    const month = (totalMonthsOffset % 12) + 1;
    const thaiYear = year + 543;
    const monthLabelThai = `${THAI_MONTH_NAMES_SHORT[month - 1]} ${thaiYear}`;
    const monthKey = `${year}-${String(month).padStart(2, '0')}`;

    let installmentTotal = 0;
    const byProvider: Record<string, number> = {};
    let activeInstallmentsCount = 0;
    const endingInstallments: string[] = [];

    installments.forEach((item) => {
      const paid = typeof item.paidMonths === 'number'
        ? item.paidMonths
        : Math.max(0, (item.currentMonthIndex || 1) - 1);

      // If already paid 100%, no more installments in future months
      if (paid >= item.totalMonths) {
        return;
      }

      // The evaluated installment for month offset i
      // At i = 0 (current month), it is the next installment: paid + 1
      const installmentNumberForMonth = paid + 1 + i;

      if (installmentNumberForMonth <= item.totalMonths) {
        installmentTotal += item.monthlyAmount;
        activeInstallmentsCount++;

        const prov = item.provider;
        byProvider[prov] = (byProvider[prov] || 0) + item.monthlyAmount;

        if (installmentNumberForMonth === item.totalMonths) {
          endingInstallments.push(
            `${item.title} (${item.provider}) - งวดสุดท้าย #${item.totalMonths}`
          );
        }
      }
    });

    result.push({
      monthKey,
      year,
      month,
      monthLabelThai,
      fixedTotal: activeFixedTotal,
      installmentTotal,
      totalExpense: activeFixedTotal + installmentTotal,
      byProvider,
      activeInstallmentsCount,
      endingInstallments,
    });
  }

  return result;
}
