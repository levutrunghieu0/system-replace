export interface Employee {
  code: string
  name: string
}

export interface Partner {
  code: string
  name: string
}

export interface CsvPurchaseItem {
  productCode: string
  productName: string
  brand?: string
  category?: string
  details?: string
  type: string
  status: string
  price: number
  quantity: number
  registrationDate?: string
}

export interface CsvPurchasePayload {
  partnerCode: string
  partnerName: string
  items: CsvPurchaseItem[]
  totalQuantity: number
  totalAmount: number
}

export interface LegacySlip {
  slipNumber: string
  slipDate: string
  totalQuantity: number
  totalAmount: number
  partnerCode: string
  partnerName: string
  items: CsvPurchaseItem[]
}
