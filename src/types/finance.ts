export type AppProvider = 
  | 'Shopee'
  | 'Shopee SEasyCash'
  | 'Lazada'
  | 'Thisshop'
  | 'AEON'
  | 'KTC / ธนาคาร'
  | 'บัตรเครดิตอื่นๆ'
  | 'อื่นๆ';

export interface FixedExpense {
  id: string;
  name: string;
  category: 'housing' | 'utilities' | 'commute' | 'telecom' | 'insurance' | 'personal' | 'other';
  amount: number;
  dueDay: number; // 1-31
  isPaidCurrentMonth?: boolean;
  notes?: string;
  active: boolean;
}

export interface InstallmentItem {
  id: string;
  title: string;
  provider: AppProvider;
  customProviderName?: string;
  monthlyAmount: number; // Default or average monthly amount
  totalMonths: number; // 3, 6, 12, 18, 24 (or up to 24)
  paidMonths: number; // 0 to totalMonths
  currentMonthIndex?: number; // legacy backward compatibility
  isCustomAmounts?: boolean; // true if payments differ per month
  customMonthlyAmounts?: number[]; // Array of amounts for each installment month 1..N
  startYear: number;
  startMonth: number;
  dueDay: number; // 1-31
  totalAmount?: number;
  remainingAmount?: number;
  notes?: string;
  isCompleted?: boolean;
}

export interface MonthSummary {
  monthKey: string; // '2026-10'
  year: number;
  month: number; // 1-12
  monthLabelThai: string; // 'ต.ค. 2569'
  fixedTotal: number;
  installmentTotal: number;
  totalExpense: number;
  byProvider: Record<string, number>;
  activeInstallmentsCount: number;
  endingInstallments: string[]; // Names of installments ending this month
}

export interface UserFinancialProfile {
  monthlyIncome: number;
  currency: string;
  salaryPayDay: number;
  targetSavings: number;
  sheetId?: string;
  sheetUrl?: string;
  lastSyncedAt?: string;
}
