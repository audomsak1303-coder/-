import React from 'react';
import { User } from 'firebase/auth';
import { 
  FileSpreadsheet, 
  Wallet, 
  LogOut, 
  Sparkles,
  ExternalLink,
  ChevronDown,
  LayoutDashboard,
  CalendarRange
} from 'lucide-react';
import { UserFinancialProfile } from '../types/finance';

interface HeaderProps {
  user: User | null;
  profile: UserFinancialProfile;
  currentTab: 'expenses' | 'projection';
  onChangeTab: (tab: 'expenses' | 'projection') => void;
  onOpenGoogleSheetsModal: () => void;
  onOpenIncomeModal: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
  isSigningIn: boolean;
  baseMonthLabel: string;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  profile,
  currentTab,
  onChangeTab,
  onOpenGoogleSheetsModal,
  onOpenIncomeModal,
  onSignIn,
  onSignOut,
  isSigningIn,
  baseMonthLabel,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-zinc-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onChangeTab('expenses')}
              className="flex items-center gap-2.5 text-left cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20 font-bold group-hover:scale-105 transition">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-base text-zinc-900 tracking-tight leading-tight">
                  Expense & Installment
                </h1>
                <p className="text-3xs text-zinc-400">
                  {baseMonthLabel}
                </p>
              </div>
            </button>

            {/* Navigation Tabs (Expenses vs Projection) */}
            <div className="flex items-center p-1 bg-zinc-100 rounded-2xl ml-2 sm:ml-4 text-xs font-semibold">
              <button
                onClick={() => onChangeTab('expenses')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  currentTab === 'expenses'
                    ? 'bg-white text-zinc-900 shadow-2xs'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-orange-500" />
                <span>จัดการค่าใช้จ่าย</span>
              </button>

              <button
                onClick={() => onChangeTab('projection')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  currentTab === 'projection'
                    ? 'bg-white text-zinc-900 shadow-2xs'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                <CalendarRange className="w-3.5 h-3.5 text-orange-500" />
                <span>ตาราง 24 เดือน</span>
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              </button>
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Income Setting Button */}
            <button
              onClick={onOpenIncomeModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs sm:text-sm font-medium text-zinc-700 transition shadow-2xs cursor-pointer"
              title="ตั้งค่าเงินเดือน/รายได้"
            >
              <Wallet className="w-4 h-4 text-orange-500" />
              <span className="hidden md:inline text-zinc-400">รายได้:</span>
              <span className="font-extrabold text-zinc-900">
                ฿{profile.monthlyIncome.toLocaleString()}
              </span>
            </button>

            {/* Google Sheets Sync Button */}
            <button
              onClick={onOpenGoogleSheetsModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-xs font-semibold shadow-xs shadow-orange-500/25 transition cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden sm:inline">Google Sheets</span>
              {profile.sheetId && (
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              )}
            </button>

            {/* Auth Dropdown or Sign-in */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-zinc-100 transition border border-transparent hover:border-zinc-200 cursor-pointer">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt="" 
                      className="w-8 h-8 rounded-full border border-zinc-200 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs">
                      {user.displayName?.charAt(0) || 'U'}
                    </div>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-600" />
                </button>

                <div className="absolute right-0 mt-1 w-56 bg-white rounded-2xl shadow-xl border border-zinc-100 p-2 hidden group-hover:block hover:block z-50 animate-in fade-in duration-100">
                  <div className="px-3 py-2 border-b border-zinc-100 mb-1">
                    <p className="text-xs font-semibold text-zinc-900 truncate">
                      {user.displayName || 'Google Account'}
                    </p>
                    <p className="text-3xs text-zinc-400 truncate">{user.email}</p>
                  </div>

                  {profile.sheetUrl && (
                    <a
                      href={profile.sheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-orange-500" />
                      เปิด Google Sheets
                    </a>
                  )}

                  <button
                    onClick={onSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    ออกจากระบบ
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={onSignIn}
                disabled={isSigningIn}
                className="gsi-material-button text-xs font-medium cursor-pointer"
                title="เข้าสู่ระบบ Google เพื่อเชื่อมต่อ Google Sheets"
              >
                <div className="gsi-material-button-state"></div>
                <div className="gsi-material-button-content-wrapper flex items-center gap-2">
                  <div className="gsi-material-button-icon">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-zinc-700 hidden sm:inline">
                    {isSigningIn ? '...' : 'เข้าสู่ระบบ'}
                  </span>
                </div>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
