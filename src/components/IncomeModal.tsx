import React, { useState } from 'react';
import { X, Wallet, RotateCcw, AlertTriangle } from 'lucide-react';
import { UserFinancialProfile } from '../types/finance';

interface IncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserFinancialProfile;
  onSaveProfile: (profile: UserFinancialProfile) => void;
  onResetData: () => void;
}

export const IncomeModal: React.FC<IncomeModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  onResetData,
}) => {
  const [income, setIncome] = useState(profile.monthlyIncome.toString());
  const [payDay, setPayDay] = useState(profile.salaryPayDay.toString());
  const [targetSavings, setTargetSavings] = useState(profile.targetSavings.toString());
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      ...profile,
      monthlyIncome: parseFloat(income) || 0,
      salaryPayDay: parseInt(payDay, 10) || 28,
      targetSavings: parseFloat(targetSavings) || 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden my-8"
        role="dialog"
      >
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-zinc-900 text-base">
              ตั้งค่ารายได้และเป้าหมาย
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-2xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
              เงินเดือน / รายได้รวมต่อเดือน (บาท) *
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
            />
            <p className="text-2xs text-zinc-400 mt-1">
              ใช้สำหรับคำนวณเงินคงเหลือสุทธิและวางแผนกระแสเงินสดล่วงหน้า 24 เดือน
            </p>
          </div>

          <div>
            <label className="block text-2xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
              วันเงินเดือนออก (วันที่ 1-31 ของเดือน)
            </label>
            <input
              type="number"
              min="1"
              max="31"
              value={payDay}
              onChange={(e) => setPayDay(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-2xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
              เป้าหมายเงินออมต่อเดือน (บาท)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={targetSavings}
              onChange={(e) => setTargetSavings(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
            />
          </div>

          {/* Reset Zone */}
          <div className="pt-2 border-t border-zinc-100">
            {!showResetConfirm ? (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="text-2xs text-zinc-400 hover:text-rose-600 flex items-center gap-1 transition cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>รีเซ็ตข้อมูลตัวอย่างกลับเป็นค่าเริ่มต้น</span>
              </button>
            ) : (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-rose-700">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>ต้องการรีเซ็ตข้อมูลตัวอย่างทั้งหมดหรือไม่?</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onResetData();
                      setShowResetConfirm(false);
                      onClose();
                    }}
                    className="px-3 py-1 bg-rose-600 text-white rounded-lg text-2xs font-bold hover:bg-rose-700 cursor-pointer"
                  >
                    ยืนยันรีเซ็ต
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="px-3 py-1 bg-white text-zinc-600 border border-zinc-200 rounded-lg text-2xs cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            )}
          </div>

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
              className="px-5 py-2 text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-xs shadow-orange-500/20 transition cursor-pointer"
            >
              บันทึกการตั้งค่า
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
