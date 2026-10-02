import React from 'react';
import { 
  CreditCard, 
  Home, 
  TrendingDown, 
  PiggyBank, 
  AlertCircle, 
  ShieldCheck,
  Receipt,
  ArrowRight,
  CalendarRange
} from 'lucide-react';
import { MonthSummary } from '../types/finance';

interface MonthlySummaryCardProps {
  currentMonth: MonthSummary;
  nextMonth?: MonthSummary;
  monthlyIncome: number;
  totalRemainingInstallmentDebt: number;
  totalActiveInstallments: number;
  onOpenProjection: () => void;
}

export const MonthlySummaryCard: React.FC<MonthlySummaryCardProps> = ({
  currentMonth,
  nextMonth,
  monthlyIncome,
  totalRemainingInstallmentDebt,
  totalActiveInstallments,
  onOpenProjection,
}) => {
  const remainingCash = monthlyIncome - currentMonth.totalExpense;
  const isDeficit = remainingCash < 0;
  const expensePercentageOfIncome = monthlyIncome > 0 
    ? Math.min(100, Math.round((currentMonth.totalExpense / monthlyIncome) * 100))
    : 0;

  const nextMonthDiff = nextMonth 
    ? currentMonth.totalExpense - nextMonth.totalExpense 
    : 0;

  return (
    <div className="space-y-4">
      {/* Alert Banner if any */}
      {isDeficit ? (
        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <div>
            <span className="font-bold">รายจ่ายเดือนนี้เกินงบประมาณ: </span>
            ติดลบ <strong className="text-rose-700 font-extrabold ml-1">฿{Math.abs(remainingCash).toLocaleString()}</strong>
          </div>
        </div>
      ) : nextMonthDiff > 0 ? (
        <div className="flex items-center justify-between gap-3 px-5 py-3 bg-orange-50/70 border border-orange-200/70 rounded-2xl text-orange-950 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-orange-500 shrink-0" />
            <span>
              เดือนหน้า ({nextMonth?.monthLabelThai}) ภาระรายจ่ายจะลดลง 
              <strong className="text-orange-600 font-bold mx-1">
                ฿{nextMonthDiff.toLocaleString()}
              </strong>
              (มีรายการผ่อนชำระครบกำหนด!)
            </span>
          </div>
          <button
            onClick={onOpenProjection}
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span>ดูตาราง 24 เดือน</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : null}

      {/* Modern Minimal 4-Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Card 1: Total Monthly Expense */}
        <div className="bg-white p-5 rounded-3xl border border-zinc-200/90 shadow-2xs hover:border-zinc-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-3xs font-bold text-zinc-400 uppercase tracking-wider">
              รวมรายจ่ายเดือนนี้
            </span>
            <div className="w-8 h-8 rounded-xl bg-zinc-100 text-zinc-700 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              ฿{currentMonth.totalExpense.toLocaleString()}
            </div>
            <div className="mt-1 flex items-center justify-between text-2xs text-zinc-500">
              <span>{expensePercentageOfIncome}% ของเงินเดือน</span>
              <span className="text-zinc-400 font-medium">ประจำ + ผ่อน</span>
            </div>
          </div>

          <div className="mt-3 w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                expensePercentageOfIncome > 80 ? 'bg-rose-500' : 'bg-orange-500'
              }`}
              style={{ width: `${expensePercentageOfIncome}%` }}
            />
          </div>
        </div>

        {/* Card 2: Fixed Monthly Expenses */}
        <div className="bg-white p-5 rounded-3xl border border-zinc-200/90 shadow-2xs hover:border-zinc-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-3xs font-bold text-zinc-400 uppercase tracking-wider">
              ค่าใช้จ่ายประจำ
            </span>
            <div className="w-8 h-8 rounded-xl bg-zinc-100 text-zinc-700 flex items-center justify-center">
              <Home className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              ฿{currentMonth.fixedTotal.toLocaleString()}
            </div>
            <p className="mt-1 text-2xs text-zinc-400 truncate">
              บ้าน, น้ำ, ไฟ, เน็ต, กินอยู่ประจำ
            </p>
          </div>
        </div>

        {/* Card 3: Active Installments (Highlighted Orange) */}
        <div className="bg-white p-5 rounded-3xl border border-orange-200/80 bg-linear-to-b from-orange-50/20 to-white shadow-2xs hover:border-orange-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-3xs font-bold text-orange-600 uppercase tracking-wider">
              ค่างวดผ่อนชำระเดือนนี้
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-xs shadow-orange-500/30">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-orange-600 tracking-tight">
              ฿{currentMonth.installmentTotal.toLocaleString()}
            </div>
            <div className="mt-1 flex items-center justify-between text-2xs">
              <span className="font-semibold text-zinc-700">
                {totalActiveInstallments} สัญญาที่ต้องจ่าย
              </span>
              <span className="text-zinc-400">
                Shopee, Lazada ฯลฯ
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Net Remaining Income */}
        <div className="bg-white p-5 rounded-3xl border border-zinc-200/90 shadow-2xs hover:border-zinc-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-3xs font-bold text-zinc-400 uppercase tracking-wider">
              เงินคงเหลือสุทธิ
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              isDeficit ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-700'
            }`}>
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              isDeficit ? 'text-rose-600' : 'text-emerald-700'
            }`}>
              {isDeficit ? '-' : '+'}฿{Math.abs(remainingCash).toLocaleString()}
            </div>
            <p className="mt-1 text-2xs text-zinc-400">
              {isDeficit ? 'รายจ่ายเกินรายรับ' : 'เงินเก็บออม / ใช้จ่ายสำรอง'}
            </p>
          </div>
        </div>

      </div>

      {/* Minimalist Action Banner: Jump to 24-Month Projection Page */}
      <div className="bg-zinc-900 text-white p-4 sm:p-5 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-orange-400 shrink-0">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-zinc-400">
              ยอดหนี้ผ่อนชำระคงค้างทั้งหมด: <strong className="text-orange-400 font-extrabold text-sm ml-1">฿{totalRemainingInstallmentDebt.toLocaleString()}</strong>
            </div>
            <div className="text-2xs text-zinc-400 mt-0.5">
              Shopee, SEasyCash, Lazada, Thisshop, AEON
            </div>
          </div>
        </div>

        {/* Dedicated Page Button */}
        <button
          onClick={onOpenProjection}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white rounded-2xl text-xs font-bold transition shadow-xs shadow-orange-500/25 cursor-pointer w-full md:w-auto"
        >
          <CalendarRange className="w-4 h-4" />
          <span>เปิดดูตารางพยากรณ์ 24 เดือน</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
