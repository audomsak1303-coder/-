import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar, 
  CheckCircle2, 
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Archive,
  CreditCard
} from 'lucide-react';
import { AppProvider, InstallmentItem } from '../types/finance';

interface InstallmentsSectionProps {
  installments: InstallmentItem[];
  onOpenAddModal: () => void;
  onEditInstallment: (item: InstallmentItem) => void;
  onRequestDelete: (item: InstallmentItem) => void;
  onUpdatePaidMonths: (id: string, newPaid: number) => void;
}

const APP_CONFIG: Record<
  string, 
  { short: string; badgeClass: string; textClass: string }
> = {
  'Shopee': {
    short: 'Shopee',
    badgeClass: 'bg-orange-500 text-white',
    textClass: 'text-orange-600',
  },
  'Shopee SEasyCash': {
    short: 'SEasyCash',
    badgeClass: 'bg-amber-600 text-white',
    textClass: 'text-amber-700',
  },
  'Lazada': {
    short: 'Lazada',
    badgeClass: 'bg-[#0f3b82] text-white',
    textClass: 'text-[#0f3b82]',
  },
  'Thisshop': {
    short: 'Thisshop',
    badgeClass: 'bg-cyan-600 text-white',
    textClass: 'text-cyan-700',
  },
  'AEON': {
    short: 'AEON',
    badgeClass: 'bg-purple-600 text-white',
    textClass: 'text-purple-700',
  },
  'KTC / ธนาคาร': {
    short: 'ธนาคาร',
    badgeClass: 'bg-zinc-800 text-white',
    textClass: 'text-zinc-800',
  },
  'อื่นๆ': {
    short: 'อื่นๆ',
    badgeClass: 'bg-zinc-700 text-white',
    textClass: 'text-zinc-700',
  },
};

export const InstallmentsSection: React.FC<InstallmentsSectionProps> = ({
  installments,
  onOpenAddModal,
  onEditInstallment,
  onRequestDelete,
  onUpdatePaidMonths,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showCompleted, setShowCompleted] = useState<boolean>(false);

  const filterTabs = [
    { key: 'all', label: 'ทั้งหมด' },
    { key: 'Shopee', label: 'Shopee' },
    { key: 'Shopee SEasyCash', label: 'SEasyCash' },
    { key: 'Lazada', label: 'Lazada' },
    { key: 'Thisshop', label: 'Thisshop' },
    { key: 'AEON', label: 'AEON' },
    { key: 'อื่นๆ', label: 'อื่นๆ' },
  ];

  // Helper to test if item is 100% completed
  const isItemCompleted = (item: InstallmentItem) => {
    const paid = typeof item.paidMonths === 'number'
      ? item.paidMonths
      : Math.max(0, (item.currentMonthIndex || 1) - 1);
    return paid >= item.totalMonths;
  };

  // Filter by app tab
  const tabFiltered = installments.filter((item) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'อื่นๆ') {
      return !['Shopee', 'Shopee SEasyCash', 'Lazada', 'Thisshop', 'AEON'].includes(item.provider);
    }
    return item.provider === selectedFilter;
  });

  // Requirement: เมื่อครบ 100% แล้วยุบหายไป (แยก active vs completed)
  const activeItems = tabFiltered.filter((item) => !isItemCompleted(item));
  const completedItems = tabFiltered.filter((item) => isItemCompleted(item));

  const totalMonthlyActive = activeItems.reduce((sum, item) => sum + item.monthlyAmount, 0);

  return (
    <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-2xs overflow-hidden">
      
      {/* Header */}
      <div className="p-6 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-zinc-900 tracking-tight">
              รายการผ่อนชำระแยกแอพ
            </h2>
            <span className="text-2xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 font-bold border border-orange-200/80">
              กำลังผ่อน {activeItems.length}
            </span>
          </div>
          <p className="text-2xs text-zinc-400 mt-1">
            Shopee, SEasyCash, Lazada, Thisshop, AEON (ผ่อนครบ 100% จะยุบเก็บอัตโนมัติ)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-3xs font-semibold text-zinc-400 uppercase tracking-wider">
              ค่างวดรวมเดือนนี้
            </div>
            <div className="text-lg font-extrabold text-orange-600 tracking-tight">
              ฿{totalMonthlyActive.toLocaleString()}
              <span className="text-2xs font-normal text-zinc-400"> /ด.</span>
            </div>
          </div>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white rounded-2xl text-xs font-semibold shadow-xs shadow-orange-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มรายการ</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-6 pt-3 pb-3 border-b border-zinc-100 bg-zinc-50/50 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max">
          {filterTabs.map((tab) => {
            const count = tab.key === 'all'
              ? installments.filter(i => !isItemCompleted(i)).length
              : installments.filter(i => {
                  const match = tab.key === 'อื่นๆ'
                    ? !['Shopee', 'Shopee SEasyCash', 'Lazada', 'Thisshop', 'AEON'].includes(i.provider)
                    : i.provider === tab.key;
                  return match && !isItemCompleted(i);
                }).length;

            const isSelected = selectedFilter === tab.key;

            return (
              <button
                key={tab.key}
                onClick={() => setSelectedFilter(tab.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-900 text-white shadow-xs font-semibold'
                    : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200/70'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-3xs ${
                  isSelected ? 'bg-zinc-700 text-zinc-100' : 'bg-zinc-100 text-zinc-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Installments Grid */}
      <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeItems.length === 0 ? (
          <div className="col-span-full py-12 text-center text-zinc-400 text-xs">
            <div className="w-10 h-10 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-2 text-zinc-400">
              <CreditCard className="w-5 h-5" />
            </div>
            ไม่มีรายการที่กำลังผ่อนชำระในหมวดนี้ {completedItems.length > 0 && '(ผ่อนครบ 100% หมดแล้ว)'}
          </div>
        ) : (
          activeItems.map((item) => {
            const config = APP_CONFIG[item.provider] || APP_CONFIG['อื่นๆ'];
            const paid = typeof item.paidMonths === 'number'
              ? item.paidMonths
              : Math.max(0, (item.currentMonthIndex || 1) - 1);
            
            const percent = Math.min(100, Math.round((paid / item.totalMonths) * 100));
            const remainingMonths = Math.max(0, item.totalMonths - paid);
            const remainingDebt = item.remainingAmount ?? item.monthlyAmount * remainingMonths;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-zinc-200 hover:border-zinc-300 p-4 transition shadow-2xs hover:shadow-xs flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Provider Badge + Actions */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-3xs font-bold px-2.5 py-0.5 rounded-lg tracking-wider ${config.badgeClass}`}>
                      {item.provider === 'อื่นๆ' ? item.customProviderName || 'อื่นๆ' : config.short}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditInstallment(item)}
                        className="p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition cursor-pointer"
                        title="แก้ไข"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onRequestDelete(item)}
                        className="p-1 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="ลบ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="mt-2 text-sm font-bold text-zinc-900 line-clamp-1">
                    {item.title}
                  </h3>

                  {/* Monthly Amount & Remaining Info */}
                  <div className="mt-2 flex items-baseline justify-between">
                    <div>
                      <span className="text-xl font-extrabold text-zinc-900 tracking-tight">
                        ฿{item.monthlyAmount.toLocaleString()}
                      </span>
                      <span className="text-2xs text-zinc-400"> /งวด</span>
                    </div>

                    <div className="text-right">
                      <span className="text-3xs text-zinc-400 block">หนี้คงเหลือ</span>
                      <span className="text-xs font-bold text-zinc-700">
                        ฿{remainingDebt.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-2xs mb-1">
                      <span className="font-semibold text-zinc-600">
                        งวดที่ {paid + 1} จาก {item.totalMonths}
                      </span>
                      <span className="font-bold text-orange-600">
                        {percent}% (เหลือ {remainingMonths} งวด)
                      </span>
                    </div>

                    <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  {/* Due Date */}
                  <div className="mt-3 pt-2 border-t border-zinc-100 flex items-center justify-between text-2xs text-zinc-400">
                    <span className="flex items-center gap-1 font-medium text-zinc-500">
                      <Calendar className="w-3 h-3 text-zinc-300" />
                      จ่ายทุกวันที่ {item.dueDay}
                    </span>
                    {item.notes && (
                      <span className="truncate max-w-[130px] italic">
                        {item.notes}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Advance Controls */}
                <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={paid <= 0}
                      onClick={() => onUpdatePaidMonths(item.id, Math.max(0, paid - 1))}
                      className="px-2 py-1 rounded-lg text-3xs font-semibold text-zinc-500 hover:text-zinc-800 bg-zinc-100 hover:bg-zinc-200 transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                      title="ย้อนกลับ 1 งวด"
                    >
                      -1 งวด
                    </button>
                    <span className="text-3xs text-zinc-400 px-1">
                      {paid}/{item.totalMonths}
                    </span>
                  </div>

                  {/* When paying last installment, it becomes 100% and collapses! */}
                  <button
                    type="button"
                    onClick={() => onUpdatePaidMonths(item.id, paid + 1)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200/80 flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-orange-500" />
                    <span>{paid + 1 === item.totalMonths ? 'จ่ายงวดสุดท้าย (ครบ 100%)' : '+ จ่ายแล้ว 1 งวด'}</span>
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Collapsed Section for 100% Completed Items */}
      {completedItems.length > 0 && (
        <div className="border-t border-zinc-100 bg-zinc-50/60 p-4 sm:p-5">
          <button
            type="button"
            onClick={() => setShowCompleted(!showCompleted)}
            className="w-full flex items-center justify-between text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Archive className="w-4 h-4 text-emerald-600" />
              <span>รายการที่ผ่อนครบแล้ว 100% (ยุบเก็บ {completedItems.length} รายการ)</span>
            </div>
            <div className="flex items-center gap-1 text-2xs text-zinc-400">
              <span>{showCompleted ? 'ซ่อน' : 'แสดง'}</span>
              {showCompleted ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </div>
          </button>

          {showCompleted && (
            <div className="mt-3.5 grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in duration-150">
              {completedItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-white rounded-xl border border-zinc-200/80 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-3xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                        ผ่อนครบ 100%
                      </span>
                      <span className="font-bold text-zinc-800">{item.title}</span>
                    </div>
                    <p className="text-2xs text-zinc-400 mt-0.5">
                      {item.provider} • งวดละ ฿{item.monthlyAmount.toLocaleString()} ({item.totalMonths}/{item.totalMonths} งวด)
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onUpdatePaidMonths(item.id, Math.max(0, item.totalMonths - 1))}
                      className="px-2 py-1 text-3xs rounded-lg text-zinc-500 hover:bg-zinc-100 border border-zinc-200 transition cursor-pointer"
                      title="กู้คืนสถานะกลับมาผ่อนต่อ"
                    >
                      กู้คืน
                    </button>
                    <button
                      type="button"
                      onClick={() => onRequestDelete(item)}
                      className="p-1 text-zinc-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                      title="ลบถาวร"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
