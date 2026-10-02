import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { 
  FileSpreadsheet, 
  X, 
  ExternalLink, 
  UploadCloud, 
  CheckCircle2, 
  FilePlus,
  RefreshCw,
  TableProperties
} from 'lucide-react';
import { UserFinancialProfile, FixedExpense, InstallmentItem, MonthSummary } from '../types/finance';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  profile: UserFinancialProfile;
  fixedExpenses: FixedExpense[];
  installments: InstallmentItem[];
  monthsForecast: MonthSummary[];
  onSignIn: () => void;
  isSigningIn: boolean;
  isSyncing: boolean;
  onRequestCreateSheet: (customTitle?: string) => void;
  onRequestUpdateSheet: () => void;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  user,
  profile,
  fixedExpenses,
  installments,
  onSignIn,
  isSigningIn,
  isSyncing,
  onRequestCreateSheet,
  onRequestUpdateSheet,
}) => {
  const [sheetTitle, setSheetTitle] = useState(
    `แผนการเงินและผ่อนชำระ 24 เดือน (${new Date().toLocaleDateString('th-TH')})`
  );

  if (!isOpen) return null;

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
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 text-base">
                เชื่อมต่อและซิงค์กับ Google Sheets
              </h3>
              <p className="text-2xs text-zinc-400">
                ส่งออกตารางสรุป 24 เดือน, ค่าใช้จ่ายประจำ, และรายการผ่อนชำระ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {!user ? (
            <div className="text-center py-6 px-4 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
              <div className="w-10 h-10 rounded-xl bg-white shadow-xs mx-auto flex items-center justify-center text-orange-500 mb-3">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-zinc-900">
                เข้าสู่ระบบด้วย Google เพื่อซิงค์ข้อมูล
              </h4>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto mt-1 mb-4 leading-relaxed">
                ระบบจะสร้างสเปรดชีตใน Google Drive ของคุณ เพื่อเปิดดูและวางแผนการเงินได้ทุกที่
              </p>

              <button
                type="button"
                onClick={onSignIn}
                disabled={isSigningIn}
                className="gsi-material-button inline-flex items-center cursor-pointer shadow-xs hover:shadow-md transition mx-auto"
              >
                <div className="gsi-material-button-state"></div>
                <div className="gsi-material-button-content-wrapper flex items-center gap-2 px-3 py-1.5 bg-white border border-zinc-200 rounded-xl">
                  <div className="gsi-material-button-icon w-4 h-4 shrink-0">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-zinc-700">
                    {isSigningIn ? 'กำลังเชื่อมต่อ...' : 'ลงชื่อเข้าใช้ Google'}
                  </span>
                </div>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Account Card */}
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt="" 
                      className="w-8 h-8 rounded-full border border-zinc-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs">
                      {user.displayName?.charAt(0) || 'G'}
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-bold text-zinc-900">
                      {user.displayName || 'Google Account'}
                    </div>
                    <div className="text-2xs text-zinc-400">{user.email}</div>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 text-2xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  เชื่อมต่อแล้ว
                </span>
              </div>

              {/* Connected Sheet Status */}
              {profile.sheetUrl ? (
                <div className="p-4 bg-orange-50/30 border border-orange-200/80 rounded-2xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-2xs font-bold uppercase tracking-wider text-orange-600">
                        สเปรดชีตที่เชื่อมต่ออยู่
                      </span>
                      <h4 className="text-sm font-bold text-zinc-900 mt-0.5">
                        ตารางวางแผนการเงินและผ่อนชำระ
                      </h4>
                      {profile.lastSyncedAt && (
                        <p className="text-2xs text-zinc-400 mt-0.5">
                          ซิงค์ล่าสุด: {new Date(profile.lastSyncedAt).toLocaleString('th-TH')}
                        </p>
                      )}
                    </div>
                    <a
                      href={profile.sheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-semibold shadow-xs shadow-orange-500/20 transition cursor-pointer"
                    >
                      <span>เปิด Sheet</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div className="mt-3 pt-3 border-t border-orange-100 flex items-center justify-between">
                    <span className="text-xs text-zinc-500">
                      อัปเดตข้อมูลล่าสุด?
                    </span>
                    <button
                      type="button"
                      disabled={isSyncing}
                      onClick={onRequestUpdateSheet}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 rounded-xl text-xs font-semibold transition cursor-pointer shadow-2xs"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-orange-500' : ''}`} />
                      <span>{isSyncing ? 'กำลังบันทึก...' : 'อัปเดตข้อมูลลง Sheet เดิม'}</span>
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Option to Create New Sheet */}
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-800">
                  <FilePlus className="w-4 h-4 text-orange-500" />
                  <span>สร้าง Google Sheets เล่มใหม่</span>
                </div>

                <div>
                  <label className="block text-2xs font-semibold text-zinc-500 mb-1">
                    ชื่อไฟล์ใน Google Drive
                  </label>
                  <input
                    type="text"
                    value={sheetTitle}
                    onChange={(e) => setSheetTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  />
                </div>

                <button
                  type="button"
                  disabled={isSyncing}
                  onClick={() => onRequestCreateSheet(sheetTitle)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white rounded-xl text-xs font-bold transition shadow-xs shadow-orange-500/20 disabled:opacity-50 cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>{isSyncing ? 'กำลังสร้างและส่งออก...' : 'สร้างและส่งออกไปยัง Google Sheets'}</span>
                </button>
              </div>

              {/* Data Summary to be exported */}
              <div className="p-3 bg-white border border-zinc-200 rounded-xl">
                <div className="text-2xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <TableProperties className="w-3.5 h-3.5" />
                  แผ่นงานที่จะถูกส่งออก (4 แผ่นงาน):
                </div>
                <ul className="text-xs text-zinc-600 space-y-1">
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    <strong>1. สรุป 24 เดือน:</strong> รายได้, ประจำ, ผ่อนชำระ, คงเหลือ
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                    <strong>2. ค่าใช้จ่ายประจำ:</strong> {fixedExpenses.length} รายการ
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <strong>3. รายการผ่อนชำระ:</strong> {installments.length} รายการ (พร้อม % ความคืบหน้า)
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    <strong>4. ผ่อนแยกตามแอพ:</strong> Matrix รายเดือนของ Shopee, Lazada, AEON ฯลฯ
                  </li>
                </ul>
              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-200 rounded-xl transition cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
