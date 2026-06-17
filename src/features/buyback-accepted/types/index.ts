export type BuybackScreen =
  | "estimate"
  | "confirm-proceed"
  | "handoff-to-customer"
  | "consent-1"
  | "consent-2"
  | "consent-3"
  | "consent-4"
  | "consent-5"
  | "signature"
  | "payment"
  | "settlement"
  | "failed-registration-confirm"
  | "handoff-to-staff";

export type EstimateState = "scan" | "loading" | "error" | "list";

export type ItemType = "individual" | "gross" | "eco";
export type GrossGrade = "A" | "B" | "C";

export const GROSS_GRADE_RANGES: Record<
  GrossGrade,
  { min: number; max: number }
> = {
  A: { min: 300, max: 999 },
  B: { min: 50, max: 299 },
  C: { min: 10, max: 49 },
};

export type EstimateItem = {
  id: string;
  no: string;
  genre: string;
  maker: string;
  name: string;
  comment: string;
  estimatedPrice: number;
  quantity: number;
  systemPrice: number;
  itemType: ItemType;
  grossGrade?: GrossGrade;
  returned: boolean;
  returnConfirmed: boolean;
};

export type CouponStatus = "idle" | "loading" | "loaded";

export type CouponInfo = {
  status: CouponStatus;
  name: string;
  /** Campaign bonus rate applied per line item (e.g. 0.2 = +20%). */
  rate: number;
};

export type SettlementStatus = "awaiting" | "processing" | "completed";

export type SettlementError =
  | "consent-required"
  | "insufficient-balance"
  | "duplicate";

export type PaymentRecord = {
  transactionId: string;
  receptionNo: string;
  amount: number;
  staffId: string;
  registerId: string;
  paidAt: Date;
};

export type PriceChangeLogEntry = {
  itemId: string;
  from: number;
  to: number;
  changedAt: Date;
};

export type IdDocumentType =
  | "drivers-license"
  | "my-number"
  | "passport"
  | "driving-history"
  | "resident-card"
  | "other";

export type PaymentMethod = "cash" | "pay" | "bank-transfer";

export type PersonalInfo = {
  lastName: string;
  firstName: string;
  birthDate: string;
  postalCode: string;
  prefecture: string;
  city: string;
  address: string;
  gender: string;
  occupation: string;
};

export const DEFAULT_PERSONAL_INFO: PersonalInfo = {
  lastName: "ジョーンズ",
  firstName: "ナサニエル",
  birthDate: "1988/06/23",
  postalCode: "460-0014",
  prefecture: "愛知県",
  city: "名古屋市中区富士見町",
  address: "8番8号OMCビル",
  gender: "",
  occupation: "",
};

export const GENDER_OPTIONS = ["男性", "女性", "その他"] as const;
export const OCCUPATION_OPTIONS = [
  "会社員",
  "自営業",
  "学生",
  "主婦・主夫",
  "パート・アルバイト",
  "無職",
  "その他",
] as const;

export const ID_DOCUMENT_OPTIONS = [
  { type: "drivers-license" as IdDocumentType, label: "運転免許証" },
  { type: "my-number" as IdDocumentType, label: "マイナンバーカード" },
  { type: "passport" as IdDocumentType, label: "パスポート" },
  { type: "driving-history" as IdDocumentType, label: "運転経歴証明書" },
  { type: "resident-card" as IdDocumentType, label: "住基カード" },
  { type: "other" as IdDocumentType, label: "その他" },
] as const;

export const CONSENT_STEP_COUNT = 4;

// Demo fixtures for the settlement step (would come from the POS session/API).
export const DEMO_RECEPTION_NO = "R-2026-0611-004";
export const DEMO_STAFF_ID = "ST-0001";
export const DEMO_REGISTER_ID = "REG-01";
export const DEMO_REGISTER_BALANCE = 200000;
export const DEMO_LOW_REGISTER_BALANCE = 1000;
export const DEMO_ASSESSOR_NAME = "ジョーンズナサニエル";

export const OVERLAY_SCREENS: BuybackScreen[] = [
  "confirm-proceed",
  "handoff-to-customer",
  "handoff-to-staff",
  "failed-registration-confirm",
];

export const DEMO_ITEMS: EstimateItem[] = [
  {
    id: "1",
    no: "001",
    genre: "衣料",
    maker: "Nike",
    name: "JORDAN BRANS AS M J ESS MMBR JK",
    comment: "商品コメント",
    estimatedPrice: 1200,
    quantity: 1,
    systemPrice: 1200,
    itemType: "individual",
    returned: false,
    returnConfirmed: false,
  },
  {
    id: "2",
    no: "001",
    genre: "衣料",
    maker: "無印良品",
    name: "カシミヤセーター",
    comment: "商品コメント",
    estimatedPrice: 1200,
    quantity: 1,
    systemPrice: 1200,
    itemType: "individual",
    returned: false,
    returnConfirmed: false,
  },
  {
    id: "3",
    no: "001",
    genre: "衣料",
    maker: "グロス",
    name: "衣料B",
    comment: "",
    estimatedPrice: 150,
    quantity: 2,
    systemPrice: 1200,
    itemType: "gross",
    grossGrade: "B",
    returned: false,
    returnConfirmed: false,
  },
  {
    id: "4",
    no: "001",
    genre: "スマホ",
    maker: "Apple",
    name: "iphone 13 pro Graphite",
    comment: "画面に擦れあり、バッテリー最大量量88%",
    estimatedPrice: 42000,
    quantity: 1,
    systemPrice: 1200,
    itemType: "individual",
    returned: false,
    returnConfirmed: false,
  },
];
