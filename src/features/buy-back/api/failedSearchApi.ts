import type { FailedSearchCriteria, FailedTransaction } from "../types";
import { filterFailedTransactions } from "../utils/failedSearchRules";

const delay = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));

const isoDate = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
};

const at = (daysAgo: number, time: string) => `${isoDate(daysAgo)}T${time}`;

// Mock dataset: cancellation dates are generated relative to "today" so the
// default same-day search always has data to demonstrate.
export const MOCK_FAILED_TRANSACTIONS: FailedTransaction[] = [
  {
    id: 901,
    receiptNumber: "#0101",
    receivedAt: at(0, "09:12"),
    cancelledAt: at(0, "09:58"),
    customerNameKanji: "佐藤 美咲",
    customerNameKana: "サトウ ミサキ",
    customerPhone: "090-1234-5678",
    itemCategories: ["スマートフォン"],
    estimatedTotal: 18500,
    failedReason: "priceMismatch",
    failedNote: "希望額25,000円との差が大きく不成立。",
    receptionStaff: { code: "S-1024", name: "鈴木 太郎" },
    assessmentStaff: { code: "S-2210", name: "山田 健二" },
    items: [
      {
        id: "901-1",
        category: "スマートフォン",
        brand: "Apple",
        model: "iPhone 13 128GB",
        condition: "中古B",
        appraisalValue: 18500,
      },
    ],
  },
  {
    id: 902,
    receiptNumber: "#0102",
    receivedAt: at(0, "10:40"),
    cancelledAt: at(0, "11:05"),
    customerNameKanji: "田中 蓮",
    customerNameKana: "タナカ レン",
    customerPhone: "080-2345-9821",
    itemCategories: ["ゲーム機", "ソフト"],
    estimatedTotal: null,
    failedReason: "invalidIdDocument",
    failedNote: "運転免許証が有効期限切れのため受付中止。",
    receptionStaff: { code: "S-1024", name: "鈴木 太郎" },
    items: [
      {
        id: "902-1",
        category: "ゲーム機",
        brand: "Nintendo",
        model: "Switch 有機ELモデル",
        condition: "中古A",
        appraisalValue: null,
      },
      {
        id: "902-2",
        category: "ソフト",
        brand: "Nintendo",
        model: "ゼルダの伝説",
        condition: "中古A",
        appraisalValue: null,
      },
    ],
  },
  {
    id: 903,
    receiptNumber: "#0103",
    receivedAt: at(0, "13:20"),
    cancelledAt: at(0, "13:32"),
    customerNameKanji: "高橋 陽菜",
    customerNameKana: "タカハシ ヒナ",
    customerPhone: "070-8812-4477",
    itemCategories: ["書籍"],
    estimatedTotal: null,
    failedReason: "underage",
    failedNote: "17歳・保護者同伴なしのため買取不可。",
    receptionStaff: { code: "S-3301", name: "中村 香織" },
    items: [
      {
        id: "903-1",
        category: "書籍",
        brand: "-",
        model: "コミックセット 24冊",
        condition: "中古B",
        appraisalValue: null,
      },
    ],
  },
  {
    id: 904,
    receiptNumber: "#0104",
    receivedAt: at(1, "15:02"),
    cancelledAt: at(1, "16:18"),
    customerNameKanji: "伊藤 大輔",
    customerNameKana: "イトウ ダイスケ",
    customerPhone: "090-7765-3310",
    itemCategories: ["バッグ", "腕時計"],
    estimatedTotal: 142000,
    failedReason: "suspectedCounterfeit",
    failedNote: "シリアル刻印に不審点。買取をお断り。",
    receptionStaff: { code: "S-3301", name: "中村 香織" },
    assessmentStaff: { code: "S-2210", name: "山田 健二" },
    items: [
      {
        id: "904-1",
        category: "バッグ",
        brand: "GUCCI",
        model: "GGマーモント ショルダー",
        condition: "中古A",
        appraisalValue: 92000,
      },
      {
        id: "904-2",
        category: "腕時計",
        brand: "OMEGA",
        model: "シーマスター",
        condition: "中古B",
        appraisalValue: 50000,
      },
    ],
  },
  {
    id: 905,
    receiptNumber: "#0105",
    receivedAt: at(2, "11:45"),
    cancelledAt: at(2, "12:40"),
    customerNameKanji: "渡辺 結衣",
    customerNameKana: "ワタナベ ユイ",
    customerPhone: "080-5544-1234",
    itemCategories: ["衣類"],
    estimatedTotal: 6300,
    failedReason: "longWait",
    failedNote: "混雑により査定待ちが長時間となりお客様が退店。",
    receptionStaff: { code: "S-1024", name: "鈴木 太郎" },
    assessmentStaff: { code: "S-4408", name: "佐藤 次郎" },
    items: [
      {
        id: "905-1",
        category: "衣類",
        brand: "UNIQLO",
        model: "アウター他 12点",
        condition: "中古B",
        appraisalValue: 6300,
      },
    ],
  },
];

export const failedSearchApi = {
  /**
   * E-52: search failed (不成立) transactions.
   * Read-only by design (Rule 2) — the API exposes no mutation endpoints.
   */
  async searchFailedTransactions(
    criteria: FailedSearchCriteria,
  ): Promise<FailedTransaction[]> {
    await delay(250);
    return filterFailedTransactions(MOCK_FAILED_TRANSACTIONS, criteria).sort(
      (a, b) => b.cancelledAt.localeCompare(a.cancelledAt),
    );
  },
};
