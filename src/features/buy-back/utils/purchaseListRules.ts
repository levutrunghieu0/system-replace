import type { PurchaseEntry, PurchaseStatus } from "../types";

const PURCHASE_CANCEL_ALLOWED_STATUSES: PurchaseStatus[] = [
  "saved",
  "awaiting",
];
// E-41 Rule 1: the store copy can only be reissued while the reception is
// still in progress (受付済/査定中). Settled or cancelled receptions must go
// through the history lookup flow instead.
const STORE_COPY_REISSUE_ALLOWED_STATUSES: PurchaseStatus[] = [
  "awaiting",
  "saved",
];
const CUSTOMER_TICKET_REISSUE_ALLOWED_STATUSES: PurchaseStatus[] = [
  "saved",
  "awaiting",
  "completed",
  "settled",
];

export function canCancelPurchaseReception(entry: PurchaseEntry) {
  return PURCHASE_CANCEL_ALLOWED_STATUSES.includes(entry.status);
}

export function canReissueCustomerTicket(entry: PurchaseEntry) {
  return CUSTOMER_TICKET_REISSUE_ALLOWED_STATUSES.includes(entry.status);
}

export function canReissueStoreCopy(entry: PurchaseEntry) {
  return STORE_COPY_REISSUE_ALLOWED_STATUSES.includes(entry.status);
}

export function isReadonlyAssessmentStatus(status: PurchaseStatus) {
  return (
    status === "completed" || status === "settled" || status === "cancelled"
  );
}
