import React, { useState } from 'react';
import { 
  Home, 
  Zap, 
  Wifi, 
  Car, 
  Shield, 
  ShoppingBag, 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { FixedExpense } from '../types/finance';

interface FixedExpensesSectionProps {
  expenses: FixedExpense[];
  onAddExpense: (expense: Omit<FixedExpense, 'id'>) => void;
  onUpdateExpense: (id: string, updated: Partial<FixedExpense>) => void;
  onDeleteExpense: (id: string) => void;
  onRequestDelete: (expense: FixedExpense) => void;
}

const CATEGORY_CONFIG: Record<
  FixedExpense['category'], 
  { label: string; icon: React.ReactNode; color: string }
> = {
  housing: { label: 'ค่าบ้าน / คอนโด', icon: <Home className="w-3.5 h-3.5" />, color: 'text-zinc-800 bg-zinc-100' },
  utilities: { label: 'ค่าน้ำ / ค่าไฟ', icon: <Zap className="w-3.5 h-3.5" />, color: 'text-orange-600 bg-orange-50' },
  telecom: { label: 'เน็ต / มือถือ', icon: <Wifi className="w-3.5 h-3.5" />, color: 'text-blue-600 bg-blue-50' },
  commute: { label: 'เดินทาง / น้ำมัน', icon: <Car className="w-3.5 h-3.5" />, color: 'text-emerald-600 bg-emerald-50' },
  insurance: { label: 'ประกันภัย', icon: <Shield className="w-3.5 h-3.5" />, color: 'text-purple-600 bg-purple-50' },
  personal: { label: 'ค่ากินอยู่', icon: <ShoppingBag className="w-3.5 h-3.5" />, color: 'text-amber-600 bg-amber-50' },
  other: { label: 'อื่นๆ', icon: <AlertCircle className="w-3.5 h-3.5" />, color: 'text-zinc-600 bg-zinc-100' },
};

export const FixedExpensesSection: React.FC<FixedExpensesSectionProps> = ({
  expenses,
  onAddExpense,
  onUpdateExpense,
  onRequestDelete,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<FixedExpense['category']>('utilities');
  const [amount, setAmount] = useState('');
  const [dueDay, setDueDay] = useState('1');
  const [notes, setNotes] = useState('');

  const totalFixed = expenses
    .filter((e) => e.active)
    .reduce((sum, e) => sum + e.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !amount) return;

    if (editingId) {
      onUpdateExpense(editingId, {
        name: name.trim(),
        category,
        amount: parseFloat(amount) || 0,
        dueDay: parseInt(dueDay, 10) || 1,
        notes: notes.trim() || undefined,
      });
      setEditingId(null);
    } else {
      onAddExpense({
        name: name.trim(),
        category,
        amount: parseFloat(amount) || 0,
        dueDay: parseInt(dueDay, 10) || 1,
        active: true,
        notes: notes.trim() || undefined,
      });
    }

    setName('');
    setAmount('');
    setDueDay('1');
    setNotes('');
    setIsAdding(false);
  };

  const startEdit = (expense: FixedExpense) => {
    setEditingId(expense.id);
    setName(expense.name);
    setCategory(expense.category);
    setAmount(expense.amount.toString());
    setDueDay(expense.dueDay?.toString() || '1');
    setNotes(expense.notes || '');
    setIsAdding(true);
  };

  const cancelForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setName('');
    setAmount('');
    setNotes('');
  };

  return (
    <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-zinc-900 tracking-tight">
              ค่าใช้จ่ายประจำ
            </h2>
            <span className="text-2xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 font-bold">
              {expenses.length} รายการ
            </span>
          </div>
          <p className="text-2xs text-zinc-400 mt-1">
            ค่าใช้จ่ายคงที่ เช่น ค่าบ้าน, ค่าไฟ, ค่าน้ำ, ค่าเน็ต
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-3xs font-semibold text-zinc-400 uppercase tracking-wider">
              รวมจ่ายประจำ
            </div>
            <div className="text-lg font-extrabold text-zinc-900 tracking-tight">
              ฿{totalFixed.toLocaleString()}
              <span className="text-2xs font-normal text-zinc-400"> /ด.</span>
            </div>
          </div>
          {!isAdding && (
            <button
              onClick={() => {
                setEditingId(null);
                setName('');
                setAmount('');
                setNotes('');
                setIsAdding(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl text-xs font-semibold transition cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่ม</span>
            </button>
          )}
        </div>
      </div>

      {/* Add / Edit Form Drawer */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="p-5 bg-zinc-50 border-b border-zinc-200 animate-in fade-in duration-150">
          <div className="font-bold text-xs text-zinc-800 mb-3">
            {editingId ? 'แก้ไขรายการค่าใช้จ่ายประจำ' : 'เพิ่มรายการค่าใช้จ่ายประจำ'}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-3xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                ชื่อรายการ *
              </label>
              <input
                type="text"
                placeholder="เช่น ค่าบ้าน, ค่าไฟ, เน็ตบ้าน"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-3xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                หมวดหมู่
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FixedExpense['category'])}
                className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
              >
                {Object.entries(CATEGORY_CONFIG).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-3xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                ยอดเงินต่อเดือน (บาท) *
              </label>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-3xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                จ่ายทุกวันที่ (1-31)
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-3xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                หมายเหตุเพิ่มเติม
              </label>
              <input
                type="text"
                placeholder="เช่น หักบัญชีอัตโนมัติ"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={cancelForm}
              className="px-3.5 py-1.5 text-xs text-zinc-500 hover:bg-zinc-200 rounded-xl transition cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition cursor-pointer shadow-xs shadow-orange-500/20"
            >
              {editingId ? 'บันทึกการแก้ไข' : 'บันทึกรายการ'}
            </button>
          </div>
        </form>
      )}

      {/* List */}
      <div className="divide-y divide-zinc-100">
        {expenses.length === 0 ? (
          <div className="p-8 text-center text-zinc-400 text-xs">
            ยังไม่มีรายการค่าใช้จ่ายประจำ
          </div>
        ) : (
          expenses.map((item) => {
            const cat = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.other;

            return (
              <div
                key={item.id}
                className={`p-4 flex items-center justify-between gap-3 hover:bg-zinc-50/70 transition ${
                  !item.active ? 'opacity-40 bg-zinc-50/40' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${cat.color}`}>
                    {cat.icon}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-xs sm:text-sm truncate ${item.active ? 'text-zinc-900' : 'text-zinc-400 line-through'}`}>
                        {item.name}
                      </span>
                      <span className="text-3xs px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-500 shrink-0">
                        {cat.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-0.5 text-3xs text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-zinc-300" />
                        ทุกวันที่ {item.dueDay}
                      </span>
                      {item.notes && (
                        <span className="italic truncate">
                          • {item.notes}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="font-extrabold text-zinc-900 text-sm sm:text-base">
                      ฿{item.amount.toLocaleString()}
                    </span>
                    <span className="text-3xs text-zinc-400 block">/เดือน</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onUpdateExpense(item.id, { active: !item.active })}
                      className={`px-2 py-1 text-3xs rounded-lg font-semibold transition cursor-pointer ${
                        item.active 
                          ? 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200' 
                          : 'bg-zinc-200 text-zinc-400'
                      }`}
                    >
                      {item.active ? 'เปิด' : 'ปิด'}
                    </button>

                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      className="p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition cursor-pointer"
                      title="แก้ไข"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onRequestDelete(item)}
                      className="p-1 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      title="ลบ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
