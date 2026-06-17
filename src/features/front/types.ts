export type BuyBackReceptionDialogMode =
  | "buybackStaffScan"
  | "buybackReceiptPrint"
  | "buybackBranchPrint"
  | "buybackComplete";

export interface BuyBackReceptionState {
  staffCode: string;
  receptionNo: string;
  customerName: string;
  customerPhone: string;
  hasSpecialItem: boolean;
  smsAvailable: boolean;
  branchCount: number;
  printedReceptionTicket: boolean;
  printedBranchTicket: boolean;
  completed: boolean;
}
