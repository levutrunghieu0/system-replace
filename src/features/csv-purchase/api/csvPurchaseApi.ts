import type { Employee, Partner, LegacySlip, CsvPurchasePayload } from '../types'

const MOCK_EMPLOYEES: Record<string, string> = {
  '12345': '山田 太郎',
  '67890': '佐藤 次郎',
  '11111': '鈴木 花子',
  '123456': 'ナサニエル・ジョーンズ',
}

const MOCK_PARTNERS: Record<string, string> = {
  '30996': 'SS東京店',
  '12345': 'SS新宿店',
  '99999': 'SS大阪店',
}

const MOCK_SLIPS: LegacySlip[] = [
  {
    slipNumber: '123456',
    slipDate: '2026-05-26',
    totalQuantity: 6,
    totalAmount: 7944,
    partnerCode: '12345',
    partnerName: 'サンプルテキスト店',
    items: [
      {
        productCode: '0546176',
        productName: '牛乳石鹸 赤箱 10個入',
        type: 'リユース',
        status: '新品',
        price: 1389,
        quantity: 3,
        registrationDate: '2026/05/26',
      },
      {
        productCode: '4939771',
        productName: '【不二貿易】 フラワーブランド 吊下げ式 WH▲',
        type: 'リユース',
        status: '新品',
        price: 1259,
        quantity: 3,
        registrationDate: '2026/05/26',
      },
    ],
  },
]

export const csvPurchaseApi = {
  verifyEmployee: async (code: string): Promise<Employee> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const name = MOCK_EMPLOYEES[code]
    if (!name) {
      throw new Error('従業員が見つかりません。')
    }
    return { code, name }
  },

  verifyPartner: async (code: string): Promise<Partner> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const name = MOCK_PARTNERS[code]
    if (!name) {
      throw new Error('取引先コードが無効です。')
    }
    return { code, name }
  },

  getLegacySlips: async (_date: string): Promise<LegacySlip[]> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return MOCK_SLIPS;
  },

  cancelSlip: async (slipNumber: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    // Mock successful cancellation
    console.log(`Cancelled slip: ${slipNumber}`)
  },

  registerCsvPurchase: async (
    payload: CsvPurchasePayload,
    slipAmount: number,
    printLabels: boolean,
    labelConfig?: string
  ): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 600))
    if (slipAmount !== payload.totalAmount) {
      throw new Error('合計金額が一致しません。')
    }
    console.log('Registered CSV Purchase successfully:', { payload, slipAmount, printLabels, labelConfig })
  },
}
