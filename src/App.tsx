/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { User } from 'firebase/auth';
import { 
  initAuth, 
  googleSignIn, 
  logout, 
  getAccessToken 
} from './lib/firebaseAuth';
import { 
  FixedExpense, 
  InstallmentItem, 
  UserFinancialProfile, 
  MonthSummary 
} from './types/finance';
import { 
  loadFixedExpenses, 
  saveFixedExpenses, 
  loadInstallments, 
  saveInstallments, 
  loadProfile, 
  saveProfile, 
  calculate24MonthsForecast,
  DEFAULT_FIXED_EXPENSES,
  DEFAULT_INSTALLMENTS,
  DEFAULT_PROFILE
} from './lib/storage';
import { 
  createFinancialSpreadsheet, 
  updateFinancialSpreadsheet 
} from './lib/googleSheets';

import { Header } from './components/Header';
import { MonthlySummaryCard } from './components/MonthlySummaryCard';
import { FixedExpensesSection } from './components/FixedExpensesSection';
import { InstallmentsSection } from './components/InstallmentsSection';
import { InstallmentModal } from './components/InstallmentModal';
import { Projection24Months } from './components/Projection24Months';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { IncomeModal } from './components/IncomeModal';
import { ConfirmModal } from './components/ConfirmModal';

import { 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  CalendarRange
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Tab State: 'expenses' or 'projection' (Requirement 2: separate page for 24-month forecast)
  const [currentTab, setCurrentTab] = useState<'expenses' | 'projection'>('expenses');

  // Financial Data State
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>(loadFixedExpenses);
  const [installments, setInstallments] = useState<InstallmentItem[]>(loadInstallments);
  const [profile, setProfile] = useState<UserFinancialProfile>(loadProfile);

  // Base calendar period: October 2026
  const baseYear = 2026;
  const baseMonth = 10;
  const baseMonthLabel = 'ตุลาคม 2569';

  // Modals state
  const [isInstallmentModalOpen, setIsInstallmentModalOpen] = useState(false);
  const [editingInstallment, setEditingInstallment] = useState<InstallmentItem | null>(null);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Confirmation Modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    confirmVariant?: 'danger' | 'primary';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Calculate 24-Month Forecast
  const monthsForecast: MonthSummary[] = useMemo(() => {
    return calculate24MonthsForecast(fixedExpenses, installments, baseYear, baseMonth);
  }, [fixedExpenses, installments]);

  const currentMonthSummary = monthsForecast[0];
  const nextMonthSummary = monthsForecast[1];

  // Total remaining debt across all active installments (excludes 100% completed)
  const totalRemainingInstallmentDebt = useMemo(() => {
    return installments.reduce((sum, item) => {
      const paid = typeof item.paidMonths === 'number'
        ? item.paidMonths
        : Math.max(0, (item.currentMonthIndex || 1) - 1);
      if (paid >= item.totalMonths) return sum;
      const remainingMonths = Math.max(0, item.totalMonths - paid);
      return sum + (item.remainingAmount ?? item.monthlyAmount * remainingMonths);
    }, 0);
  }, [installments]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser) => {
        setUser(currentUser);
      },
      () => {
        setUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Persistence
  useEffect(() => {
    saveFixedExpenses(fixedExpenses);
  }, [fixedExpenses]);

  useEffect(() => {
    saveInstallments(installments);
  }, [installments]);

  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  // Auth Handlers
  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      const res = await googleSignIn();
      if (res?.user) {
        setUser(res.user);
        showToast(`ยินดีต้อนรับ ${res.user.displayName || 'ผู้ใช้งาน'}! เข้าสู่ระบบสำเร็จแล้ว`);
      }
    } catch (err: unknown) {
      console.error('Sign in error:', err);
      showToast('ไม่สามารถเข้าสู่ระบบ Google ได้ กรุณาลองใหม่อีกครั้ง', 'error');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setUser(null);
    showToast('ออกจากระบบเรียบร้อยแล้ว');
  };

  // Fixed Expense Handlers
  const handleAddFixedExpense = (newExpense: Omit<FixedExpense, 'id'>) => {
    const item: FixedExpense = {
      ...newExpense,
      id: `fix-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setFixedExpenses((prev) => [...prev, item]);
    showToast(`เพิ่ม "${item.name}" เรียบร้อยแล้ว`);
  };

  const handleUpdateFixedExpense = (id: string, updated: Partial<FixedExpense>) => {
    setFixedExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updated } : e))
    );
  };

  const handleRequestDeleteFixed = (item: FixedExpense) => {
    setConfirmModal({
      isOpen: true,
      title: 'ยืนยันการลบค่าใช้จ่ายประจำ',
      message: `คุณต้องการลบรายการ "${item.name}" หรือไม่?`,
      confirmText: 'ลบรายการ',
      confirmVariant: 'danger',
      onConfirm: () => {
        setFixedExpenses((prev) => prev.filter((e) => e.id !== item.id));
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        showToast(`ลบ "${item.name}" เรียบร้อยแล้ว`);
      },
    });
  };

  // Installment Handlers
  const handleSaveInstallment = (
    installmentData: Omit<InstallmentItem, 'id'>, 
    editId?: string
  ) => {
    if (editId) {
      setInstallments((prev) =>
        prev.map((i) => (i.id === editId ? { ...installmentData, id: editId } : i))
      );
      showToast(`อัปเดตสัญญาผ่อน "${installmentData.title}" เรียบร้อยแล้ว`);
    } else {
      const newItem: InstallmentItem = {
        ...installmentData,
        id: `inst-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      };
      setInstallments((prev) => [...prev, newItem]);
      showToast(`เพิ่มสัญญาผ่อน "${newItem.title}" เรียบร้อยแล้ว`);
    }
  };

  const handleRequestDeleteInstallment = (item: InstallmentItem) => {
    setConfirmModal({
      isOpen: true,
      title: 'ยืนยันการลบสัญญาผ่อนชำระ',
      message: `คุณต้องการลบสัญญาผ่อน "${item.title}" (${item.provider}) หรือไม่?`,
      confirmText: 'ลบสัญญา',
      confirmVariant: 'danger',
      onConfirm: () => {
        setInstallments((prev) => prev.filter((i) => i.id !== item.id));
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        showToast(`ลบสัญญาผ่อน "${item.title}" เรียบร้อยแล้ว`);
      },
    });
  };

  // Update paid months (collapses automatically when reaching 100%)
  const handleUpdatePaidMonths = (id: string, newPaid: number) => {
    setInstallments((prev) =>
      prev.map((i) => {
        if (i.id === id) {
          const clampedPaid = Math.min(i.totalMonths, Math.max(0, newPaid));
          const isCompleted = clampedPaid >= i.totalMonths;
          const remainingMonths = Math.max(0, i.totalMonths - clampedPaid);
          const remainingAmount = isCompleted ? 0 : i.monthlyAmount * remainingMonths;

          return {
            ...i,
            paidMonths: clampedPaid,
            currentMonthIndex: Math.min(i.totalMonths, clampedPaid + 1),
            remainingAmount,
            isCompleted,
          };
        }
        return i;
      })
    );
    showToast('อัปเดตสถานะการผ่อนชำระเรียบร้อยแล้ว');
  };

  // Google Sheets Handlers
  const handleRequestCreateSheet = (customTitle?: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'ยืนยันสร้างไฟล์ Google Sheets ใหม่',
      message: `ระบบจะสร้างสเปรดชีตชื่อ "${customTitle || 'แผนการเงินและผ่อนชำระ 24 เดือน'}" ใน Google Drive ของคุณ และส่งออกข้อมูล 4 แผ่นงาน`,
      confirmText: 'สร้างและส่งออกข้อมูล',
      confirmVariant: 'primary',
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        await executeCreateSpreadsheet(customTitle);
      },
    });
  };

  const executeCreateSpreadsheet = async (title?: string) => {
    let token = await getAccessToken();
    if (!token) {
      try {
        const authRes = await googleSignIn();
        token = authRes?.accessToken || null;
      } catch {
        showToast('จำเป็นต้องเข้าสู่ระบบ Google เพื่อสร้าง Google Sheets', 'error');
        return;
      }
    }

    if (!token) {
      showToast('ไม่พบ Access Token กรุณาลงชื่อเข้าใช้อีกครั้ง', 'error');
      return;
    }

    setIsSyncing(true);
    try {
      const res = await createFinancialSpreadsheet(
        token,
        title || `แผนการเงินและผ่อนชำระ 24 เดือน (${new Date().toLocaleDateString('th-TH')})`,
        fixedExpenses,
        installments,
        monthsForecast,
        profile.monthlyIncome
      );

      const updatedProfile: UserFinancialProfile = {
        ...profile,
        sheetId: res.spreadsheetId,
        sheetUrl: res.spreadsheetUrl,
        lastSyncedAt: new Date().toISOString(),
      };
      setProfile(updatedProfile);
      showToast('สร้าง Google Sheets และส่งออกข้อมูลสำเร็จแล้ว!');
    } catch (err: unknown) {
      console.error('Create sheet error:', err);
      const msg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการส่งออก';
      showToast(msg, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRequestUpdateSheet = () => {
    if (!profile.sheetId) return;

    setConfirmModal({
      isOpen: true,
      title: 'ยืนยันการอัปเดตข้อมูลลง Google Sheets',
      message: 'ระบบจะเขียนทับข้อมูลใน Google Sheets ปัจจุบันด้วยรายการล่าสุด คุณต้องการดำเนินการต่อหรือไม่?',
      confirmText: 'อัปเดตข้อมูล',
      confirmVariant: 'primary',
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        await executeUpdateSpreadsheet();
      },
    });
  };

  const executeUpdateSpreadsheet = async () => {
    if (!profile.sheetId) return;

    let token = await getAccessToken();
    if (!token) {
      try {
        const authRes = await googleSignIn();
        token = authRes?.accessToken || null;
      } catch {
        showToast('จำเป็นต้องเข้าสู่ระบบ Google เพื่ออัปเดตข้อมูล', 'error');
        return;
      }
    }

    if (!token) {
      showToast('ไม่พบ Access Token กรุณาลงชื่อเข้าใช้อีกครั้ง', 'error');
      return;
    }

    setIsSyncing(true);
    try {
      await updateFinancialSpreadsheet(
        token,
        profile.sheetId,
        fixedExpenses,
        installments,
        monthsForecast,
        profile.monthlyIncome
      );

      const updatedProfile: UserFinancialProfile = {
        ...profile,
        lastSyncedAt: new Date().toISOString(),
      };
      setProfile(updatedProfile);
      showToast('อัปเดตข้อมูลลง Google Sheets เรียบร้อยแล้ว!');
    } catch (err: unknown) {
      console.error('Update sheet error:', err);
      const msg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการอัปเดต';
      showToast(msg, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleResetData = () => {
    setFixedExpenses(DEFAULT_FIXED_EXPENSES);
    setInstallments(DEFAULT_INSTALLMENTS);
    setProfile(DEFAULT_PROFILE);
    showToast('รีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้นเรียบร้อยแล้ว');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-zinc-900 pb-20 font-['Noto_Sans_Thai',sans-serif]">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className={`px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs sm:text-sm font-semibold border ${
            toast.type === 'error'
              ? 'bg-rose-900 text-rose-50 border-rose-800'
              : 'bg-zinc-900 text-white border-zinc-800'
          }`}>
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header with Navigation */}
      <Header
        user={user}
        profile={profile}
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
        onOpenGoogleSheetsModal={() => setIsSheetsModalOpen(true)}
        onOpenIncomeModal={() => setIsIncomeModalOpen(true)}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        isSigningIn={isSigningIn}
        baseMonthLabel={baseMonthLabel}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6">

        {/* Page 1: Expenses & Installments Management (Default View) */}
        {currentTab === 'expenses' ? (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Google Sheets Active Sync Banner */}
            {profile.sheetUrl && (
              <div className="p-4 bg-orange-500 text-white rounded-3xl shadow-xs shadow-orange-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="w-5 h-5 text-orange-200 shrink-0" />
                  <div className="text-xs sm:text-sm">
                    <span className="font-bold">เชื่อมต่อกับ Google Sheets แล้ว</span>
                    {profile.lastSyncedAt && (
                      <span className="text-orange-100 text-2xs block sm:inline sm:ml-2">
                        (ซิงค์ล่าสุด: {new Date(profile.lastSyncedAt).toLocaleTimeString('th-TH')})
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRequestUpdateSheet}
                    disabled={isSyncing}
                    className="px-3.5 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold rounded-2xl transition cursor-pointer"
                  >
                    {isSyncing ? 'กำลังซิงค์...' : 'ซิงค์ข้อมูลล่าสุด'}
                  </button>
                  <a
                    href={profile.sheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-orange-700 hover:bg-orange-50 text-xs font-bold rounded-2xl transition shadow-xs cursor-pointer"
                  >
                    <span>เปิดใน Google Sheets</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}

            {/* 1. Monthly Summary KPI Card (with direct trigger button to Page 2) */}
            <MonthlySummaryCard
              currentMonth={currentMonthSummary}
              nextMonth={nextMonthSummary}
              monthlyIncome={profile.monthlyIncome}
              totalRemainingInstallmentDebt={totalRemainingInstallmentDebt}
              totalActiveInstallments={installments.filter(i => (i.paidMonths ?? 0) < i.totalMonths).length}
              onOpenProjection={() => setCurrentTab('projection')}
            />

            {/* 2. Sleek Expenses & Installments Sections (Redesigned Minimalist Layout) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Fixed Monthly Expenses (5 cols) */}
              <div className="lg:col-span-5">
                <FixedExpensesSection
                  expenses={fixedExpenses}
                  onAddExpense={handleAddFixedExpense}
                  onUpdateExpense={handleUpdateFixedExpense}
                  onDeleteExpense={(id) => setFixedExpenses((prev) => prev.filter((e) => e.id !== id))}
                  onRequestDelete={handleRequestDeleteFixed}
                />
              </div>

              {/* Right Column: Installments by App (7 cols, 100% completed automatically collapses) */}
              <div className="lg:col-span-7">
                <InstallmentsSection
                  installments={installments}
                  onOpenAddModal={() => {
                    setEditingInstallment(null);
                    setIsInstallmentModalOpen(true);
                  }}
                  onEditInstallment={(item) => {
                    setEditingInstallment(item);
                    setIsInstallmentModalOpen(true);
                  }}
                  onRequestDelete={handleRequestDeleteInstallment}
                  onUpdatePaidMonths={handleUpdatePaidMonths}
                />
              </div>

            </div>

          </div>
        ) : (
          /* Page 2: Dedicated 24-Month Forecast Subpage (Requirement 2) */
          <Projection24Months
            monthsForecast={monthsForecast}
            installments={installments}
            monthlyIncome={profile.monthlyIncome}
            onBack={() => setCurrentTab('expenses')}
            onOpenGoogleSheets={() => setIsSheetsModalOpen(true)}
          />
        )}

      </main>

      {/* Modals */}
      <InstallmentModal
        isOpen={isInstallmentModalOpen}
        onClose={() => {
          setIsInstallmentModalOpen(false);
          setEditingInstallment(null);
        }}
        onSave={handleSaveInstallment}
        initialData={editingInstallment}
        baseYear={baseYear}
        baseMonth={baseMonth}
      />

      <GoogleSheetsModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
        user={user}
        profile={profile}
        fixedExpenses={fixedExpenses}
        installments={installments}
        monthsForecast={monthsForecast}
        onSignIn={handleSignIn}
        isSigningIn={isSigningIn}
        isSyncing={isSyncing}
        onRequestCreateSheet={handleRequestCreateSheet}
        onRequestUpdateSheet={handleRequestUpdateSheet}
      />

      <IncomeModal
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
        profile={profile}
        onSaveProfile={(newProf) => {
          setProfile(newProf);
          showToast('บันทึกการตั้งค่ารายได้เรียบร้อยแล้ว');
        }}
        onResetData={handleResetData}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        confirmVariant={confirmModal.confirmVariant}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />

    </div>
  );
}
