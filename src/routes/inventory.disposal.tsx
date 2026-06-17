import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import type { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import {
  Alert,
  Box,
  Button,
  Chip,
  InputAdornment,
  OutlinedInput,
  Paper,
  Snackbar,
  Typography,
  Select,
  MenuItem,
  FormControl,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
} from "@mui/material";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import ClearIcon from "@mui/icons-material/Clear";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import DocumentScannerIcon from "@mui/icons-material/DocumentScanner";

import { AppTable } from "../components/table";
import { useLayoutConfig } from "../hooks/useLayoutConfig";

export const Route = createFileRoute("/inventory/disposal")({
  component: DisposalPage,
});

// --- TYPES ---
interface DisposalItem {
  id: string;
  code: string;
  name: string;
  size: string;
  type: string;
  state: string;
  quantity: number;
  price: number;
  reasonGroup: string;
  reasonDetail: string;
  comment: string;
}

type ProductBase = Omit<
  DisposalItem,
  "id" | "quantity" | "reasonGroup" | "reasonDetail" | "comment"
>;

// --- MOCK DATA ---
const MOCK_DB: Record<string, ProductBase> = {
  "1234567890123": {
    code: "1234567890123",
    name: "Nike Zoom Vomero 5",
    size: "メンズ/25cm",
    type: "リユース",
    state: "中古A",
    price: 13500,
  },
};

const REASON_GROUPS = ["基準外", "長期滞留", "品質劣化", "買取ミス"];
const REASON_DETAILS = [
  "【本部指摘】EC二次検品 | EC監査にて基準外指摘",
  "その他",
];

function DisposalPage() {
  // --- STATE ---
  const [staffCode, setStaffCode] = useState<string>("");
  const [scanInput, setScanInput] = useState("");
  const [items, setItems] = useState<DisposalItem[]>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning",
  });

  // Trạng thái lưu trữ ngữ cảnh nghiệp vụ
  const [disposalContext, setDisposalContext] = useState<{
    active: boolean;
    group: string;
    detail: string;
    comment: string;
  } | null>(null);
  const [isPendingSlipMode, setIsPendingSlipMode] = useState(false);

  // Dialog States
  const [reasonDialogOpen, setReasonDialogOpen] = useState(false);
  const [tempGroup, setTempGroup] = useState(REASON_GROUPS[0]);
  const [tempDetail, setTempDetail] = useState("");
  const [tempComment, setTempComment] = useState("");

  useLayoutConfig({ title: "廃棄" });

  // --- LOGIC XỬ LÝ QUÉT MÃ ---
  const handleScan = () => {
    const val = scanInput.trim();
    if (!val) return;
    setScanInput("");

    // 1. Xác thực nhân viên (Bắt buộc đầu tiên)
    if (!staffCode) {
      if (val.startsWith("STAFF")) {
        setStaffCode(val);
        setToast({
          open: true,
          message: "担当者を認証しました。",
          severity: "success",
        });
      } else {
        setToast({
          open: true,
          message: "担当者コードをスキャンしてください。(STAFF...)",
          severity: "error",
        });
      }
      return;
    }

    // 2. Chế độ đọc phiếu lưu tạm (保存読込)
    if (isPendingSlipMode) {
      if (val.startsWith("SLIP")) {
        setItems([
          {
            id: "1",
            code: "1234567890123",
            name: "Nike Zoom Vomero 5",
            size: "メンズ/25cm",
            type: "リユース",
            state: "中古A",
            quantity: 1,
            price: 13500,
            reasonGroup: "基準外",
            reasonDetail: "その他",
            comment: "事前承認済み",
          },
        ]);
        setToast({
          open: true,
          message: `廃棄保存伝票 ${val} を読み込みました。`,
          severity: "success",
        });
        setIsPendingSlipMode(false);
      } else {
        setToast({
          open: true,
          message: "廃棄保存伝票バーコードをスキャンしてください。",
          severity: "warning",
        });
      }
      return;
    }

    // 3. Chế độ quét sản phẩm hủy thông thường
    if (!disposalContext?.active) {
      setToast({
        open: true,
        message: "先に「指示なし廃棄」を選択し、理由を設定してください。",
        severity: "warning",
      });
      return;
    }

    const product = MOCK_DB[val];
    if (product) {
      setItems((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          ...product,
          quantity: 1,
          reasonGroup: disposalContext.group,
          reasonDetail: disposalContext.detail,
          comment: disposalContext.comment,
        },
      ]);
    } else {
      setToast({
        open: true,
        message: "該当する商品データがありません。",
        severity: "error",
      });
    }
  };

  const handleConfirmReason = () => {
    setDisposalContext({
      active: true,
      group: tempGroup,
      detail: tempDetail,
      comment: tempComment,
    });
    setReasonDialogOpen(false);
    setIsPendingSlipMode(false); // Tắt chế độ đọc phiếu nếu đang bật
  };

  const handleSaveDisposal = () => {
    setItems([]);
    setDisposalContext(null);
    setRowSelection({});
    setToast({
      open: true,
      message: "廃棄伝票の保存を実行しました。",
      severity: "success",
    });
  };

  // --- CẤU TRÚC CỘT BẢNG ---
  const columns = useMemo<ColumnDef<DisposalItem>[]>(
    () => [
      {
        id: "name",
        header: "商品名",
        cell: ({ row }) => (
          <Typography sx={{ fontSize: "0.85rem", fontWeight: 600 }}>
            {row.original.name}
          </Typography>
        ),
      },
      {
        id: "code",
        header: "コード",
        cell: ({ row }) => (
          <Typography sx={{ fontFamily: "monospace" }}>
            {row.original.code}
          </Typography>
        ),
      },
      {
        id: "quantity",
        header: "数量",
        cell: ({ row }) => (
          <Typography sx={{ textAlign: "center" }}>
            {row.original.quantity}
          </Typography>
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
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 0.5,
              alignItems: "flex-start",
            }}
          >
            <Chip label={row.original.reasonGroup} size="small" />
            {row.original.reasonDetail && (
              <Typography sx={{ fontSize: "0.7rem", color: "text.secondary" }}>
                {row.original.reasonDetail}
              </Typography>
            )}
          </Box>
        ),
      },
    ],
    [],
  );

  const isCommentValid = tempComment.length >= 20 && tempComment.length <= 50;

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
      {/* Thanh tìm kiếm / Quét mã vạch phía trên */}
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
            !staffCode
              ? "担当者コードをスキャンしてください"
              : isPendingSlipMode
                ? "廃棄保存伝票をスキャンしてください"
                : "商品コードをスキャンまたは直接入力"
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
                <IconButton onClick={() => setScanInput("")}>
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

        {staffCode && (
          <Chip
            label={`スキャン担当者：${staffCode}`}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ ml: "auto", fontWeight: 600 }}
          />
        )}
      </Paper>

      {/* Vùng nội dung chính (Bảng dữ liệu & Nút điều hướng nghiệp vụ) */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          opacity: staffCode ? 1 : 0.4,
          pointerEvents: staffCode ? "auto" : "none",
        }}
      >
        {/* Thanh điều hướng chức năng */}
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Button
            variant={disposalContext?.active ? "contained" : "outlined"}
            startIcon={<AddIcon />}
            onClick={() => {
              setIsPendingSlipMode(false);
              setReasonDialogOpen(true);
            }}
          >
            指示なし廃棄
          </Button>
          <Button
            variant={isPendingSlipMode ? "contained" : "outlined"}
            color="secondary"
            startIcon={<DocumentScannerIcon />}
            onClick={() => setIsPendingSlipMode(true)}
          >
            保存読込
          </Button>

          {/* Hiển thị Tag trạng thái nghiệp vụ hiện tại để UX rõ ràng minh bạch */}
          {disposalContext?.active && !isPendingSlipMode && (
            <Chip
              label={`指示なし廃棄モード適用中: ${disposalContext.group}`}
              color="warning"
              variant="outlined"
              size="small"
              sx={{ ml: 1 }}
            />
          )}
        </Box>

        {/* CẢI TIẾN UX: Hiển thị Banner hướng dẫn nổi bật khi ấn nút 保存読込 */}
        {isPendingSlipMode && (
          <Alert
            severity="info"
            variant="filled"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => setIsPendingSlipMode(false)}
              >
                キャンセル
              </Button>
            }
            sx={{ boxShadow: 1 }}
          >
            【保存読込モード】廃棄保存伝票のバーコードをスキャンするか、伝票番号を入力してEnterを押してください。
          </Alert>
        )}

        {/* Bảng hiển thị Data Grid với Empty State đồng bộ theo file mẫu */}
        <AppTable<DisposalItem>
          data={items}
          columns={columns}
          getRowId={(row) => row.id}
          rowSelection
          state={{ rowSelection }}
          onRowSelectionChange={setRowSelection}
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
                }}
              >
                商品のバーコードをスキャンするか
                <br />
                または「指示なし廃棄」ボタンから
              </Typography>
            </Box>
          }
        />
      </Box>

      {/* Thanh công cụ xử lý dưới cùng */}
      <Paper
        variant="outlined"
        sx={{
          p: 1,
          display: "flex",
          gap: 1,
          justifyContent: "flex-start",
          bgcolor: "#fff",
        }}
      >
        <Button size="small" variant="outlined" color="inherit">
          作業を中止
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="error"
          disabled={!Object.values(rowSelection).some(Boolean)}
          onClick={() => {
            setItems((prev) => prev.filter((i) => !rowSelection[i.id]));
            setRowSelection({});
          }}
        >
          選択項目削除
        </Button>
        <Button size="small" variant="outlined" color="inherit">
          伝票一覧
        </Button>

        <Button
          size="small"
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          disabled={items.length === 0}
          onClick={handleSaveDisposal}
          sx={{ ml: "auto" }}
        >
          保存実行
        </Button>
      </Paper>

      {/* Dialog: Nhập lý do (U-01-01-04 -> 07) */}
      <Dialog
        open={reasonDialogOpen}
        onClose={() => setReasonDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>指示なし廃棄(個品)</DialogTitle>
        <DialogContent
          dividers
          sx={{ display: "flex", flexDirection: "column", gap: 3 }}
        >
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              廃棄理由を選択してください。
            </Typography>
            <Grid container spacing={2}>
              {REASON_GROUPS.map((group) => (
                <Grid size={{ xs: 3 }} key={group}>
                  <Button
                    fullWidth
                    variant={tempGroup === group ? "contained" : "outlined"}
                    onClick={() => setTempGroup(group)}
                  >
                    {group}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Box>

          {tempGroup === "基準外" && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                理由を選択してください(基準外の場合のみ)
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={tempDetail}
                  onChange={(e) => setTempDetail(e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    選択してください
                  </MenuItem>
                  {REASON_DETAILS.map((detail) => (
                    <MenuItem key={detail} value={detail}>
                      {detail}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              詳細コメント (※20～50文字必須)
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={tempComment}
              onChange={(e) => setTempComment(e.target.value)}
              error={tempComment.length > 0 && !isCommentValid}
              helperText={`文字数: ${tempComment.length}`}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setReasonDialogOpen(false)}>キャンセル</Button>
          <Button
            onClick={handleConfirmReason}
            variant="contained"
            color="primary"
            disabled={
              !tempGroup ||
              !isCommentValid ||
              (tempGroup === "基準外" && !tempDetail)
            }
          >
            完了
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((p) => ({ ...p, open: false }))}
      >
        <Alert severity={toast.severity} variant="filled">
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
