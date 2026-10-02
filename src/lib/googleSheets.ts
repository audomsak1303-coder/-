import { FixedExpense, InstallmentItem, MonthSummary } from '../types/finance';
import { getInstallmentRemainingDebt, getInstallmentDueAmount } from './storage';

export interface CreateSpreadsheetResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
}

export async function createFinancialSpreadsheet(
  accessToken: string,
  title: string,
  fixedExpenses: FixedExpense[],
  installments: InstallmentItem[],
  monthsForecast: MonthSummary[],
  monthlyIncome: number
): Promise<CreateSpreadsheetResult> {
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: title || `แผนการเงินและผ่อนชำระ 24 เดือน (${new Date().toLocaleDateString('th-TH')})`,
      },
      sheets: [
        { properties: { title: 'สรุป 24 เดือน', gridProperties: { frozenRowCount: 1 } } },
        { properties: { title: 'ค่าใช้จ่ายประจำ', gridProperties: { frozenRowCount: 1 } } },
        { properties: { title: 'รายการผ่อนชำระ', gridProperties: { frozenRowCount: 1 } } },
        { properties: { title: 'ผ่อนแยกตามแอพ', gridProperties: { frozenRowCount: 1 } } },
      ],
    }),
  });

  if (!createRes.ok) {
    const errorData = await createRes.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || 'ไม่สามารถสร้าง Google Sheets ได้');
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  await populateSheetData(
    accessToken,
    spreadsheetId,
    fixedExpenses,
    installments,
    monthsForecast,
    monthlyIncome
  );

  return {
    spreadsheetId,
    spreadsheetUrl,
  };
}

export async function updateFinancialSpreadsheet(
  accessToken: string,
  spreadsheetId: string,
  fixedExpenses: FixedExpense[],
  installments: InstallmentItem[],
  monthsForecast: MonthSummary[],
  monthlyIncome: number
): Promise<void> {
  await populateSheetData(
    accessToken,
    spreadsheetId,
    fixedExpenses,
    installments,
    monthsForecast,
    monthlyIncome
  );
}

async function populateSheetData(
  accessToken: string,
  spreadsheetId: string,
  fixedExpenses: FixedExpense[],
  installments: InstallmentItem[],
  monthsForecast: MonthSummary[],
  monthlyIncome: number
) {
  // Build Sheet 1: 'สรุป 24 เดือน'
  const summaryHeader = [
    'เดือน/ปี',
    'รายได้ประมาณการ (บาท)',
    'ค่าใช้จ่ายประจำ (บาท)',
    'ค่างวดผ่อนชำระ (บาท)',
    'รวมรายจ่ายทั้งสิ้น (บาท)',
    'คงเหลือสุทธิ (บาท)',
    'จำนวนสัญญาผ่อนคงเหลือ',
    'รายการผ่อนที่หมดงวดเดือนนี้',
  ];

  const summaryRows = monthsForecast.map((m) => {
    const remaining = monthlyIncome > 0 ? monthlyIncome - m.totalExpense : 0;
    return [
      m.monthLabelThai,
      monthlyIncome,
      m.fixedTotal,
      m.installmentTotal,
      m.totalExpense,
      remaining,
      m.activeInstallmentsCount,
      m.endingInstallments.length > 0 ? m.endingInstallments.join(', ') : '-',
    ];
  });

  // Build Sheet 2: 'ค่าใช้จ่ายประจำ'
  const fixedHeader = [
    'ลำดับ',
    'รายการค่าใช้จ่าย',
    'หมวดหมู่',
    'ยอดเงินต่อเดือน (บาท)',
    'กำหนดจ่ายทุกวันที่',
    'สถานะใช้งาน',
    'หมายเหตุ',
  ];

  const categoryNames: Record<string, string> = {
    housing: 'ค่าบ้าน / ค่าเช่าห้อง',
    utilities: 'ค่าน้ำ / ค่าไฟ',
    telecom: 'ค่าเน็ต / ค่าโทรศัพท์',
    commute: 'ค่าเดินทาง / น้ำมัน',
    insurance: 'ค่าประกัน',
    personal: 'ค่ากินอยู่ / ของใช้',
    other: 'อื่นๆ',
  };

  const fixedRows = fixedExpenses.map((f, idx) => [
    idx + 1,
    f.name,
    categoryNames[f.category] || f.category,
    f.amount,
    f.dueDay ? `วันที่ ${f.dueDay}` : 'สิ้นเดือน',
    f.active ? 'ใช้งานอยู่' : 'ปิดการใช้งาน',
    f.notes || '-',
  ]);

  const totalFixedAmount = fixedExpenses
    .filter((f) => f.active)
    .reduce((sum, f) => sum + f.amount, 0);
  fixedRows.push(['', 'รวมค่าใช้จ่ายประจำทั้งสิ้น', '', totalFixedAmount, '', '', '']);

  // Build Sheet 3: 'รายการผ่อนชำระ'
  const installmentHeader = [
    'ลำดับ',
    'แอพ / ผู้ให้บริการ',
    'ชื่อรายการที่ผ่อน',
    'ค่างวดต่อเดือน (บาท)',
    'ชำระแล้ว (งวด)',
    'งวดทั้งหมด',
    'ความคืบหน้า (%)',
    'งวดคงเหลือ',
    'ยอดหนี้คงเหลือ (บาท)',
    'กำหนดจ่ายทุกวันที่',
    'สถานะ',
  ];

  const installmentRows = installments.map((item, idx) => {
    const paid = item.paidMonths ?? Math.max(0, (item.currentMonthIndex || 1) - 1);
    const remainingMonths = Math.max(0, item.totalMonths - paid);
    const estRemaining = getInstallmentRemainingDebt(item);
    const percent = Math.min(100, Math.round((paid / item.totalMonths) * 100));
    const isCustomText = item.isCustomAmounts ? ' (ค่างวดไม่เท่ากัน)' : '';
    const statusText = percent >= 100 
      ? 'ผ่อนครบแล้ว (100%)' 
      : `กำลังผ่อน (งวดที่ ${paid + 1}/${item.totalMonths})${isCustomText}`;
    const monthlyDisplay = item.isCustomAmounts 
      ? `งวดนี้: ${getInstallmentDueAmount(item, 0)} (ค่างวดปรับตามเดือน)` 
      : item.monthlyAmount;

    return [
      idx + 1,
      item.provider === 'อื่นๆ' ? item.customProviderName || 'อื่นๆ' : item.provider,
      item.title,
      monthlyDisplay,
      paid,
      item.totalMonths,
      `${percent}%`,
      remainingMonths,
      estRemaining,
      `วันที่ ${item.dueDay}`,
      statusText,
    ];
  });

  const totalInstallmentMonthly = installments
    .filter((i) => (i.paidMonths ?? 0) < i.totalMonths)
    .reduce((sum, i) => sum + getInstallmentDueAmount(i, 0), 0);
  installmentRows.push(['', 'รวมค่างวดที่ยังต้องผ่อนเดือนนี้', '', totalInstallmentMonthly, '', '', '', '', '', '', '']);

  // Build Sheet 4: 'ผ่อนแยกตามแอพ'
  const providersList = ['Shopee', 'Shopee SEasyCash', 'Lazada', 'Thisshop', 'AEON', 'อื่นๆ'];
  const matrixHeader = ['เดือน/ปี', ...providersList, 'รวมค่างวดทั้งสิ้น'];

  const matrixRows = monthsForecast.map((m) => {
    const providerValues = providersList.map((p) => {
      if (p === 'อื่นๆ') {
        let otherSum = 0;
        Object.entries(m.byProvider).forEach(([key, val]) => {
          if (!['Shopee', 'Shopee SEasyCash', 'Lazada', 'Thisshop', 'AEON'].includes(key)) {
            otherSum += val;
          }
        });
        return otherSum;
      }
      return m.byProvider[p] || 0;
    });

    return [m.monthLabelThai, ...providerValues, m.installmentTotal];
  });

  const payload = {
    valueInputOption: 'USER_ENTERED',
    data: [
      {
        range: "'สรุป 24 เดือน'!A1:H" + (summaryRows.length + 1),
        values: [summaryHeader, ...summaryRows],
      },
      {
        range: "'ค่าใช้จ่ายประจำ'!A1:G" + (fixedRows.length + 1),
        values: [fixedHeader, ...fixedRows],
      },
      {
        range: "'รายการผ่อนชำระ'!A1:K" + (installmentRows.length + 1),
        values: [installmentHeader, ...installmentRows],
      },
      {
        range: "'ผ่อนแยกตามแอพ'!A1:H" + (matrixRows.length + 1),
        values: [matrixHeader, ...matrixRows],
      },
    ],
  };

  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  if (!updateRes.ok) {
    const err = await updateRes.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'ไม่สามารถบันทึกข้อมูลลงใน Google Sheets ได้');
  }
}
