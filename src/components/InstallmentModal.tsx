import React, { useState, useEffect } from 'react';
import { X, Calculator, Calendar, Check, Info } from 'lucide-react';
import { AppProvider, InstallmentItem } from '../types/finance';

interface InstallmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (installment: Omit<InstallmentItem, 'id'>, editId?: string) => void;
  initialData?: InstallmentItem | null;
  baseYear: number;
  baseMonth: number;
}

const PROVIDERS: { key: AppProvider; label: string; badge: string }[] = [
  { key: 'Shopee', label: 'Shopee (SPayLater)', badge: 'bg-orange-500 text-white' },
  { key: 'Shopee SEasyCash', label: 'Shopee SEasyCash (เงินด่วน)', badge: 'bg-amber-600 text-white' },
  { key: 'Lazada', label: 'Lazada (LazPayLater)', badge: 'bg-[#0f3b82] text-white' },
  { key: 'Thisshop', label: 'Thisshop (T-PayLater)', badge: 'bg-cyan-600 text-white' },
  { key: 'AEON', label: 'อิออน (AEON)', badge: 'bg-purple-600 text-white' },
  { key: 'KTC / ธนาคาร', label: 'KTC / ธนาคารต่างๆ', badge: 'bg-zinc-800 text-white' },
  { key: 'อื่นๆ', label: 'กำหนดเอง / แอพอื่นๆ', badge: 'bg-zinc-700 text-white' },
];

const PRESET_DURATIONS = [3, 6, 10, 12, 18, 24];

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
    } else {
      setProvider('Shopee');
      setCustomProviderName('');
      setTitle('');
      setMonthlyAmount('');
      setTotalMonths(10);
      setPaidMonths(0);
      setDueDay(5);
      setNotes('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const monthlyVal = parseFloat(monthlyAmount) || 0;
  const isCompleted = paidMonths >= totalMonths;
  const percentComplete = Math.min(100, Math.round((paidMonths / totalMonths) * 100));
  const remainingMonths = Math.max(0, totalMonths - paidMonths);
  const totalDebtRemaining = isCompleted ? 0 : monthlyVal * remainingMonths;
  const totalLoanValue = monthlyVal * totalMonths;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !monthlyVal) return;

    onSave(
      {
        provider,
        customProviderName: provider === 'อื่นๆ' ? customProviderName.trim() : undefined,
        title: title.trim(),
        monthlyAmount: monthlyVal,
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
      },
      initialData?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden my-8"
        role="dialog"
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-zinc-900 text-base">
              {initialData ? 'แก้ไขสัญญาผ่อนชำระ' : 'เพิ่มรายการผ่อนชำระใหม่'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Provider Selection */}
          <div>
            <label className="block text-2xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
              เลือกแอพ / แหล่งผ่อนชำระ *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PROVIDERS.map((p) => {
                const isSelected = provider === p.key;
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setProvider(p.key)}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50 text-orange-950 ring-2 ring-orange-500/20'
                        : 'border-zinc-200 hover:border-zinc-300 text-zinc-700 bg-white'
                    }`}
                  >
                    <span className="truncate">{p.label.split(' ')[0]}</span>
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
                  className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                />
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-2xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
              ชื่อรายการที่ผ่อน *
            </label>
            <input
              type="text"
              placeholder="เช่น iPhone 16 Pro, ตู้เย็น, แอร์, เงินกู้ฉุกเฉิน"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
            />
          </div>

          {/* Monthly Amount & Due Day */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-2xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                ค่างวดต่อเดือน (บาท) *
              </label>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="เช่น 1850"
                value={monthlyAmount}
                onChange={(e) => setMonthlyAmount(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-2xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                กำหนดจ่ายทุกวันที่ (1-31)
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={dueDay}
                onChange={(e) => setDueDay(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Total Months & Paid Months */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-2xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                จำนวนงวดทั้งหมด (สูงสุด 24+ เดือน)
              </label>
              <div className="flex items-center gap-1 mb-1.5 flex-wrap">
                {PRESET_DURATIONS.map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => {
                      setTotalMonths(dur);
                      if (paidMonths > dur) setPaidMonths(dur);
                    }}
                    className={`px-2 py-0.5 text-2xs rounded-lg font-medium transition cursor-pointer ${
                      totalMonths === dur
                        ? 'bg-zinc-900 text-white font-semibold'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                    }`}
                  >
                    {dur}ด.
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="1"
                max="36"
                value={totalMonths}
                onChange={(e) => {
                  const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                  setTotalMonths(val);
                  if (paidMonths > val) setPaidMonths(val);
                }}
                className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-2xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                จำนวนงวดที่จ่ายไปแล้ว (0 - {totalMonths})
              </label>
              <p className="text-2xs text-zinc-400 mb-1.5">
                (ถ้าจ่ายครบแล้ว ให้ใส่เท่ากับ {totalMonths} จะเป็น 100%)
              </p>
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
                  className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setPaidMonths(totalMonths)}
                  className="px-2.5 py-2 text-2xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl shrink-0 transition cursor-pointer"
                  title="ตั้งเป็นผ่อนครบ 100%"
                >
                  ครบ 100%
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic Progress & Calculation Box */}
          <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500">สถานะความคืบหน้า:</span>
              <span className={`font-bold ${isCompleted ? 'text-emerald-700' : 'text-orange-600'}`}>
                {isCompleted ? 'ผ่อนครบแล้ว 100% 🎉' : `ผ่อนแล้ว ${paidMonths}/${totalMonths} งวด (${percentComplete}%)`}
              </span>
            </div>

            <div className="w-full bg-zinc-200/80 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${
                  isCompleted ? 'bg-emerald-500' : 'bg-orange-500'
                }`}
                style={{ width: `${percentComplete}%` }}
              />
            </div>

            <div className="pt-1 flex items-center justify-between text-2xs text-zinc-500">
              <span>งวดคงเหลือ: <strong>{remainingMonths} งวด</strong></span>
              <span>หนี้คงเหลือรวม: <strong className="text-zinc-900 font-bold">฿{totalDebtRemaining.toLocaleString()}</strong></span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-2xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
              หมายเหตุเพิ่มเติม
            </label>
            <input
              type="text"
              placeholder="เช่น ดอกเบี้ย 0%, ตัดบัญชีอัตโนมัติ"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-xl transition cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white rounded-xl shadow-xs shadow-orange-500/20 transition cursor-pointer"
            >
              {initialData ? 'บันทึกการแก้ไข' : 'บันทึกสัญญาผ่อน'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
