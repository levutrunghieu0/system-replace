import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import type { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Paper,
  Snackbar,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import ClearIcon from "@mui/icons-material/Clear";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ImageIcon from "@mui/icons-material/Image";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";

import { AppTable } from "../components/table";
import { useLayoutConfig } from "../hooks/useLayoutConfig";

export const Route = createFileRoute("/inventory/disposal-correction")({
  component: DisposalCorrectionPage,
});

// --- MOCK DATA ---
interface CorrectionItem {
  id: string;
  code: string;
  name: string;
  size: string;
  type: string;
  state: string;
  quantity: number;
  price: number;
  reason: string;
}

const PAST_SLIPS: Record<string, CorrectionItem[]> = {
  "SLIP-20260520": [
    {
      id: "1",
      code: "1234567890123",
      name: "Nike Zoom Vomero 5",
      size: "メンズ/25cm",
      type: "リユース",
      state: "中古A",
      quantity: 1,
      price: 13500,
      reason: "基準外",
    },
    {
      id: "2",
      code: "9876543210987",
      name: "Air Force 1",
      size: "レディース/23cm",
      type: "グロス",
      state: "中古B",
      quantity: 5,
      price: 8000,
      reason: "品質劣化",
    },
  ],
};

function DisposalCorrectionPage() {
  const [managerCode, setManagerCode] = useState<string>("");
  const [scanInput, setScanInput] = useState("");
  const [items, setItems] = useState<CorrectionItem[]>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [currentSlip, setCurrentSlip] = useState<string | null>(null);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning",
  });

  // Dialog Confirmation State (U-02-02-03)
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: "correct" | "cancel" | null;
  }>({ open: false, type: null });

  useLayoutConfig({ title: "廃棄修正" }); // Màn hình 837

  const handleScan = () => {
    const val = scanInput.trim();
    if (!val) return;
    setScanInput("");

    // U-02-02-02: Yêu cầu mã quản lý
    if (!managerCode) {
      if (val.startsWith("MGR")) {
        setManagerCode(val);
        setToast({
          open: true,
          message: "管理者権限を認証しました。",
          severity: "success",
        });
      } else {
        setToast({
          open: true,
          message: "管理者の担当者コードをスキャンしてください。(MGR...)",
          severity: "error",
        });
      }
      return;
    }

    // Tìm kiếm Slip cũ
    const slipData = PAST_SLIPS[val];
    if (slipData) {
      setCurrentSlip(val);
      setItems(slipData);
      setToast({
        open: true,
        message: `伝票 ${val} を読み込みました。`,
        severity: "success",
      });
    } else {
      setToast({
        open: true,
        message: "該当する伝票が見つかりません。",
        severity: "error",
      });
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item,
      ),
    );
  };

  const executeAction = () => {
    if (confirmDialog.type === "cancel") {
      setItems([]);
      setCurrentSlip(null);
      setToast({
        open: true,
        message: "廃棄伝票の取消（X-05）を実行し、修正伝票を発行しました。",
        severity: "success",
      });
    } else if (confirmDialog.type === "correct") {
      setItems([]);
      setCurrentSlip(null);
      setToast({
        open: true,
        message: "廃棄伝票の訂正（X-06）を実行し、修正伝票を発行しました。",
        severity: "success",
      });
    }
    setConfirmDialog({ open: false, type: null });
  };

  const columns = useMemo<ColumnDef<CorrectionItem>[]>(
    () => [
      {
        id: "productInfo",
        header: "商品情報",
        cell: ({ row }) => (
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ImageIcon sx={{ fontSize: 24, color: "text.disabled" }} />
            </Box>
            <Box>
              <Box sx={{ display: "flex", gap: 0.5, mb: 0.5 }}>
                <Chip
                  label={row.original.type}
                  size="small"
                  color={row.original.type === "リユース" ? "warning" : "info"}
                  sx={{ fontSize: "0.65rem", height: 18 }}
                />
                <Typography
                  sx={{
                    fontSize: "0.7rem",
                    color: "text.secondary",
                    bgcolor: "#f5f5f5",
                    px: 0.5,
                    borderRadius: 0.5,
                  }}
                >
                  {row.original.size}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: "0.85rem", fontWeight: 600 }}>
                {row.original.name}
              </Typography>
            </Box>
          </Box>
        ),
        meta: { cellSx: { minWidth: 260 } },
      },
      {
        id: "code",
        header: "コード",
        cell: ({ row }) => (
          <Typography sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
            {row.original.code}
          </Typography>
        ),
      },
      {
        id: "quantity",
        header: "修正数量",
        cell: ({ row }) => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
            }}
          >
            <IconButton
              size="small"
              onClick={() => updateQuantity(row.original.id, -1)}
              disabled={row.original.quantity <= 1}
            >
              <RemoveIcon fontSize="small" />
            </IconButton>
            <Typography
              sx={{
                fontSize: "0.9rem",
                fontWeight: 600,
                minWidth: 24,
                textAlign: "center",
              }}
            >
              {row.original.quantity}
            </Typography>
            <IconButton
              size="small"
              onClick={() => updateQuantity(row.original.id, 1)}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Box>
        ),
        meta: {
          headerSx: { textAlign: "center" },
          cellSx: { textAlign: "center" },
        },
      },
      {
        id: "reason",
        header: "廃棄理由",
        cell: ({ row }) => (
          <Chip
            label={row.original.reason}
            size="small"
            sx={{ fontSize: "0.75rem", bgcolor: "#e0e0e0" }}
          />
        ),
      },
    ],
    [],
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        height: "100%",
        bgcolor: "#f4f6f8",
        p: 2,
      }}
    >
      {/* HEADER BAR ĐỒNG BỘ UI MỚI */}
      <Paper
        variant="outlined"
        sx={{
          p: 1.5,
          display: "flex",
          gap: 1,
          alignItems: "center",
          flexWrap: "wrap",
          bgcolor: "#fff",
        }}
      >
        <OutlinedInput
          size="small"
          value={scanInput}
          onChange={(e) => setScanInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleScan()}
          placeholder={
            !managerCode
              ? "管理者の担当者コードをスキャンしてください"
              : "修正対象の伝票番号をスキャン (例: SLIP-...)"
          }
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
          sx={{ width: 320, bgcolor: "#fff" }}
          autoFocus
        />
        <Button
          variant="contained"
          onClick={handleScan}
          disabled={!scanInput.trim()}
        >
          検索
        </Button>

        {managerCode && (
          <Chip
            label={`責任者：${managerCode}`}
            size="small"
            color="error"
            variant="outlined"
            sx={{ ml: "auto", fontWeight: 600 }}
          />
        )}
      </Paper>

      {/* BODY CONTENT */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          opacity: managerCode ? 1 : 0.4,
          pointerEvents: managerCode ? "auto" : "none",
        }}
      >
        <AppTable<CorrectionItem>
          data={items}
          columns={columns}
          getRowId={(row) => row.id}
          rowSelection
          state={{ rowSelection }}
          onRowSelectionChange={setRowSelection}
          stickyHeader
          containerMaxHeight="calc(100vh - 240px)"
          // EMPTY STATE ĐỒNG BỘ UI MỚI
          emptyMessage={
            <Box
              sx={{ textAlign: "center", color: "text.disabled", pt: 6, pb: 6 }}
            >
              <QrCodeScannerIcon sx={{ fontSize: 48, mb: 1 }} />
              <Typography
                sx={{
                  fontSize: "1rem",
                  color: "text.disabled",
                  fontWeight: 400,
                  whiteSpace: "pre-line",
                }}
              >
                {!managerCode
                  ? "管理者の担当者コードをスキャンして\n認証を行ってください。"
                  : "修正対象の廃棄伝票のバーコードをスキャンするか、\n伝票番号を入力して検索してください。"}
              </Typography>
            </Box>
          }
        />
      </Box>

      {/* BOTTOM ACTION BAR ĐỒNG BỘ UI MỚI */}
      <Paper
        variant="outlined"
        sx={{
          p: 1,
          display: "flex",
          gap: 1,
          justifyContent: "flex-end",
          bgcolor: "#fff",
        }}
      >
        <Button
          size="small"
          variant="outlined"
          color="error"
          startIcon={<CancelIcon />}
          disabled={!currentSlip}
          onClick={() => setConfirmDialog({ open: true, type: "cancel" })}
        >
          取消
        </Button>
        <Button
          size="small"
          variant="contained"
          color="warning"
          startIcon={<EditIcon />}
          disabled={!currentSlip}
          onClick={() => setConfirmDialog({ open: true, type: "correct" })}
        >
          訂正実行
        </Button>
      </Paper>

      {/* DIALOG XÁC NHẬN */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, type: null })}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>処理の確認</DialogTitle>
        <DialogContent dividers>
          <Typography>
            {confirmDialog.type === "cancel"
              ? "この廃棄伝票の処理を取り消しますか？"
              : "修正した内容で訂正計上を実行しますか？"}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDialog({ open: false, type: null })}
            color="inherit"
          >
            キャンセル
          </Button>
          <Button
            onClick={executeAction}
            variant="contained"
            color={confirmDialog.type === "cancel" ? "error" : "warning"}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((p) => ({ ...p, open: false }))}
      >
        <Alert severity={toast.severity} variant="filled">
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
