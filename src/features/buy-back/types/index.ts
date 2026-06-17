export type PurchaseStatus =
  | "awaiting"
  | "saved"
  | "completed"
  | "settled"
  | "cancelled";

/** Roles used for store back-office access control (E-52 Rule 1). */
export type StoreUserRole = "staff" | "shiftManager" | "storeManager";

/** E-41: mandatory reason codes for reissuing the store copy ticket. */
export type StoreCopyReissueReason =
  | "damaged"
  | "lost"
  | "printerError"
  | "other";

export interface StoreCopyReissuePayload {
  reason: StoreCopyReissueReason;
  /** Free-text note, required when reason is "other". */
  note?: string;
  quantity: number;
}

/** E-41 Rule 3: every reissue is recorded for internal audit. */
export interface StoreCopyReissueLog {
  receiptNumber: string;
  /** Sequential reissue number for this receipt (1 = first reissue). */
  reissueNumber: number;
  reason: StoreCopyReissueReason;
  note?: string;
  operator: string;
  reissuedAt: string;
}

/** E-52: reason categories for failed (不成立) transactions. */
export type FailedReasonCategory =
  | "priceMismatch"
  | "invalidIdDocument"
  | "underage"
  | "suspectedCounterfeit"
  | "longWait";

export interface FailedTransactionItem {
  id: string;
  category: string;
  brand: string;
  model: string;
  condition: ItemCondition;
  appraisalValue: number | null;
}

export interface StaffRef {
  code: string;
  name: string;
}

export interface FailedTransaction {
  id: number;
  receiptNumber: string;
  receivedAt: string;
  cancelledAt: string;
  customerNameKanji: string;
  customerNameKana: string;
  customerPhone: string;
  /** Top-level merchandise categories the customer brought in. */
  itemCategories: string[];
  /** Estimated appraisal total before cancellation, if assessed. */
  estimatedTotal: number | null;
  failedReason: FailedReasonCategory;
  /** Free-text note entered by staff when cancelling. */
  failedNote?: string;
  receptionStaff: StaffRef;
  assessmentStaff?: StaffRef;
  items: FailedTransactionItem[];
}

export interface FailedSearchCriteria {
  cancelledFrom: string;
  cancelledTo: string;
  customerName: string;
  phoneNumber: string;
  receiptNumber: string;
  failedReason: FailedReasonCategory | "";
  staffCode: string;
}
export type InventoryChannel = "ec" | "member" | "store";
export type ItemCondition = "新品" | "未使用" | "中古A" | "中古B" | "中古C";
export type ConsentFlowStep =
  | "idle"
  | "confirm"
  | "processing"
  | "verify"
  | "done";

export interface PurchaseEntry {
  id: number;
  receiptNumber: string;
  status: PurchaseStatus;
  content: string;
  inventoryChannel: InventoryChannel;
  quantity: number;
  assignedEmployee: string;
  updatedAt: string;
  createdAt: string;

  // For customer ticket reissue
  customerBirthday?: string;
  customerPhone?: string;
  storeName?: string;
  receivedAt?: string;

  /** E-41: number of times the store copy has already been reissued. */
  storeCopyReissueCount?: number;

  concurrentUser?: string;
  consentOutOfSync?: boolean;
}

export interface PurchaseLineItem {
  id: string;
  brand: string;
  model: string;
  size: string;
  condition: ItemCondition;
  appraisalValue: number;
  purchasePrice: number;
  manualOverride: boolean;
}

export interface PurchaseLedger {
  retailValue: number;
  basePrice: number;
  couponLabel?: string;
  couponAdjustment: number;
  itemCount: number;
  subtotal: number;
  tax: number;
}

export interface ConsentVerification {
  systemProfile: boolean;
  systemBarcode: boolean;
  physicalId: boolean;
  physicalAge: boolean;
}

export type PurchaseListDialogType =
  | "sms"
  | "storeCopy"
  | "branchLabel"
  | "cashDrawer"
  | "cancelReception"
  | "customerTicketReissue"
  | "phoneNumber"
  | null;
