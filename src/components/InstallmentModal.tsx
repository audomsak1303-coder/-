import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calculator, 
  Layers, 
  Sparkles, 
  SlidersHorizontal, 
  Equal, 
  Shuffle, 
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import { AppProvider, InstallmentItem } from '../types/finance';

interface InstallmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (installment: Omit<InstallmentItem, 'id'>, editId?: string) => void;
  initialData?: InstallmentItem | null;
  baseYear: number;
  baseMonth: number;
}

const PROVIDERS: { key: AppProvider; label: string }[] = [
  { key: 'Shopee', label: 'Shopee' },
  { key: 'Shopee SEasyCash', label: 'Shopee SEasyCash' },
  { key: 'Lazada', label: 'Lazada' },
  { key: 'Thisshop', label: 'Thisshop' },
  { key: 'AEON', label: 'อิออน (AEON)' },
  { key: 'KTC / ธนาคาร', label: 'KTC / ธนาคาร' },
  { key: 'อื่นๆ', label: 'กำหนดเอง / อื่นๆ' },
];

// Presets specified by user: 3, 6, 12, 18, 24 เดือน
const DURATION_PRESETS = [3, 6, 12, 18, 24];

export const InstallmentModal: React.FC<InstallmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  baseYear,
  baseMonth,
}) => {
  const [provider, setProvider] = useState<AppProvider>('Shopee');
  const [customProviderName, setCustomProviderName] = useState('');
  const [title, setTitle] = useState('');
  const [monthlyAmount, setMonthlyAmount] = useState('');
  const [totalMonths, setTotalMonths] = useState(12);
  const [paidMonths, setPaidMonths] = useState(0);
  const [dueDay, setDueDay] = useState(5);
  const [notes, setNotes] = useState('');

  // Requirement: Unequal per-month installment amounts
  const [isCustomAmounts, setIsCustomAmounts] = useState(false);
  const [customMonthlyAmounts, setCustomMonthlyAmounts] = useState<number[]>([]);

  useEffect(() => {
    if (initialData) {
      setProvider(initialData.provider);
      setCustomProviderName(initialData.customProviderName || '');
      setTitle(initialData.title);
      setMonthlyAmount(initialData.monthlyAmount.toString());
      setTotalMonths(initialData.totalMonths);
      
      const paid = typeof initialData.paidMonths === 'number'
        ? initialData.paidMonths
        : Math.max(0, (initialData.currentMonthIndex || 1) - 1);
      setPaidMonths(paid);
      setDueDay(initialData.dueDay || 5);
      setNotes(initialData.notes || '');

      const isCustom = Boolean(initialData.isCustomAmounts && initialData.customMonthlyAmounts?.length);
      setIsCustomAmounts(isCustom);
      if (isCustom && initialData.customMonthlyAmounts) {
        setCustomMonthlyAmounts([...initialData.customMonthlyAmounts]);
      } else {
        // Initialize default array
        const defaultAmt = initialData.monthlyAmount || 0;
        setCustomMonthlyAmounts(new Array(initialData.totalMonths).fill(defaultAmt));
      }
    } else {
      setProvider('Shopee');
      setCustomProviderName('');
      setTitle('');
      setMonthlyAmount('');
      setTotalMonths(12);
      setPaidMonths(0);
      setDueDay(5);
      setNotes('');
      setIsCustomAmounts(false);
      setCustomMonthlyAmounts(new Array(12).fill(0));
    }
  }, [initialData, isOpen]);

  // Adjust custom array when totalMonths changes
  const handleDurationChange = (newMonths: number) => {
    const clamped = Math.min(24, Math.max(1, newMonths));
    setTotalMonths(clamped);
    if (paidMonths > clamped) setPaidMonths(clamped);

    setCustomMonthlyAmounts((prev) => {
      const baseVal = parseFloat(monthlyAmount) || (prev[0] || 0);
      const updated = new Array(clamped).fill(0);
      for (let i = 0; i < clamped; i++) {
        updated[i] = prev[i] !== undefined && prev[i] > 0 ? prev[i] : baseVal;
      }
      return updated;
    });
  };

  // Helper to update a specific month's amount
  const handleCustomAmountChange = (index: number, val: string) => {
    const num = parseFloat(val) || 0;
    setCustomMonthlyAmounts((prev) => {
      const updated = [...prev];
      updated[index] = num;
      return updated;
    });
  };

  // Quick Action: Fill all with first month amount
  const handleFillAllWithFirst = () => {
    const first = customMonthlyAmounts[0] || parseFloat(monthlyAmount) || 0;
    setCustomMonthlyAmounts(new Array(totalMonths).fill(first));
  };

  // Quick Action: Declining interest reduction (ลดต้นลดดอก)
  const handleApplyDeclining = (step = 50) => {
    const start = customMonthlyAmounts[0] || parseFloat(monthlyAmount) || 2000;
    setCustomMonthlyAmounts((prev) => {
      const updated = [...prev];
      for (let i = 0; i < totalMonths; i++) {
        updated[i] = Math.max(100, Math.round(start - (i * step)));
      }
      return updated;
    });
  };

  if (!isOpen) return null;

  const defaultMonthlyVal = parseFloat(monthlyAmount) || 0;
  const isCompleted = paidMonths >= totalMonths;
  const percentComplete = Math.min(100, Math.round((paidMonths / totalMonths) * 100));
  const remainingMonths = Math.max(0, totalMonths - paidMonths);

  // Compute total loan and remaining debt
  let totalLoanValue = 0;
  let totalDebtRemaining = 0;

  if (isCustomAmounts && customMonthlyAmounts.length > 0) {
    totalLoanValue = customMonthlyAmounts.slice(0, totalMonths).reduce((sum, v) => sum + (v || 0), 0);
    if (!isCompleted) {
      for (let i = paidMonths; i < totalMonths; i++) {
        totalDebtRemaining += customMonthlyAmounts[i] || 0;
      }
    }
  } else {
    totalLoanValue = defaultMonthlyVal * totalMonths;
    totalDebtRemaining = isCompleted ? 0 : defaultMonthlyVal * remainingMonths;
  }

  // Representative monthly payment to store
  const representativeMonthlyAmount = isCustomAmounts
    ? (customMonthlyAmounts[paidMonths] || customMonthlyAmounts[0] || Math.round(totalLoanValue / totalMonths))
    : defaultMonthlyVal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (!isCustomAmounts && !defaultMonthlyVal) return;

    onSave(
      {
        provider,
        customProviderName: provider === 'อื่นๆ' ? customProviderName.trim() : undefined,
        title: title.trim(),
        monthlyAmount: representativeMonthlyAmount,
        totalMonths,
        paidMonths,
        currentMonthIndex: Math.min(totalMonths, paidMonths + 1),
        dueDay,
        startYear: baseYear,
        startMonth: baseMonth,
        notes: notes.trim() || undefined,
        totalAmount: totalLoanValue,
        remainingAmount: totalDebtRemaining,
        isCompleted,
        isCustomAmounts,
        customMonthlyAmounts: isCustomAmounts ? customMonthlyAmounts.slice(0, totalMonths) : undefined,
      },
      initialData?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden my-6 max-h-[90vh] flex flex-col"
        role="dialog"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 text-base">
                {initialData ? 'แก้ไขสัญญาผ่อนชำระ' : 'เพิ่มรายการผ่อนชำระใหม่'}
              </h3>
              <p className="text-3xs text-zinc-400">
                รองรับทั้งค่างวดเท่ากัน และค่างวดไม่เท่ากันในแต่ละเดือน (สูงสุด 24 เดือน)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-xl hover:bg-zinc-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* Provider Selection */}
          <div>
            <label className="block text-3xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
              เลือกแอพ / แหล่งผ่อนชำระ *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PROVIDERS.map((p) => {
                const isSelected = provider === p.key;
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setProvider(p.key)}
                    className={`px-3 py-2 text-xs font-semibold rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50 text-orange-950 ring-2 ring-orange-500/20'
                        : 'border-zinc-200 hover:border-zinc-300 text-zinc-700 bg-white'
                    }`}
                  >
                    <span className="truncate">{p.label}</span>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {provider === 'อื่นๆ' && (
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="ระบุชื่อแอพหรือผู้ให้บริการ (เช่น บัตรเครดิต KBank, First Choice)"
                  value={customProviderName}
                  onChange={(e) => setCustomProviderName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                />
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-3xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
              ชื่อรายการที่ผ่อน *
            </label>
            <input
              type="text"
              placeholder="เช่น iPhone 16 Pro, ตู้เย็น, เครื่องซักผ้า, เงินกู้ฉุกเฉิน"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 text-xs bg-white border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
            />
          </div>

          {/* Duration Selector (3, 6, 12, 18, 24 เดือน - Highlighted as requested) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-3xs font-bold text-zinc-400 uppercase tracking-wider">
                เลือกระยะเวลาผ่อน (สูงสุด 24 เดือน) *
              </label>
              <span className="text-3xs text-orange-600 font-bold">
                {totalMonths} เดือน
              </span>
            </div>

            {/* Presets: 3, 6, 12, 18, 24 */}
            <div className="grid grid-cols-5 gap-2">
              {DURATION_PRESETS.map((dur) => {
                const isSelected = totalMonths === dur;
                return (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => handleDurationChange(dur)}
                    className={`py-2 px-1 text-center rounded-2xl text-xs font-bold transition cursor-pointer border ${
                      isSelected
                        ? 'bg-orange-500 text-white border-orange-500 shadow-xs shadow-orange-500/25'
                        : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                    }`}
                  >
                    {dur} เดือน
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Type: Equal vs Unequal (Custom per month) */}
          <div className="p-1 bg-zinc-100 rounded-2xl flex items-center text-xs font-bold">
            <button
              type="button"
              onClick={() => setIsCustomAmounts(false)}
              className={`flex-1 py-2 text-center rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                !isCustomAmounts
                  ? 'bg-white text-zinc-900 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Equal className="w-3.5 h-3.5 text-orange-500" />
              <span>จ่ายเท่ากันทุกงวด</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsCustomAmounts(true);
                // Ensure array populated
                if (customMonthlyAmounts.length < totalMonths || customMonthlyAmounts.every(v => v === 0)) {
                  const base = parseFloat(monthlyAmount) || 0;
                  setCustomMonthlyAmounts(new Array(totalMonths).fill(base));
                }
              }}
              className={`flex-1 py-2 text-center rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                isCustomAmounts
                  ? 'bg-white text-orange-600 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-orange-500" />
              <span>จ่ายค่างวดไม่เท่ากัน (แยกรายเดือน)</span>
            </button>
          </div>

          {/* Mode 1: Equal Installments Input */}
          {!isCustomAmounts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-3xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  ค่างวดต่อเดือน (บาท) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="เช่น 1850"
                  value={monthlyAmount}
                  onChange={(e) => setMonthlyAmount(e.target.value)}
                  required={!isCustomAmounts}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-3xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  จ่ายทุกวันที่ (1-31)
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={dueDay}
                  onChange={(e) => setDueDay(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                />
              </div>
            </div>
          ) : (
            /* Mode 2: Unequal Monthly Amounts Table (Up to 24 months) */
            <div className="space-y-3 bg-zinc-50/80 p-4 rounded-3xl border border-zinc-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-zinc-900 block">
                    กำหนดค่างวดของแต่ละเดือน (1 ถึง {totalMonths} เดือน)
                  </span>
                  <span className="text-3xs text-zinc-400">
                    ใส่ยอดตามตารางผ่อนจริง เช่น SEasyCash หรือ AEON ที่ดอกเบี้ยลดหลั่น
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleFillAllWithFirst}
                    className="px-2.5 py-1 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-xl text-3xs font-semibold text-zinc-700 transition cursor-pointer"
                    title="คัดลอกยอดงวดแรกไปทุกงวด"
                  >
                    เท่ากับงวดแรก
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyDeclining(50)}
                    className="px-2.5 py-1 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-xl text-3xs font-semibold text-zinc-700 transition cursor-pointer flex items-center gap-1"
                    title="จำลองยอดลดต้นลดดอก ลดลงงวดละ 50 บาท"
                  >
                    <TrendingDown className="w-3 h-3 text-orange-500" />
                    <span>ลดงวดละ 50฿</span>
                  </button>
                </div>
              </div>

              {/* Grid of Inputs for Each Month */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-52 overflow-y-auto p-1 pr-2">
                {Array.from({ length: totalMonths }).map((_, idx) => {
                  const val = customMonthlyAmounts[idx] !== undefined ? customMonthlyAmounts[idx] : 0;
                  const isPaidMonth = idx < paidMonths;

                  return (
                    <div 
                      key={idx} 
                      className={`p-2 rounded-2xl border transition ${
                        isPaidMonth 
                          ? 'bg-zinc-100/60 border-zinc-200 opacity-60' 
                          : idx === paidMonths
                            ? 'bg-orange-50/60 border-orange-300 ring-1 ring-orange-300'
                            : 'bg-white border-zinc-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-3xs text-zinc-400 mb-1 font-semibold">
                        <span>งวด #{idx + 1}</span>
                        {isPaidMonth ? (
                          <span className="text-emerald-700 font-bold">จ่ายแล้ว</span>
                        ) : idx === paidMonths ? (
                          <span className="text-orange-600 font-bold">งวดปัจจุบัน</span>
                        ) : null}
                      </div>

                      <div className="relative">
                        <span className="absolute left-2.5 top-1.5 text-3xs text-zinc-400 font-medium">฿</span>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={val || ''}
                          placeholder="0"
                          onChange={(e) => handleCustomAmountChange(idx, e.target.value)}
                          className="w-full pl-6 pr-2 py-1 text-xs font-bold text-zinc-900 bg-transparent rounded-lg focus:outline-hidden"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-200/80 text-3xs text-zinc-500">
                <span>เฉลี่ยต่องวด: <strong>฿{totalMonths > 0 ? Math.round(totalLoanValue / totalMonths).toLocaleString() : 0}</strong></span>
                <span>รวมทั้งหมด: <strong className="text-zinc-900 font-extrabold text-xs">฿{totalLoanValue.toLocaleString()}</strong></span>
              </div>
            </div>
          )}

          {/* Paid Months Progress Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-3xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                จำนวนงวดที่จ่ายไปแล้ว (0 - {totalMonths})
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max={totalMonths}
                  value={paidMonths}
                  onChange={(e) => {
                    const val = Math.min(totalMonths, Math.max(0, parseInt(e.target.value, 10) || 0));
                    setPaidMonths(val);
                  }}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setPaidMonths(totalMonths)}
                  className="px-3 py-2 text-2xs font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-2xl shrink-0 transition cursor-pointer"
                >
                  ครบ 100%
                </button>
              </div>
            </div>

            <div>
              <label className="block text-3xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                วันที่ตัดรอบ/ครบกำหนดชำระ
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={dueDay}
                onChange={(e) => setDueDay(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Summary Box */}
          <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-3xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500 font-medium">ความคืบหน้าการผ่อน:</span>
              <span className={`font-extrabold ${isCompleted ? 'text-emerald-700' : 'text-orange-600'}`}>
                {isCompleted ? 'ผ่อนครบแล้ว 100% (จะยุบเก็บอัตโนมัติ)' : `ผ่อนแล้ว ${paidMonths}/${totalMonths} งวด (${percentComplete}%)`}
              </span>
            </div>

            <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${
                  isCompleted ? 'bg-emerald-500' : 'bg-orange-500'
                }`}
                style={{ width: `${percentComplete}%` }}
              />
            </div>

            <div className="pt-1 flex items-center justify-between text-3xs text-zinc-500">
              <span>งวดคงเหลือ: <strong>{remainingMonths} งวด</strong></span>
              <span>หนี้คงเหลือรวม: <strong className="text-zinc-900 font-extrabold text-xs">฿{totalDebtRemaining.toLocaleString()}</strong></span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-3xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
              หมายเหตุเพิ่มเติม
            </label>
            <input
              type="text"
              placeholder="เช่น ดอกเบี้ย 0%, สัญญาเลขที่..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-2xl transition cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white rounded-2xl shadow-xs shadow-orange-500/20 transition cursor-pointer"
            >
              {initialData ? 'บันทึกการแก้ไข' : 'บันทึกสัญญาผ่อน'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
