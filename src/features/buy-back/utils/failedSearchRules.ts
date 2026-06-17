import type {
  FailedReasonCategory,
  FailedSearchCriteria,
  FailedTransaction,
  StoreUserRole,
} from "../types";

/** Dropdown order of the E-52 failure reason categories. */
export const FAILED_REASON_CATEGORIES: FailedReasonCategory[] = [
  "priceMismatch",
  "invalidIdDocument",
  "underage",
  "suspectedCounterfeit",
  "longWait",
];

// E-52 Rule 1: only shift managers (時間帯責任者) or above may open the
// failed-transaction search screen.
const FAILED_SEARCH_ALLOWED_ROLES: StoreUserRole[] = [
  "shiftManager",
  "storeManager",
];

export function canAccessFailedSearch(role: StoreUserRole) {
  return FAILED_SEARCH_ALLOWED_ROLES.includes(role);
}

/**
 * Mask the middle digits of a phone number for on-screen privacy,
 * e.g. "090-1234-5678" -> "090-XXXX-5678".
 */
export function maskPhoneNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7) return phone;

  const head = digits.slice(0, 3);
  const tail = digits.slice(-4);
  return `${head}-XXXX-${tail}`;
}

const normalizeDigits = (value: string) => value.replace(/\D/g, "");

/** Date-only comparison helper: "2026-06-10T14:05" -> "2026-06-10". */
const toDatePart = (value: string) => value.slice(0, 10);

export function filterFailedTransactions(
  rows: FailedTransaction[],
  criteria: FailedSearchCriteria,
): FailedTransaction[] {
  const name = criteria.customerName.trim();
  const phoneDigits = normalizeDigits(criteria.phoneNumber);
  const receiptNumber = criteria.receiptNumber.trim();
  const staffCode = criteria.staffCode.trim().toLowerCase();

  return rows.filter((row) => {
    const cancelledDate = toDatePart(row.cancelledAt);
    if (criteria.cancelledFrom && cancelledDate < criteria.cancelledFrom) {
      return false;
    }
    if (criteria.cancelledTo && cancelledDate > criteria.cancelledTo) {
      return false;
    }

    // Customer name matches against both Kanji and Kana readings.
    if (
      name &&
      !row.customerNameKanji.includes(name) &&
      !row.customerNameKana.includes(name)
    ) {
      return false;
    }

    // Phone: exact match or trailing-digit (suffix) match.
    if (phoneDigits) {
      const rowDigits = normalizeDigits(row.customerPhone);
      if (rowDigits !== phoneDigits && !rowDigits.endsWith(phoneDigits)) {
        return false;
      }
    }

    if (receiptNumber && !row.receiptNumber.includes(receiptNumber)) {
      return false;
    }

    if (criteria.failedReason && row.failedReason !== criteria.failedReason) {
      return false;
    }

    // Staff filter matches either the reception or the assessment staff.
    if (staffCode) {
      const matchesStaff = [row.receptionStaff, row.assessmentStaff].some(
        (staff) =>
          staff &&
          (staff.code.toLowerCase().includes(staffCode) ||
            staff.name.toLowerCase().includes(staffCode)),
      );
      if (!matchesStaff) return false;
    }

    return true;
  });
}
