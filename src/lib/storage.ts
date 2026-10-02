import { FixedExpense, InstallmentItem, MonthSummary, UserFinancialProfile } from '../types/finance';

const STORAGE_KEYS = {
  FIXED_EXPENSES: 'thai_finance_fixed_expenses_v3',
  INSTALLMENTS: 'thai_finance_installments_v3',
  PROFILE: 'thai_finance_profile_v3',
};

const THAI_MONTH_NAMES_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
];

// Helper to compute payment for an installment's current due month
export function getInstallmentDueAmount(item: InstallmentItem, monthOffset = 0): number {
  const paid = typeof item.paidMonths === 'number'
    ? item.paidMonths
    : Math.max(0, (item.currentMonthIndex || 1) - 1);

  const installmentIndex = paid + 1 + monthOffset; // 1-based
  if (installmentIndex > item.totalMonths) return 0;

  if (item.isCustomAmounts && item.customMonthlyAmounts && item.customMonthlyAmounts.length >= installmentIndex) {
    return item.customMonthlyAmounts[installmentIndex - 1] || 0;
  }
  return item.monthlyAmount || 0;
}

// Helper to compute remaining debt for an item
export function getInstallmentRemainingDebt(item: InstallmentItem): number {
  const paid = typeof item.paidMonths === 'number'
    ? item.paidMonths
    : Math.max(0, (item.currentMonthIndex || 1) - 1);

  if (paid >= item.totalMonths) return 0;

  if (item.isCustomAmounts && item.customMonthlyAmounts && item.customMonthlyAmounts.length > 0) {
    let sum = 0;
    for (let i = paid; i < item.totalMonths; i++) {
      sum += item.customMonthlyAmounts[i] || item.monthlyAmount || 0;
    }
    return sum;
  }

  const remainingMonths = Math.max(0, item.totalMonths - paid);
  return item.monthlyAmount * remainingMonths;
}

// Seed realistic data with 3, 6, 12, 18, 24 months options & unequal payment example
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
    paidMonths: 2,
    startYear: 2026,
    startMonth: 9,
    dueDay: 1,
    notes: 'ผ่อนดอกเบี้ย 0%',
    isCustomAmounts: false,
  },
  {
    id: 'inst-2',
    title: 'Shopee SEasyCash (เงินด่วน ค่างวดลดต้นลดดอก)',
    provider: 'Shopee SEasyCash',
    monthlyAmount: 2350,
    totalMonths: 12,
    paidMonths: 3, // Paid 3 of 12
    startYear: 2026,
    startMonth: 7,
    dueDay: 5,
    notes: 'ลดต้นลดดอก ค่างวดแต่ละเดือนไม่เท่ากัน',
    isCustomAmounts: true,
    // Example of unequal per-month installments (12 months):
    customMonthlyAmounts: [
      2650, 2580, 2500, 2420, 2350, 2280, 
      2200, 2130, 2050, 1980, 1900, 1820
    ],
  },
  {
    id: 'inst-3',
    title: 'Lazada LazPayLater (แท็บเล็ตทำงาน)',
    provider: 'Lazada',
    monthlyAmount: 1420,
    totalMonths: 6,
    paidMonths: 2,
    startYear: 2026,
    startMonth: 8,
    dueDay: 10,
    isCustomAmounts: false,
  },
  {
    id: 'inst-4',
    title: 'Thisshop T-PayLater (หูฟังไร้สาย & ลำโพง)',
    provider: 'Thisshop',
    monthlyAmount: 850,
    totalMonths: 3,
    paidMonths: 1,
    startYear: 2026,
    startMonth: 9,
    dueDay: 15,
    isCustomAmounts: false,
  },
  {
    id: 'inst-5',
    title: 'อิออน AEON (เครื่องซักผ้าและตู้เย็น 24 เดือน)',
    provider: 'AEON',
    monthlyAmount: 1850,
    totalMonths: 24,
    paidMonths: 6,
    startYear: 2026,
    startMonth: 4,
    dueDay: 2,
    notes: 'ผ่อนยาว 24 เดือน สบายกระเป๋า',
    isCustomAmounts: false,
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

      const installmentNumberForMonth = paid + 1 + i;

      if (installmentNumberForMonth <= item.totalMonths) {
        // Compute this exact month's payment (supports unequal per-month amounts)
        let monthlyPay = item.monthlyAmount;
        if (
          item.isCustomAmounts && 
          item.customMonthlyAmounts && 
          item.customMonthlyAmounts.length >= installmentNumberForMonth
        ) {
          monthlyPay = item.customMonthlyAmounts[installmentNumberForMonth - 1] ?? item.monthlyAmount;
        }

        installmentTotal += monthlyPay;
        activeInstallmentsCount++;

        const prov = item.provider;
        byProvider[prov] = (byProvider[prov] || 0) + monthlyPay;

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
