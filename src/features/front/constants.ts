import type { BuyBackReceptionState } from "./types";

export const BUYBACK_BLUE = "#1478f0";
export const BUYBACK_BORDER = "#d8dee6";
export const BUYBACK_SOFT_BLUE = "#eef6ff";

export const emptyBuyBackReception: BuyBackReceptionState = {
  staffCode: "",
  receptionNo: "0004",
  customerName: "山田 太郎",
  customerPhone: "090-1234-5678",
  hasSpecialItem: false,
  smsAvailable: true,
  branchCount: 1,
  printedReceptionTicket: false,
  printedBranchTicket: false,
  completed: false,
};
