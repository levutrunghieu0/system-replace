import type {
  PurchaseEntry,
  StoreCopyReissueLog,
  StoreCopyReissuePayload,
} from "../types";

const delay = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));

// E-41 Rule 3: in-memory audit trail of every store copy reissue
// (who reissued, when, and why) to deter merchandise swapping fraud.
export const STORE_COPY_REISSUE_LOGS: StoreCopyReissueLog[] = [];

export const buyBackApi = {
  async getPurchaseList(): Promise<PurchaseEntry[]> {
    await delay(200);
    return MOCK_PURCHASE_LIST;
  },

  async voidAndRecreateConsent(_entryId: number): Promise<void> {
    await delay(2000);
  },

  /**
   * E-41: reissue the store copy of a reception ticket.
   * The receipt number is never regenerated (Rule 2); the printout carries a
   * 【再発行】 mark together with the sequential reissue number.
   */
  async reissueStoreCopy(
    entryId: number,
    payload: StoreCopyReissuePayload,
    operator: string,
  ): Promise<StoreCopyReissueLog> {
    await delay(300);

    const entry = MOCK_PURCHASE_LIST.find((row) => row.id === entryId);
    if (!entry) throw new Error(`Purchase entry ${entryId} not found`);

    const reissueNumber = (entry.storeCopyReissueCount ?? 0) + 1;
    entry.storeCopyReissueCount = reissueNumber;

    const log: StoreCopyReissueLog = {
      receiptNumber: entry.receiptNumber,
      reissueNumber,
      reason: payload.reason,
      note: payload.note,
      operator,
      reissuedAt: new Date().toISOString(),
    };
    STORE_COPY_REISSUE_LOGS.push(log);

    return log;
  },
};

export const MOCK_PURCHASE_LIST: PurchaseEntry[] = [
  {
    id: 8,
    receiptNumber: "#0008",
    status: "completed",
    content: "衣類18点",
    inventoryChannel: "ec",
    quantity: 18,
    assignedEmployee: "増山 慶彦",
    updatedAt: "26/10/24 12:00",
    createdAt: "26/10/24 12:00",
    customerPhone: "090-1234-5678",
    concurrentUser: "増山 慶彦",
    consentOutOfSync: true,
  },
  {
    id: 7,
    receiptNumber: "#0007",
    status: "saved",
    content: "アディダス3点",
    inventoryChannel: "member",
    quantity: 3,
    assignedEmployee: "田中 花子",
    updatedAt: "26/10/24 11:30",
    createdAt: "26/10/24 12:00",
    customerPhone: "080-2345-6789",
  },
  {
    id: 6,
    receiptNumber: "#0006",
    status: "awaiting",
    content: "バッグ5点",
    inventoryChannel: "store",
    quantity: 5,
    assignedEmployee: "鈴木 太郎",
    updatedAt: "26/10/24 10:15",
    createdAt: "26/10/24 12:00",
    customerPhone: "070-3456-7890",
  },
  {
    id: 5,
    receiptNumber: "#0005",
    status: "settled",
    content: "ナイキ2点",
    inventoryChannel: "ec",
    quantity: 2,
    assignedEmployee: "佐藤 次郎",
    updatedAt: "26/10/23 16:45",
    createdAt: "26/10/24 12:00",
    customerPhone: "090-4567-8901",
  },
  {
    id: 4,
    receiptNumber: "#0004",
    status: "awaiting",
    content: "衣類10点",
    inventoryChannel: "store",
    quantity: 10,
    assignedEmployee: "中村 香織",
    updatedAt: "26/10/23 14:20",
    createdAt: "26/10/24 12:00",
    customerPhone: "090-1234-5678",
  },
  {
    id: 3,
    receiptNumber: "#0003",
    status: "completed",
    content: "スニーカー4点",
    inventoryChannel: "ec",
    quantity: 4,
    assignedEmployee: "山田 健二",
    updatedAt: "26/10/23 11:00",
    createdAt: "26/10/24 12:00",
    customerPhone: "080-5678-9012",
  },
];

export const MOCK_DETAIL_ENTRY: PurchaseEntry = MOCK_PURCHASE_LIST[0];
