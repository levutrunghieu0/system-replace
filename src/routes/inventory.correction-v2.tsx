import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useRef, useCallback } from "react";
import type { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import InputBase from "@mui/material/InputBase";
import OutlinedInput from "@mui/material/OutlinedInput";
import Paper from "@mui/material/Paper";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import ClearIcon from "@mui/icons-material/Clear";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import EditIcon from "@mui/icons-material/Edit";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { useTranslation } from "react-i18next";
import { AppTable } from "../components/table";
import { AppModal } from "../components/common/AppModal";
import { QuantityStepper } from "../components/QuantityStepper";
import { useLayoutConfig } from "../hooks/useLayoutConfig";

export const Route = createFileRoute("/inventory/correction-v2")({
  component: CorrectionV2Page,
});

// ── Types ─────────────────────────────────────────────────────────────────────

type DialogState = { kind: "none" } | { kind: "correct" };

// Shelf mode: one product per row
interface ProductRow {
  id: number;
  rowNo: number;
  code: string;
  productName: string;
  status: "A" | "B" | "C";
  qty: number;
  subCategory: string;
  staffCode: string;
  isNew?: boolean;
}

// Product code mode: one shelf registration per row
interface ProductShelfRow {
  id: number;
  rowNo: number;
  shelfLocation: string; // 什器No-棚段 e.g. "0001-01"
  staffCode: string; // 担当者コード
  staffName: string; // 担当者名
  qty: number;
  code: string;
}

interface ProductInfo {
  code: string;
  productName: string;
  status: "A" | "B" | "C";
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const SHELF_MOCK_DATA: Record<string, ProductRow[]> = {
  "100-10": [
    {
      id: 1,
      rowNo: 1,
      code: "5060388",
      productName: "1. ぬがせっ!! SEXY スロット天国DX",
      status: "A",
      qty: 1,
      subCategory: "リサイクルUMD",
      staffCode: "9999999",
    },
    {
      id: 2,
      rowNo: 2,
      code: "5060412",
      productName: "2. SIMPLE2000シリーズ Vol.128 THE バイクレース",
      status: "A",
      qty: 1,
      subCategory: "リサイクルUMD",
      staffCode: "9999999",
    },
    {
      id: 3,
      rowNo: 3,
      code: "5060453",
      productName: "3. みんなのGOLF ポータブル2",
      status: "A",
      qty: 2,
      subCategory: "リサイクルUMD",
      staffCode: "9999999",
    },
    {
      id: 4,
      rowNo: 4,
      code: "5060501",
      productName: "4. ラチェット＆クランク",
      status: "B",
      qty: 1,
      subCategory: "リサイクルUMD",
      staffCode: "1234567",
    },
    {
      id: 5,
      rowNo: 5,
      code: "5060589",
      productName: "5. グランツーリスモ4",
      status: "A",
      qty: 1,
      subCategory: "リサイクルUMD",
      staffCode: "9999999",
    },
  ],
  "002-03": [
    {
      id: 10,
      rowNo: 1,
      code: "3021001",
      productName: "1. ユニクロ スラックス ブラック L",
      status: "A",
      qty: 1,
      subCategory: "リサイクルボトムス",
      staffCode: "9999999",
    },
    {
      id: 11,
      rowNo: 2,
      code: "3021002",
      productName: "2. GU デニムパンツ スリム 32インチ",
      status: "A",
      qty: 2,
      subCategory: "リサイクルボトムス",
      staffCode: "9999999",
    },
    {
      id: 12,
      rowNo: 3,
      code: "3021003",
      productName: "3. ユニクロ フリースジャケット ピンク M",
      status: "A",
      qty: 1,
      subCategory: "リサイクルトップス",
      staffCode: "9999999",
    },
    {
      id: 13,
      rowNo: 4,
      code: "3021004",
      productName: "4. ジーユー オーバーサイズシャツ ホワイト L",
      status: "B",
      qty: 1,
      subCategory: "リサイクルトップス",
      staffCode: "1234567",
    },
  ],
  "200-05": [
    {
      id: 20,
      rowNo: 1,
      code: "7001001",
      productName: "1. グッチ GGキャンバス トートバッグ",
      status: "A",
      qty: 1,
      subCategory: "リサイクルバッグ",
      staffCode: "9999999",
    },
    {
      id: 21,
      rowNo: 2,
      code: "7001002",
      productName: "2. ルイヴィトン モノグラム ベルト 90cm",
      status: "A",
      qty: 1,
      subCategory: "リサイクルベルト",
      staffCode: "9999999",
    },
    {
      id: 22,
      rowNo: 3,
      code: "7001003",
      productName: "3. シャネル チェーンウォレット ブラック",
      status: "B",
      qty: 1,
      subCategory: "リサイクル財布",
      staffCode: "1234567",
    },
    {
      id: 23,
      rowNo: 4,
      code: "7001004",
      productName: "4. バーバリー チェックマフラー ベージュ",
      status: "A",
      qty: 3,
      subCategory: "リサイクル小物",
      staffCode: "9999999",
    },
  ],
  "001-15": [
    {
      id: 30,
      rowNo: 1,
      code: "9001001",
      productName: "1. パナソニック ヘアドライヤー EH-NE65",
      status: "A",
      qty: 2,
      subCategory: "リサイクル家電",
      staffCode: "9999999",
    },
    {
      id: 31,
      rowNo: 2,
      code: "9001002",
      productName: "2. ソニー ワイヤレスイヤホン WF-1000XM5",
      status: "A",
      qty: 1,
      subCategory: "リサイクル家電",
      staffCode: "9999999",
    },
    {
      id: 32,
      rowNo: 3,
      code: "9001003",
      productName: "3. アップル AirPods Pro 第2世代",
      status: "A",
      qty: 1,
      subCategory: "リサイクル家電",
      staffCode: "9999999",
    },
    {
      id: 33,
      rowNo: 4,
      code: "9001004",
      productName: "4. ダイソン V15 Detect コードレス掃除機",
      status: "B",
      qty: 1,
      subCategory: "リサイクル家電",
      staffCode: "1234567",
    },
  ],
};

// Product code → product info + list of shelf registrations
const PRODUCT_MOCK_DATA: Record<
  string,
  { info: ProductInfo; rows: ProductShelfRow[] }
> = {
  "5060388": {
    info: {
      code: "5060388",
      productName: "1. ぬがせっ!! SEXY スロット天国DX",
      status: "A",
    },
    rows: [
      {
        id: 101,
        rowNo: 1,
        shelfLocation: "0001-01",
        staffCode: "9999999",
        staffName: "けんしゅうせい",
        qty: 1,
        code: "5060388",
      },
      {
        id: 102,
        rowNo: 2,
        shelfLocation: "0001-02",
        staffCode: "9999999",
        staffName: "けんしゅうせい",
        qty: 1,
        code: "5060388",
      },
    ],
  },
  "5060412": {
    info: {
      code: "5060412",
      productName: "2. SIMPLE2000シリーズ Vol.128 THE バイクレース",
      status: "A",
    },
    rows: [
      {
        id: 103,
        rowNo: 1,
        shelfLocation: "0002-03",
        staffCode: "9999999",
        staffName: "やまだ",
        qty: 1,
        code: "5060412",
      },
    ],
  },
  "5060453": {
    info: {
      code: "5060453",
      productName: "3. みんなのGOLF ポータブル2",
      status: "A",
    },
    rows: [
      {
        id: 104,
        rowNo: 1,
        shelfLocation: "0001-01",
        staffCode: "9999999",
        staffName: "けんしゅうせい",
        qty: 1,
        code: "5060453",
      },
      {
        id: 105,
        rowNo: 2,
        shelfLocation: "0003-05",
        staffCode: "1234567",
        staffName: "さとう",
        qty: 1,
        code: "5060453",
      },
    ],
  },
  "9001002": {
    info: {
      code: "9001002",
      productName: "2. ソニー ワイヤレスイヤホン WF-1000XM5",
      status: "A",
    },
    rows: [
      {
        id: 106,
        rowNo: 1,
        shelfLocation: "0004-02",
        staffCode: "9999999",
        staffName: "たなか",
        qty: 1,
        code: "9001002",
      },
    ],
  },
  "7001001": {
    info: {
      code: "7001001",
      productName: "1. グッチ GGキャンバス トートバッグ",
      status: "A",
    },
    rows: [
      {
        id: 107,
        rowNo: 1,
        shelfLocation: "0005-01",
        staffCode: "9999999",
        staffName: "やまだ",
        qty: 1,
        code: "7001001",
      },
      {
        id: 108,
        rowNo: 2,
        shelfLocation: "0005-02",
        staffCode: "1234567",
        staffName: "けんしゅうせい",
        qty: 1,
        code: "7001001",
      },
    ],
  },
};

// ── Page ──────────────────────────────────────────────────────────────────────

function CorrectionV2Page() {
  const { t } = useTranslation();

  const scanInputRef = useRef<HTMLInputElement>(null);
  const addCodeRef = useRef<HTMLInputElement>(null);

  const [scanInput, setScanInput] = useState("");
  const [currentShelf, setCurrentShelf] = useState<string | null>(null);
  const [inputType, setInputType] = useState<"shelf" | "product" | null>(null);

  // Shelf mode rows
  const [shelfRows, setShelfRows] = useState<ProductRow[]>([]);
  // Product code mode rows
  const [productRows, setProductRows] = useState<ProductShelfRow[]>([]);
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [addCode, setAddCode] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [runZeroConfirmOpen, setRunZeroConfirmOpen] = useState(false);
  const [dialogState, setDialogState] = useState<DialogState>({ kind: "none" });
  const [newQty, setNewQty] = useState("");
  const [toast, setToast] = useState({ open: false, message: "" });

  useLayoutConfig({ title: t("page.tanazaoroshi.correctionV2.title") });

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleSearch = () => {
    const val = scanInput.trim();
    if (!val) return;

    if (SHELF_MOCK_DATA[val]) {
      setInputType("shelf");
      setCurrentShelf(val);
      setShelfRows(SHELF_MOCK_DATA[val]);
      setProductRows([]);
      setProductInfo(null);
      setTimeout(() => addCodeRef.current?.focus(), 50);
    } else if (PRODUCT_MOCK_DATA[val]) {
      const data = PRODUCT_MOCK_DATA[val];
      setInputType("product");
      setCurrentShelf(val);
      setProductInfo(data.info);
      setProductRows(data.rows);
      setShelfRows([]);
      setTimeout(() => scanInputRef.current?.focus(), 50);
    } else {
      setInputType(null);
      setCurrentShelf(val);
      setShelfRows([]);
      setProductRows([]);
      setProductInfo(null);
    }
    setScanInput("");
    setRowSelection({});
    setIsDirty(false);
  };

  const handleInlineAdd = () => {
    const code = addCode.trim();
    if (!code) return;
    const newRow: ProductRow = {
      id: Date.now(),
      rowNo: shelfRows.length + 1,
      code,
      productName: code,
      status: "A",
      qty: 1,
      subCategory: "ー",
      staffCode: "9999999",
      isNew: true,
    };
    setShelfRows((prev) => [...prev, newRow]);
    setAddCode("");
    setIsDirty(true);
    setToast({
      open: true,
      message: t("page.tanazaoroshi.correctionV2.toast.added", { code }),
    });
    setTimeout(() => addCodeRef.current?.focus(), 0);
  };

  const handleShelfQtyChange = useCallback((id: number, qty: number) => {
    setShelfRows((prev) => prev.map((r) => (r.id === id ? { ...r, qty } : r)));
    setIsDirty(true);
  }, []);

  const handleProductQtyChange = useCallback((id: number, qty: number) => {
    setProductRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, qty } : r)),
    );
    setIsDirty(true);
  }, []);

  const handleShelfDelete = useCallback(
    (row: ProductRow) => {
      setShelfRows((prev) => prev.filter((r) => r.id !== row.id));
      setRowSelection({});
      setIsDirty(true);
      setToast({
        open: true,
        message: t("page.tanazaoroshi.correctionV2.toast.productDeleted", {
          name: row.productName,
        }),
      });
    },
    [t],
  );

  const handleProductDelete = useCallback(
    (row: ProductShelfRow) => {
      setProductRows((prev) => prev.filter((r) => r.id !== row.id));
      setRowSelection({});
      setIsDirty(true);
      setToast({
        open: true,
        message: t("page.tanazaoroshi.correctionV2.toast.shelfRegDeleted", {
          location: row.shelfLocation,
        }),
      });
    },
    [t],
  );

  const handleBulkDelete = () => {
    if (inputType === "shelf") {
      const count = shelfRows.filter((r) => rowSelection[String(r.id)]).length;
      setShelfRows((prev) => prev.filter((r) => !rowSelection[String(r.id)]));
      setToast({
        open: true,
        message: t("page.tanazaoroshi.correctionV2.toast.bulkDeleted", {
          count,
        }),
      });
    } else {
      const count = productRows.filter(
        (r) => rowSelection[String(r.id)],
      ).length;
      setProductRows((prev) => prev.filter((r) => !rowSelection[String(r.id)]));
      setToast({
        open: true,
        message: t("page.tanazaoroshi.correctionV2.toast.bulkDeleted", {
          count,
        }),
      });
    }
    setRowSelection({});
    setIsDirty(true);
  };

  const handleRunClick = () => {
    if (zeroQtyRows.length > 0) setRunZeroConfirmOpen(true);
    else performRun();
  };

  const performRun = () => {
    if (inputType === "shelf") {
      setShelfRows((prev) => prev.filter((r) => r.qty > 0));
    } else {
      setProductRows((prev) => prev.filter((r) => r.qty > 0));
    }
    setIsDirty(false);
    setRunZeroConfirmOpen(false);
    setToast({
      open: true,
      message: t("page.tanazaoroshi.correctionV2.toast.saved"),
    });
  };

  const handleBulkCorrect = () => {
    const qty = parseInt(newQty, 10);
    if (isNaN(qty) || qty < 0) return;
    const selectedCount = Object.values(rowSelection).filter(Boolean).length;
    if (inputType === "shelf") {
      setShelfRows((prev) =>
        prev.map((r) => (rowSelection[String(r.id)] ? { ...r, qty } : r)),
      );
    } else {
      setProductRows((prev) =>
        prev.map((r) => (rowSelection[String(r.id)] ? { ...r, qty } : r)),
      );
    }
    setDialogState({ kind: "none" });
    setNewQty("");
    setIsDirty(true);
    setToast({
      open: true,
      message: t("page.tanazaoroshi.correctionV2.toast.bulkCorrected", {
        count: selectedCount,
        qty,
      }),
    });
  };

  const someSelected = Object.values(rowSelection).some(Boolean);
  const selectedCount = Object.values(rowSelection).filter(Boolean).length;
  const zeroQtyRows =
    inputType === "shelf"
      ? shelfRows.filter((r) => r.qty === 0)
      : productRows.filter((r) => r.qty === 0);

  // ── Shelf columns: No. | コード | 品名 | 状 | 数量 | 小分類名 | 担当者 | 操作 ──

  const shelfColumns = useMemo<ColumnDef<ProductRow>[]>(
    () => [
      {
        id: "rowNo",
        header: t("page.tanazaoroshi.correctionV2.shelfCol.rowNo"),
        size: 55,
        enableSorting: false,
        cell: ({ row }) => (
          <Typography
            sx={{
              fontSize: "0.82rem",
              color: "text.secondary",
              textAlign: "center",
            }}
          >
            {String(row.original.rowNo).padStart(3, "0")}
          </Typography>
        ),
        meta: {
          headerSx: { textAlign: "center" },
          cellSx: { textAlign: "center" },
        },
      },
      {
        id: "code",
        header: t("page.tanazaoroshi.correctionV2.shelfCol.code"),
        size: 110,
        enableSorting: false,
        cell: ({ row }) => (
          <Typography sx={{ fontFamily: "monospace", fontSize: "0.82rem" }}>
            {row.original.code}
          </Typography>
        ),
        meta: { cellSx: { whiteSpace: "nowrap" as const } },
      },
      {
        id: "productName",
        header: t("page.tanazaoroshi.correctionV2.shelfCol.productName"),
        enableSorting: false,
        cell: ({ row }) => (
          <Typography sx={{ fontSize: "0.85rem" }}>
            {row.original.productName}
          </Typography>
        ),
        meta: { cellSx: { minWidth: 200 } },
      },
      {
        id: "status",
        header: t("page.tanazaoroshi.correctionV2.shelfCol.status"),
        size: 45,
        enableSorting: false,
        cell: ({ row }) => (
          <Typography
            sx={{
              fontSize: "0.82rem",
              textAlign: "center",
              fontWeight: 600,
              color:
                row.original.status === "A" ? "text.primary" : "warning.main",
            }}
          >
            {row.original.status}
          </Typography>
        ),
        meta: {
          headerSx: { textAlign: "center" },
          cellSx: { textAlign: "center" },
        },
      },
      {
        id: "qty",
        header: t("page.tanazaoroshi.correctionV2.shelfCol.quantity"),
        size: 110,
        enableSorting: false,
        cell: ({ row }) => (
          <QuantityStepper
            compact
            value={row.original.qty}
            min={0}
            onChange={(qty) => handleShelfQtyChange(row.original.id, qty)}
          />
        ),
        meta: {
          headerSx: { textAlign: "center" },
          cellSx: { textAlign: "center", whiteSpace: "nowrap" as const },
        },
      },
      {
        id: "subCategory",
        header: t("page.tanazaoroshi.correctionV2.shelfCol.subCategory"),
        enableSorting: false,
        cell: ({ row }) => (
          <Typography sx={{ fontSize: "0.82rem" }}>
            {row.original.subCategory}
          </Typography>
        ),
        meta: { cellSx: { minWidth: 120 } },
      },
      {
        id: "staffCode",
        header: t("page.tanazaoroshi.correctionV2.shelfCol.operator"),
        size: 90,
        enableSorting: false,
        cell: ({ row }) => (
          <Typography sx={{ fontFamily: "monospace", fontSize: "0.82rem" }}>
            {row.original.staffCode}
          </Typography>
        ),
        meta: { cellSx: { whiteSpace: "nowrap" as const } },
      },
      {
        id: "actions",
        header: t("page.tanazaoroshi.correctionV2.shelfCol.actions"),
        size: 56,
        enableSorting: false,
        cell: ({ row }) => (
          <Tooltip
            title={t("page.tanazaoroshi.correctionV2.delete")}
            placement="left"
          >
            <IconButton
              size="small"
              color="error"
              onClick={() => handleShelfDelete(row.original)}
            >
              <DeleteOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ),
        meta: {
          headerSx: { textAlign: "center" },
          cellSx: { textAlign: "center" },
        },
      },
    ],
    [t, handleShelfQtyChange, handleShelfDelete],
  );

  // ── Product columns: No. | 什器No-棚段 | 担当者コード | 担当者名 | 数量 | コード | 操作 ──

  const productColumns = useMemo<ColumnDef<ProductShelfRow>[]>(
    () => [
      {
        id: "rowNo",
        header: t("page.tanazaoroshi.correctionV2.productCol.rowNo"),
        size: 55,
        enableSorting: false,
        cell: ({ row }) => (
          <Typography
            sx={{
              fontSize: "0.82rem",
              color: "text.secondary",
              textAlign: "center",
            }}
          >
            {String(row.original.rowNo).padStart(3, "0")}
          </Typography>
        ),
        meta: {
          headerSx: { textAlign: "center" },
          cellSx: { textAlign: "center" },
        },
      },
      {
        id: "shelfLocation",
        header: t("page.tanazaoroshi.correctionV2.productCol.shelfLocation"),
        size: 120,
        enableSorting: false,
        cell: ({ row }) => (
          <Typography sx={{ fontFamily: "monospace", fontSize: "0.82rem" }}>
            {row.original.shelfLocation}
          </Typography>
        ),
        meta: { cellSx: { whiteSpace: "nowrap" as const } },
      },
      {
        id: "staffCode",
        header: t("page.tanazaoroshi.correctionV2.productCol.staffCode"),
        size: 110,
        enableSorting: false,
        cell: ({ row }) => (
          <Typography sx={{ fontFamily: "monospace", fontSize: "0.82rem" }}>
            {row.original.staffCode}
          </Typography>
        ),
        meta: { cellSx: { whiteSpace: "nowrap" as const } },
      },
      {
        id: "staffName",
        header: t("page.tanazaoroshi.correctionV2.productCol.staffName"),
        enableSorting: false,
        cell: ({ row }) => (
          <Typography sx={{ fontSize: "0.85rem" }}>
            {row.original.staffName}
          </Typography>
        ),
        meta: { cellSx: { minWidth: 120 } },
      },
      {
        id: "qty",
        header: t("page.tanazaoroshi.correctionV2.productCol.quantity"),
        size: 110,
        enableSorting: false,
        cell: ({ row }) => (
          <QuantityStepper
            compact
            value={row.original.qty}
            min={0}
            onChange={(qty) => handleProductQtyChange(row.original.id, qty)}
          />
        ),
        meta: {
          headerSx: { textAlign: "center" },
          cellSx: { textAlign: "center", whiteSpace: "nowrap" as const },
        },
      },
      {
        id: "code",
        header: t("page.tanazaoroshi.correctionV2.productCol.code"),
        size: 110,
        enableSorting: false,
        cell: ({ row }) => (
          <Typography sx={{ fontFamily: "monospace", fontSize: "0.82rem" }}>
            {row.original.code}
          </Typography>
        ),
        meta: { cellSx: { whiteSpace: "nowrap" as const } },
      },
      {
        id: "actions",
        header: t("page.tanazaoroshi.correctionV2.productCol.actions"),
        size: 56,
        enableSorting: false,
        cell: ({ row }) => (
          <Tooltip
            title={t("page.tanazaoroshi.correctionV2.delete")}
            placement="left"
          >
            <IconButton
              size="small"
              color="error"
              onClick={() => handleProductDelete(row.original)}
            >
              <DeleteOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ),
        meta: {
          headerSx: { textAlign: "center" },
          cellSx: { textAlign: "center" },
        },
      },
    ],
    [t, handleProductQtyChange, handleProductDelete],
  );

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        height: "100%",
      }}
    >
      {/* Notes */}
      <Paper
        variant="outlined"
        sx={{ p: 1.25, bgcolor: "#f5f8ff", borderColor: "#c5d3f5" }}
      >
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.75 }}
        >
          <InfoOutlinedIcon
            sx={{ fontSize: "0.85rem", color: "info.main", flexShrink: 0 }}
          />
          <Typography
            sx={{
              fontSize: "0.78rem",
              fontWeight: 600,
              color: "text.secondary",
            }}
          >
            {t("page.tanazaoroshi.correctionV2.notes.heading")}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 3, pl: 2, flexWrap: "wrap" }}>
          <Box>
            <Typography
              sx={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "primary.main",
              }}
            >
              {t("page.tanazaoroshi.correctionV2.notes.shelf.title")}
            </Typography>
            <Typography sx={{ fontSize: "0.72rem", color: "text.secondary" }}>
              {t("page.tanazaoroshi.correctionV2.notes.shelf.display")}
            </Typography>
            <Typography sx={{ fontSize: "0.72rem", color: "text.secondary" }}>
              {t("page.tanazaoroshi.correctionV2.notes.shelf.action")}
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box>
            <Typography
              sx={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "secondary.main",
              }}
            >
              {t("page.tanazaoroshi.correctionV2.notes.product.title")}
            </Typography>
            <Typography sx={{ fontSize: "0.72rem", color: "text.secondary" }}>
              {t("page.tanazaoroshi.correctionV2.notes.product.display")}
            </Typography>
            <Typography sx={{ fontSize: "0.72rem", color: "text.secondary" }}>
              {t("page.tanazaoroshi.correctionV2.notes.product.action")}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Scan input bar */}
      <Paper variant="outlined" sx={{ p: 1.5 }}>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <OutlinedInput
            size="small"
            inputRef={scanInputRef}
            autoFocus
            value={scanInput}
            onChange={(e) => setScanInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder={t("page.tanazaoroshi.correctionV2.scanPlaceholder")}
            startAdornment={
              <InputAdornment position="start">
                <QrCodeScannerIcon
                  fontSize="small"
                  sx={{ color: "text.secondary" }}
                />
              </InputAdornment>
            }
            endAdornment={
              scanInput ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setScanInput("")}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null
            }
            sx={{ flex: 1, maxWidth: 400 }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={!scanInput.trim()}
          >
            {t("page.tanazaoroshi.correctionV2.search")}
          </Button>
        </Box>
      </Paper>

      {/* ── SHELF MODE ──────────────────────────────────────────────────────── */}
      {inputType !== "product" && (
        <>
          {currentShelf && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip
                label={`${t("page.tanazaoroshi.correctionV2.shelfLabel")}：${currentShelf}`}
                size="small"
                color="primary"
                variant="outlined"
              />
              <Typography
                sx={{
                  fontSize: "0.78rem",
                  color: "text.secondary",
                  ml: "auto",
                }}
              >
                {t("page.tanazaoroshi.correctionV2.scanOperator")}：
                <strong>田中</strong>
              </Typography>
            </Box>
          )}
          <AppTable<ProductRow>
            data={shelfRows}
            columns={shelfColumns}
            getRowId={(row) => String(row.id)}
            rowSelection
            state={{ rowSelection }}
            onRowSelectionChange={setRowSelection}
            stickyHeader
            containerMaxHeight={360}
            dense
            topInputRow={
              inputType === "shelf" ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <QrCodeScannerIcon
                    sx={{
                      fontSize: "1rem",
                      color: "text.disabled",
                      flexShrink: 0,
                    }}
                  />
                  <InputBase
                    inputRef={addCodeRef}
                    value={addCode}
                    onChange={(e) => setAddCode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleInlineAdd()}
                    placeholder={t(
                      "page.tanazaoroshi.correctionV2.addCodePlaceholder",
                    )}
                    sx={{
                      flex: 1,
                      fontSize: "0.875rem",
                      "& input": {
                        p: 0,
                        py: 0.25,
                        borderBottom: "1px solid",
                        borderColor: "success.main",
                      },
                    }}
                  />
                </Box>
              ) : undefined
            }
            emptyMessage={
              <Box sx={{ textAlign: "center", color: "text.disabled", pt: 3 }}>
                <QrCodeScannerIcon sx={{ fontSize: 40, mb: 0.5 }} />
                <Typography sx={{ fontSize: "0.9rem", color: "text.disabled" }}>
                  {currentShelf
                    ? t("page.tanazaoroshi.correctionV2.noData")
                    : t("page.tanazaoroshi.correctionV2.emptyPrompt")}
                </Typography>
              </Box>
            }
            tableSx={{ minWidth: 700 }}
          />
        </>
      )}

      {/* ── PRODUCT CODE MODE ───────────────────────────────────────────────── */}
      {inputType === "product" && productInfo && (
        <>
          {/* Product info header */}
          <Paper variant="outlined" sx={{ p: 1.25 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                flexWrap: "wrap",
              }}
            >
              <Box>
                <Typography
                  sx={{ fontSize: "0.7rem", color: "text.secondary" }}
                >
                  {t("page.tanazaoroshi.correctionV2.productInfo.code")}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "monospace",
                    fontSize: "0.92rem",
                    fontWeight: 700,
                  }}
                >
                  {productInfo.code}
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{ fontSize: "0.7rem", color: "text.secondary" }}
                >
                  {t("page.tanazaoroshi.correctionV2.productInfo.name")}
                </Typography>
                <Typography sx={{ fontSize: "0.92rem", fontWeight: 600 }}>
                  {productInfo.productName}
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box>
                <Typography
                  sx={{ fontSize: "0.7rem", color: "text.secondary" }}
                >
                  {t("page.tanazaoroshi.correctionV2.productInfo.status")}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.92rem",
                    fontWeight: 700,
                    color:
                      productInfo.status === "A"
                        ? "success.main"
                        : "warning.main",
                  }}
                >
                  {productInfo.status}
                </Typography>
              </Box>
            </Box>
          </Paper>

          <AppTable<ProductShelfRow>
            data={productRows}
            columns={productColumns}
            getRowId={(row) => String(row.id)}
            rowSelection
            state={{ rowSelection }}
            onRowSelectionChange={setRowSelection}
            stickyHeader
            containerMaxHeight={360}
            dense
            emptyMessage={
              <Box sx={{ textAlign: "center", color: "text.disabled", pt: 3 }}>
                <Typography sx={{ fontSize: "0.9rem" }}>
                  {t("page.tanazaoroshi.correctionV2.noData")}
                </Typography>
              </Box>
            }
            tableSx={{ minWidth: 600 }}
          />
        </>
      )}

      {/* ── Action bar ─────────────────────────────────────────────────────── */}
      <Paper
        variant="outlined"
        sx={{
          p: 1,
          display: "flex",
          gap: 1,
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        {zeroQtyRows.length > 0 && (
          <Typography
            sx={{ fontSize: "0.75rem", color: "warning.main", mr: "auto" }}
          >
            {t("page.tanazaoroshi.correctionV2.zeroQtyWarning", {
              count: zeroQtyRows.length,
            })}
          </Typography>
        )}
        <Button
          size="small"
          variant="outlined"
          disabled={!someSelected}
          startIcon={<EditIcon fontSize="small" />}
          onClick={() => {
            setDialogState({ kind: "correct" });
            setNewQty("");
          }}
        >
          {t("page.tanazaoroshi.correctionV2.action.correct")}{" "}
          {someSelected && `(${selectedCount})`}
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="error"
          disabled={!someSelected}
          onClick={handleBulkDelete}
        >
          {t("page.tanazaoroshi.correctionV2.action.deleteRow")}
        </Button>
        <Button
          size="small"
          variant="contained"
          color="success"
          startIcon={<PlayArrowIcon fontSize="small" />}
          disabled={!isDirty}
          onClick={handleRunClick}
        >
          {t("page.tanazaoroshi.correctionV2.action.run")}
        </Button>
      </Paper>

      {/* Bulk correct dialog */}
      <AppModal
        open={dialogState.kind === "correct"}
        onClose={() => setDialogState({ kind: "none" })}
        title={t("page.tanazaoroshi.correctionV2.correctDialog.title")}
        actions={[
          {
            label: t("page.tanazaoroshi.correctionV2.correctDialog.cancel"),
            onClick: () => setDialogState({ kind: "none" }),
            color: "inherit",
          },
          {
            label: t("page.tanazaoroshi.correctionV2.correctDialog.save"),
            onClick: handleBulkCorrect,
            variant: "contained",
            disabled: newQty === "",
          },
        ]}
      >
        <Typography
          sx={{ fontSize: "0.85rem", color: "text.secondary", mb: 1.5 }}
        >
          {t("page.tanazaoroshi.correctionV2.correctDialog.descriptionPrefix")}{" "}
          <strong>{selectedCount}</strong>{" "}
          {t("page.tanazaoroshi.correctionV2.correctDialog.descriptionSuffix")}
        </Typography>
        <TextField
          label={t("page.tanazaoroshi.correctionV2.correctDialog.quantity")}
          size="small"
          type="number"
          value={newQty}
          onChange={(e) => setNewQty(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleBulkCorrect()}
          autoFocus
          fullWidth
          slotProps={{ htmlInput: { min: 0 } }}
        />
      </AppModal>

      {/* Zero-qty confirm */}
      <AppModal
        open={runZeroConfirmOpen}
        onClose={() => setRunZeroConfirmOpen(false)}
        title={t("page.tanazaoroshi.correctionV2.zeroConfirm.title")}
        actions={[
          {
            label: t("page.tanazaoroshi.correctionV2.zeroConfirm.cancel"),
            onClick: () => setRunZeroConfirmOpen(false),
            color: "inherit",
          },
          {
            label: t("page.tanazaoroshi.correctionV2.zeroConfirm.confirm"),
            onClick: performRun,
            variant: "contained",
            color: "warning",
          },
        ]}
      >
        <Typography sx={{ fontSize: "0.9rem", mb: 1 }}>
          {t("page.tanazaoroshi.correctionV2.zeroConfirm.message", {
            count: zeroQtyRows.length,
          })}
        </Typography>
        <Typography
          sx={{ fontSize: "0.85rem", color: "text.secondary", mb: 1 }}
        >
          {t("page.tanazaoroshi.correctionV2.zeroConfirm.note")}
        </Typography>
        <Box sx={{ pl: 1 }}>
          {inputType === "shelf"
            ? (zeroQtyRows as ProductRow[]).map((r) => (
                <Typography
                  key={r.id}
                  sx={{ fontSize: "0.82rem", color: "error.main" }}
                >
                  ・{r.productName}（{r.code}）
                </Typography>
              ))
            : (zeroQtyRows as ProductShelfRow[]).map((r) => (
                <Typography
                  key={r.id}
                  sx={{ fontSize: "0.82rem", color: "error.main" }}
                >
                  ・{r.shelfLocation}（{r.staffName}）
                </Typography>
              ))}
        </Box>
        <Typography
          sx={{ fontSize: "0.82rem", color: "text.secondary", mt: 1 }}
        >
          {t("page.tanazaoroshi.correctionV2.zeroConfirm.continue")}
        </Typography>
      </AppModal>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert severity="success" variant="filled" sx={{ fontSize: "0.85rem" }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
