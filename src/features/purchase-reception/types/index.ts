export type DateEra = 'western' | 'japanese'

export type SmsCapable = 'yes' | 'no' | 'unknown'

export type BagHandling = 'return' | 'assessment' | 'excluded'

export type DeviceCheckItem = {
  category: string
  carrier: string
  quantity: number
}

export type ReceptionForm = {
  birthDate: { year: string; month: string; day: string; era: DateEra }
  phone: string
  noPhone: boolean
  itemCategories: string[]
  coupons: string[]
  smsCapable: SmsCapable | null
}

export type StaffConfirmForm = {
  bagHandling: BagHandling | null
  branchCount: number
  deviceChecks: Record<string, { done: boolean; count: number }>
}

export type WizardScreen =
  | 'top'
  | 'handoff-to-customer'
  | 'step1'
  | 'step2'
  | 'step3'
  | 'step4'
  | 'step5'
  | 'step6'
  | 'handoff-to-staff'
  | 'staff-confirm'
  | 'device-check'
  | 'receipt-issued'
  | 'cancel-confirm'

export const ITEM_CATEGORIES = [
  'ない',
  '限定品・プレミア価格アイテム',
  '年代物のヴィンテージ品・骨董品',
  '高級ブランド品・高級腕時計',
  '貴金属・ジュエリー',
  '楽器',
  'パソコン',
  'タブレット',
  '携帯電話',
  'スマートウォッチ',
  'Apple製品',
] as const

export const COUPON_OPTIONS = [
  'ない',
  'レシートクーポン',
  'アプリクーポン',
  'ラインクーポン',
] as const

export const DEVICE_CATEGORIES = [
  'スマートフォン/タブレット',
  'パソコン',
  'スマートウォッチ',
  'Air Pods',
  '自転車',
] as const

export const STEP_COUNT = 6
