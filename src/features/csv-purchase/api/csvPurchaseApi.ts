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
  {
    slipNumber: '123457',
    slipDate: '2026-05-26',
    totalQuantity: 2,
    totalAmount: 23300,
    partnerCode: '30996',
    partnerName: 'SS東京店',
    items: [
      {
        productCode: '1234567890123',
        productName: 'Nike Zoom Vomero 5',
        brand: 'ナイキ',
        category: 'メンズシューズ',
        details: 'メンズ / 25cm',
        type: 'リユース',
        status: '中古A',
        price: 13500,
        quantity: 1,
        registrationDate: '2026/05/26',
      },
      {
        productCode: '0987654321098',
        productName: 'Adidas Samba Classic',
        brand: 'アディダス',
        category: 'メンズシューズ',
        details: 'メンズ / 26cm',
        type: 'リユース',
        status: '中古B',
        price: 9800,
        quantity: 1,
        registrationDate: '2026/05/26',
      },
    ],
  },
  {
    slipNumber: '123458',
    slipDate: '2026-05-26',
    totalQuantity: 1,
    totalAmount: 32000,
    partnerCode: '99999',
    partnerName: 'SS大阪店',
    items: [
      {
        productCode: '4567890123456',
        productName: 'New Balance 990v6',
        brand: 'ニューバランス',
        category: 'メンズシューズ',
        details: 'メンズ / 27cm',
        type: 'リユース',
        status: '新品',
        price: 32000,
        quantity: 1,
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
