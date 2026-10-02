import React, { useState } from 'react';
import { 
  CalendarRange, 
  Table, 
  BarChart3, 
  CheckCircle, 
  ArrowLeft,
  FileSpreadsheet,
  TrendingDown,
  Sparkles,
  Calendar,
  Layers
} from 'lucide-react';
import { MonthSummary, InstallmentItem } from '../types/finance';

interface Projection24MonthsProps {
  monthsForecast: MonthSummary[];
  installments: InstallmentItem[];
  monthlyIncome: number;
  onBack: () => void;
  onOpenGoogleSheets: () => void;
}

export const Projection24Months: React.FC<Projection24MonthsProps> = ({
  monthsForecast,
  installments,
  monthlyIncome,
  onBack,
  onOpenGoogleSheets,
}) => {
  const [viewMode, setViewMode] = useState<'timeline' | 'matrix' | 'chart'>('timeline');
  const [rangeMonths, setRangeMonths] = useState<number>(24);

  const displayMonths = monthsForecast.slice(0, rangeMonths);

  let peakMonth = displayMonths[0];
  let debtFreeMonthIndex = -1;

  displayMonths.forEach((m, idx) => {
    if (m.totalExpense > peakMonth.totalExpense) {
      peakMonth = m;
    }
    if (debtFreeMonthIndex === -1 && m.installmentTotal === 0 && installments.length > 0) {
      debtFreeMonthIndex = idx;
    }
  });

  const maxExpense = Math.max(...displayMonths.map((m) => Math.max(m.totalExpense, monthlyIncome)), 1);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Navigation & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 rounded-2xl text-xs font-bold transition shadow-2xs cursor-pointer w-fit"
        >
          <ArrowLeft className="w-4 h-4 text-orange-500" />
          <span>ย้อนกลับไปหน้าจัดการค่าใช้จ่าย</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenGoogleSheets}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white rounded-2xl text-xs font-semibold shadow-xs shadow-orange-500/20 transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>ส่งออกตาราง 24 เดือนไปยัง Google Sheets</span>
          </button>
        </div>
      </div>

      {/* Main KPI Highlights for the 24 Months */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Peak Expense Month */}
        <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-2xs">
          <span className="text-3xs font-bold text-zinc-400 uppercase tracking-wider block">
            เดือนที่รายจ่ายสูงสุด (Peak Month)
          </span>
          <div className="mt-2 text-xl font-extrabold text-zinc-900">
            {peakMonth?.monthLabelThai}
          </div>
          <div className="mt-1 text-xs text-orange-600 font-bold">
            ฿{peakMonth?.totalExpense.toLocaleString()}
            <span className="text-3xs font-normal text-zinc-400"> (ประจำ + ผ่อน)</span>
          </div>
        </div>

        {/* Debt-Free Milestone */}
        <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-2xs">
          <span className="text-3xs font-bold text-zinc-400 uppercase tracking-wider block">
            วันที่ปลดหนี้ผ่อนชำระหมดทุกแอพ
          </span>
          <div className="mt-2 text-xl font-extrabold text-emerald-700 flex items-center gap-2">
            <span>{debtFreeMonthIndex !== -1 ? displayMonths[debtFreeMonthIndex].monthLabelThai : 'เกิน 24 เดือน'}</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="mt-1 text-2xs text-zinc-400">
            {debtFreeMonthIndex !== -1 
              ? `อีก ${debtFreeMonthIndex} เดือนข้างหน้า ภาระผ่อนจะเป็น ฿0` 
              : 'ยังมีสัญญาที่ผ่อนต่อเนื่องเกิน 24 เดือน'}
          </p>
        </div>

        {/* Projected Savings */}
        <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-2xs">
          <span className="text-3xs font-bold text-zinc-400 uppercase tracking-wider block">
            เงินออมคงเหลือสะสมคาดการณ์ ({rangeMonths} เดือน)
          </span>
          <div className="mt-2 text-xl font-extrabold text-zinc-900">
            ฿{displayMonths.reduce((sum, m) => sum + Math.max(0, monthlyIncome - m.totalExpense), 0).toLocaleString()}
          </div>
          <p className="mt-1 text-2xs text-zinc-400">
            คำนวณจากเงินเดือน ฿{monthlyIncome.toLocaleString()} หักค่าใช้จ่ายจริง
          </p>
        </div>

      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-2xs overflow-hidden">
        
        {/* Subheader Toolbar */}
        <div className="p-6 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-zinc-900 tracking-tight">
                ตารางพยากรณ์และวางแผนกระแสเงินสดล่วงหน้า
              </h2>
              <span className="text-2xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 font-bold border border-orange-200/80">
                24 เดือนเต็ม
              </span>
            </div>
            <p className="text-2xs text-zinc-400 mt-1">
              คำนวณยอดค่างวดผ่อนของ Shopee, SEasyCash, Lazada, Thisshop, AEON ในแต่ละเดือนให้อัตโนมัติ
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Range Selector */}
            <div className="flex items-center p-1 bg-zinc-100 rounded-2xl text-xs font-medium">
              {[6, 12, 24].map((m) => (
                <button
                  key={m}
                  onClick={() => setRangeMonths(m)}
                  className={`px-3 py-1 rounded-xl transition cursor-pointer ${
                    rangeMonths === m 
                      ? 'bg-white text-zinc-900 shadow-2xs font-bold' 
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  {m} เดือน
                </button>
              ))}
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center p-1 bg-zinc-100 rounded-2xl text-xs font-medium">
              <button
                onClick={() => setViewMode('timeline')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl transition cursor-pointer ${
                  viewMode === 'timeline' 
                    ? 'bg-white text-zinc-900 shadow-2xs font-bold' 
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <CalendarRange className="w-3.5 h-3.5 text-orange-500" />
                <span>สรุปรายเดือน</span>
              </button>
              <button
                onClick={() => setViewMode('matrix')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl transition cursor-pointer ${
                  viewMode === 'matrix' 
                    ? 'bg-white text-zinc-900 shadow-2xs font-bold' 
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <Table className="w-3.5 h-3.5 text-orange-500" />
                <span>แยกตามแอพ</span>
              </button>
              <button
                onClick={() => setViewMode('chart')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl transition cursor-pointer ${
                  viewMode === 'chart' 
                    ? 'bg-white text-zinc-900 shadow-2xs font-bold' 
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-orange-500" />
                <span>กราฟแนวโน้ม</span>
              </button>
            </div>
          </div>
        </div>

        {/* View 1: Timeline Table */}
        {viewMode === 'timeline' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold text-3xs uppercase tracking-wider">
                  <th className="py-3 px-5">เดือน / ปี</th>
                  <th className="py-3 px-4">รายจ่ายประจำ</th>
                  <th className="py-3 px-4 text-orange-600">ค่างวดผ่อนชำระ</th>
                  <th className="py-3 px-4 font-extrabold text-zinc-900">รวมรายจ่ายทั้งสิ้น</th>
                  <th className="py-3 px-4">คงเหลือสุทธิ (เงินเดือน)</th>
                  <th className="py-3 px-4">สัญญาคงเหลือ</th>
                  <th className="py-3 px-5">เหตุการณ์สำคัญในเดือนนั้น</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {displayMonths.map((m, idx) => {
                  const remaining = monthlyIncome - m.totalExpense;
                  const isDeficit = remaining < 0;
                  const isDebtFree = m.installmentTotal === 0;

                  return (
                    <tr 
                      key={m.monthKey} 
                      className={`hover:bg-zinc-50/80 transition ${
                        idx === 0 ? 'bg-orange-50/20 font-medium' : ''
                      }`}
                    >
                      <td className="py-3.5 px-5 font-bold text-zinc-900 whitespace-nowrap">
                        {m.monthLabelThai}
                        {idx === 0 && (
                          <span className="ml-2 px-1.5 py-0.5 rounded-md bg-orange-100 text-orange-700 text-3xs font-bold">
                            เดือนนี้
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-zinc-600 whitespace-nowrap">
                        ฿{m.fixedTotal.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`font-bold ${isDebtFree ? 'text-zinc-300' : 'text-orange-600'}`}>
                          ฿{m.installmentTotal.toLocaleString()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-extrabold text-zinc-900 whitespace-nowrap">
                        ฿{m.totalExpense.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`font-bold px-2 py-0.5 rounded-lg ${
                          isDeficit 
                            ? 'bg-rose-50 text-rose-600' 
                            : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {isDeficit ? '-' : '+'}฿{Math.abs(remaining).toLocaleString()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-zinc-500 whitespace-nowrap">
                        {m.activeInstallmentsCount} สัญญา
                      </td>

                      <td className="py-3.5 px-5 text-zinc-600">
                        {m.endingInstallments.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {m.endingInstallments.map((desc, i) => (
                              <span 
                                key={i} 
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-orange-50 text-orange-700 border border-orange-200 text-3xs font-bold"
                              >
                                <CheckCircle className="w-3 h-3 text-orange-500" />
                                ผ่อนหมด: {desc}
                              </span>
                            ))}
                          </div>
                        ) : isDebtFree ? (
                          <span className="text-2xs text-emerald-600 font-bold">
                            ✓ ปลอดภาระหนี้ผ่อนชำระ
                          </span>
                        ) : (
                          <span className="text-zinc-300">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* View 2: Matrix Table (Per-App columns) */}
        {viewMode === 'matrix' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-bold text-3xs uppercase tracking-wider">
                  <th className="py-3 px-5 whitespace-nowrap sticky left-0 bg-zinc-50 z-10 shadow-xs">เดือน / ปี</th>
                  <th className="py-3 px-3 text-orange-600">Shopee</th>
                  <th className="py-3 px-3 text-amber-700">SEasyCash</th>
                  <th className="py-3 px-3 text-[#0f3b82]">Lazada</th>
                  <th className="py-3 px-3 text-cyan-700">Thisshop</th>
                  <th className="py-3 px-3 text-purple-700">AEON</th>
                  <th className="py-3 px-3 text-zinc-600">อื่นๆ</th>
                  <th className="py-3 px-3 text-orange-600 font-extrabold bg-orange-50/40">รวมผ่อน</th>
                  <th className="py-3 px-3 text-zinc-600">ค่าใช้จ่ายประจำ</th>
                  <th className="py-3 px-5 font-extrabold text-zinc-900 bg-zinc-100/50">รวมสุทธิ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {displayMonths.map((m) => {
                  const shopeeVal = m.byProvider['Shopee'] || 0;
                  const seasyVal = m.byProvider['Shopee SEasyCash'] || 0;
                  const lazadaVal = m.byProvider['Lazada'] || 0;
                  const thisshopVal = m.byProvider['Thisshop'] || 0;
                  const aeonVal = m.byProvider['AEON'] || 0;
                  
                  let otherSum = 0;
                  Object.entries(m.byProvider).forEach(([key, val]) => {
                    if (!['Shopee', 'Shopee SEasyCash', 'Lazada', 'Thisshop', 'AEON'].includes(key)) {
                      otherSum += val;
                    }
                  });

                  return (
                    <tr key={m.monthKey} className="hover:bg-zinc-50 transition">
                      <td className="py-3 px-5 font-bold text-zinc-900 whitespace-nowrap sticky left-0 bg-white z-10 shadow-xs">
                        {m.monthLabelThai}
                      </td>
                      <td className="py-3 px-3 text-zinc-700">
                        {shopeeVal > 0 ? `฿${shopeeVal.toLocaleString()}` : <span className="text-zinc-300">-</span>}
                      </td>
                      <td className="py-3 px-3 text-zinc-700">
                        {seasyVal > 0 ? `฿${seasyVal.toLocaleString()}` : <span className="text-zinc-300">-</span>}
                      </td>
                      <td className="py-3 px-3 text-zinc-700">
                        {lazadaVal > 0 ? `฿${lazadaVal.toLocaleString()}` : <span className="text-zinc-300">-</span>}
                      </td>
                      <td className="py-3 px-3 text-zinc-700">
                        {thisshopVal > 0 ? `฿${thisshopVal.toLocaleString()}` : <span className="text-zinc-300">-</span>}
                      </td>
                      <td className="py-3 px-3 text-zinc-700">
                        {aeonVal > 0 ? `฿${aeonVal.toLocaleString()}` : <span className="text-zinc-300">-</span>}
                      </td>
                      <td className="py-3 px-3 text-zinc-700">
                        {otherSum > 0 ? `฿${otherSum.toLocaleString()}` : <span className="text-zinc-300">-</span>}
                      </td>
                      <td className="py-3 px-3 font-bold text-orange-600 bg-orange-50/20">
                        ฿{m.installmentTotal.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-zinc-600">
                        ฿{m.fixedTotal.toLocaleString()}
                      </td>
                      <td className="py-3 px-5 font-extrabold text-zinc-900 bg-zinc-50">
                        ฿{m.totalExpense.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* View 3: Visual Chart */}
        {viewMode === 'chart' && (
          <div className="p-8">
            <div className="mb-4 flex items-center justify-between text-xs text-zinc-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-zinc-300" />
                  ค่าใช้จ่ายประจำ
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-orange-500" />
                  ค่างวดผ่อนชำระ
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-1 border-t-2 border-zinc-700 border-dashed" />
                  เงินเดือน (฿{monthlyIncome.toLocaleString()})
                </span>
              </div>
              <span className="text-2xs text-zinc-400">แนวโน้มลดลงของภาระหนี้เมื่อผ่อนหมด</span>
            </div>

            <div className="overflow-x-auto pb-4">
              <div className="flex items-end gap-3 min-w-[700px] h-64 pt-8 px-2 border-b border-zinc-200">
                {displayMonths.map((m) => {
                  const fixedHeightPercent = (m.fixedTotal / maxExpense) * 100;
                  const installmentHeightPercent = (m.installmentTotal / maxExpense) * 100;

                  return (
                    <div key={m.monthKey} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                      <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition pointer-events-none bg-zinc-900 text-white text-2xs p-2 rounded-lg shadow-lg z-20 whitespace-nowrap">
                        <div className="font-bold">{m.monthLabelThai}</div>
                        <div>รวม: ฿{m.totalExpense.toLocaleString()}</div>
                        <div>ผ่อน: ฿{m.installmentTotal.toLocaleString()} ({m.activeInstallmentsCount} สัญญา)</div>
                      </div>

                      <div className="w-full max-w-[28px] rounded-t-lg overflow-hidden flex flex-col-reverse shadow-xs">
                        <div 
                          className="w-full bg-zinc-300 transition-all duration-300"
                          style={{ height: `${fixedHeightPercent * 1.8}px` }}
                        />
                        <div 
                          className="w-full bg-orange-500 transition-all duration-300"
                          style={{ height: `${installmentHeightPercent * 1.8}px` }}
                        />
                      </div>

                      <span className="mt-2 text-2xs text-zinc-400 truncate w-full text-center">
                        {m.monthLabelThai.split(' ')[0]}
                      </span>
                      <span className="text-2xs font-bold text-zinc-800">
                        {(m.totalExpense / 1000).toFixed(0)}k
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
