import { useState, useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
// §5: After completing 見積を更新, navigate to フロント with success banner
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import InputAdornment from "@mui/material/InputAdornment";
import OutlinedInput from "@mui/material/OutlinedInput";
import Divider from "@mui/material/Divider";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import DiscountIcon from "@mui/icons-material/Discount";
import EditNoteIcon from "@mui/icons-material/EditNote";
import PrintIcon from "@mui/icons-material/Print";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import BlockIcon from "@mui/icons-material/Block";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useLayoutConfig } from "../hooks/useLayoutConfig";
import { MOCK_PURCHASE_LIST } from "../features/buy-back/api/buyBackApi";
import { ConsentFormFlow } from "../features/buy-back/components/ConsentFormFlow";
import { AppModal } from "../components/common/AppModal";

export const Route = createFileRoute("/purchase/recreate")({
  validateSearch: (s: Record<string, unknown>) => ({
    receiptId: typeof s.receiptId === "number" ? s.receiptId : undefined,
    // E-44-01-07: 理由選択で選択された理由キー（o1〜o6）
    reason: typeof s.reason === "string" ? s.reason : undefined,
  }),
  component: RecreateDetailPage,
});

// ─── Types ────────────────────────────────────────────────────────────────────

interface RecreateItem {
  id: string;
  rowNo: number;
  genre: string;
  maker: string;
  productName: string;
  comment?: string;
  catalogPrice: number;
  quantity: number;
  unitPrice: number;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_RECREATE_ITEMS: RecreateItem[] = [
  {
    id: "1",
    rowNo: 1,
    genre: "衣料",
    maker: "Nike",
    productName: "JORDAN BRANS AS M J ESS MMBR JK",
    comment: "商品コメント",
    catalogPrice: 10000000,
    quantity: 1,
    unitPrice: 1200,
  },
  {
    id: "2",
    rowNo: 1,
    genre: "衣料",
    maker: "無印良品",
    productName: "カシミヤセーター",
    comment: "商品コメント",
    catalogPrice: 10000000,
    quantity: 1,
    unitPrice: 1200,
  },
  {
    id: "3",
    rowNo: 1,
    genre: "衣料",
    maker: "グロス",
    productName: "衣料B",
    catalogPrice: 10000000,
    quantity: 1,
    unitPrice: 1200,
  },
  {
    id: "4",
    rowNo: 1,
    genre: "スマホ",
    maker: "Apple",
    productName: "iphone 13 pro Graphite",
    comment: "画面に擦れあり、バッテリー最大量量88%",
    catalogPrice: 10000000,
    quantity: 1,
    unitPrice: 1200,
  },
];

// ─── Inline quantity stepper ──────────────────────────────────────────────────

function InlineQty({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <IconButton
        size="small"
        onClick={() => onChange(Math.max(0, value - 1))}
        sx={{
          width: 26,
          height: 26,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
        }}
      >
        <RemoveIcon sx={{ fontSize: "0.75rem" }} />
      </IconButton>
      <Typography
        sx={{
          minWidth: 20,
          textAlign: "center",
          fontWeight: 700,
          fontSize: "0.9rem",
        }}
      >
        {value}
      </Typography>
      <IconButton
        size="small"
        onClick={() => onChange(value + 1)}
        sx={{
          width: 26,
          height: 26,
          bgcolor: "primary.main",
          color: "white",
          borderRadius: 1,
          "&:hover": { bgcolor: "primary.dark" },
        }}
      >
        <AddIcon sx={{ fontSize: "0.75rem" }} />
      </IconButton>
    </Box>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const thSx = {
  fontSize: "0.75rem",
  fontWeight: 700,
  color: "text.secondary",
  py: 0.75,
  px: 1,
  bgcolor: "background.paper",
  borderBottom: "2px solid",
  borderColor: "divider",
  whiteSpace: "nowrap" as const,
};

const tdSx = {
  py: 0.75,
  px: 1,
  borderBottom: "1px solid",
  borderColor: "divider",
  verticalAlign: "middle" as const,
};

function RecreateDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { receiptId, reason } = Route.useSearch();
  const _entry =
    MOCK_PURCHASE_LIST.find((e) => e.id === receiptId) ?? MOCK_PURCHASE_LIST[0];

  const [items, setItems] = useState<RecreateItem[]>(MOCK_RECREATE_ITEMS);
  const [consentOpen, setConsentOpen] = useState(false);

  // E-44-01-08: クーポン修正（適用/解除）
  const [couponApplied, setCouponApplied] = useState(false);

  // 日本ローカライズ：元伝票でPontaカードスキャン漏れの場合はここでスキャン
  const [pontaInput, setPontaInput] = useState("");
  const [pontaNo, setPontaNo] = useState("");

  // E-44-01-09: 帳票出力（精算レシート等4種）
  const [completeOpen, setCompleteOpen] = useState(false);

  useLayoutConfig({
    title: t("page.purchase.recreate.title"),
    showBackButton: true,
    hideSecondaryNav: true,
    onBack: () =>
      navigate({
        to: "/purchase/invoice",
        search: { receiptId: receiptId ?? _entry.id },
      }),
    actions: [
      {
        key: "void",
        labelKey: "page.purchase.recreate.action.void",
        position: "left" as const,
        variant: "outlined" as const,
        color: "inherit" as const,
        startIcon: <BlockIcon fontSize="small" />,
        // §3.3: Abort at Step 4 → revert state, return to invoice (Step 1)
        onClick: () =>
          navigate({
            to: "/purchase/invoice",
            search: { receiptId: receiptId ?? _entry.id },
          }),
      },
      {
        key: "print",
        labelKey: "page.purchase.recreate.action.print",
        position: "left" as const,
        variant: "outlined" as const,
        color: "inherit" as const,
        startIcon: <PrintIcon fontSize="small" />,
        onClick: () => {},
      },
      {
        key: "function",
        labelKey: "page.purchase.recreate.action.function",
        position: "left" as const,
        variant: "outlined" as const,
        color: "inherit" as const,
        onClick: () => {},
      },
    ],
  });

  const setItemQty = (id: string, qty: number) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i)),
    );
  };

  const setItemPrice = (id: string, price: number) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, catalogPrice: price } : i)),
    );
  };

  // E-44-01-08: 削除（正しい明細になるよう行を削除）
  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handlePontaScan = () => {
    const no = pontaInput.trim();
    if (!no) return;
    setPontaNo(no);
    setPontaInput("");
  };

  const itemCount = useMemo(
    () => items.reduce((s, i) => s + i.quantity, 0),
    [items],
  );
  const subtotal = useMemo(
    () => items.reduce((s, i) => s + i.unitPrice * i.quantity, 0),
    [items],
  );
  const tax = useMemo(() => Math.round(subtotal * 0.1), [subtotal]);
  // クーポン特典（衣料20%OFF）：買取額の上乗せ
  const couponBonus = useMemo(
    () => (couponApplied ? Math.round(subtotal * 0.2) : 0),
    [couponApplied, subtotal],
  );
  const total = subtotal + tax + couponBonus;

  // Step 4 → Step 5: open consent verification popup
  const handleUpdate = () => setConsentOpen(true);

  // Step 5: verification complete → E-44-01-09 帳票出力（レシートプリンタ）
  const handleConsentComplete = () => {
    setConsentOpen(false);
    setCompleteOpen(true);
  };

  // Step 6: navigate to フロント with success banner
  const handleCompleteClose = () => {
    setCompleteOpen(false);
    navigate({ to: "/front", search: { success: "recreateCompleted" } });
  };

  return (
    <Box sx={{ display: "flex", gap: 1.5, height: "100%", minHeight: 0 }}>
      {/* ── Left: editable items table ── */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          height: "100%",
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        {/* E-44-01-07: 選択された再作成理由 */}
        {reason && (
          <Box sx={{ flexShrink: 0 }}>
            <Chip
              size="small"
              color="info"
              variant="outlined"
              icon={<EditNoteIcon />}
              label={t("page.purchase.recreate.reasonChip", {
                reason: t(
                  `page.purchase.invoice.reasonDialog.${reason}` as Parameters<
                    typeof t
                  >[0],
                ),
              })}
            />
          </Box>
        )}
        <TableContainer
          sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1 }}
        >
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {(
                  ["no", "genre", "maker", "productName", "unitPrice"] as const
                ).map((col) => (
                  <TableCell key={col} sx={thSx}>
                    {t(
                      `page.purchase.recreate.col.${col}` as Parameters<
                        typeof t
                      >[0],
                    )}
                  </TableCell>
                ))}
                {/* Qty + price + confirm + delete columns */}
                <TableCell sx={thSx} />
                <TableCell sx={thSx} />
                <TableCell sx={thSx} />
                <TableCell sx={thSx} />
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{ "&:last-child td": { border: 0 } }}
                >
                  <TableCell
                    sx={{
                      ...tdSx,
                      color: "text.secondary",
                      fontSize: "0.8rem",
                    }}
                  >
                    {row.rowNo.toString().padStart(3, "0")}
                  </TableCell>
                  <TableCell sx={{ ...tdSx, fontSize: "0.82rem" }}>
                    {row.genre}
                  </TableCell>
                  <TableCell sx={{ ...tdSx, fontSize: "0.82rem" }}>
                    {row.maker}
                  </TableCell>
                  <TableCell sx={tdSx}>
                    <Typography sx={{ fontSize: "0.82rem", fontWeight: 500 }}>
                      {row.productName}
                    </Typography>
                    {row.comment && (
                      <Typography
                        sx={{
                          fontSize: "0.72rem",
                          color: "text.secondary",
                          mt: 0.25,
                        }}
                      >
                        {row.comment}
                      </Typography>
                    )}
                  </TableCell>

                  {/* Catalog price — editable */}
                  <TableCell sx={tdSx}>
                    <TextField
                      size="small"
                      value={row.catalogPrice}
                      onChange={(e) => {
                        const v = parseInt(
                          e.target.value.replace(/[^0-9]/g, ""),
                          10,
                        );
                        if (!isNaN(v)) setItemPrice(row.id, v);
                      }}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">¥</InputAdornment>
                          ),
                        },
                        htmlInput: {
                          style: {
                            textAlign: "right",
                            fontWeight: 700,
                            width: 80,
                          },
                        },
                      }}
                    />
                  </TableCell>

                  {/* Qty stepper */}
                  <TableCell sx={tdSx}>
                    <InlineQty
                      value={row.quantity}
                      onChange={(v) => setItemQty(row.id, v)}
                    />
                  </TableCell>

                  {/* Unit price — read-only */}
                  <TableCell sx={{ ...tdSx, textAlign: "right" }}>
                    <Typography
                      sx={{
                        fontFamily: "monospace",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                      }}
                    >
                      ¥{row.unitPrice.toLocaleString()}
                    </Typography>
                  </TableCell>

                  {/* Confirm checkmark */}
                  <TableCell sx={{ ...tdSx, pr: 0.5 }}>
                    <CheckCircleOutlineIcon
                      sx={{
                        fontSize: "1.3rem",
                        color: "primary.main",
                        display: "block",
                      }}
                    />
                  </TableCell>

                  {/* E-44-01-08: 削除 */}
                  <TableCell sx={{ ...tdSx, pr: 0.5 }}>
                    <Tooltip
                      title={t("page.purchase.recreate.deleteTooltip")}
                      placement="left"
                    >
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => deleteItem(row.id)}
                      >
                        <DeleteOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* ── Right: coupon + ledger ── */}
      <Box
        sx={{
          width: 300,
          flexShrink: 0,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          bgcolor: "background.paper",
          overflow: "hidden",
        }}
      >
        {/* Coupon section（E-44-01-08 クーポン修正：適用/解除） */}
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, fontSize: "0.9rem", mb: 1.5 }}
          >
            {t("page.purchase.recreate.coupon.title")}
          </Typography>
          {couponApplied ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 1.25,
                py: 0.75,
                borderRadius: 1,
                bgcolor: "#e3f2fd",
              }}
            >
              <Typography sx={{ fontSize: "0.82rem", flex: 1 }}>
                {t("page.purchase.recreate.coupon.name")}
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: "primary.main",
                }}
              >
                {t("page.purchase.recreate.coupon.bonus", {
                  amount: couponBonus.toLocaleString(),
                })}
              </Typography>
              <Button size="small" onClick={() => setCouponApplied(false)}>
                {t("page.purchase.recreate.coupon.remove")}
              </Button>
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1.25,
                py: 1,
              }}
            >
              <DiscountIcon sx={{ fontSize: 36, color: "text.disabled" }} />
              <Typography
                variant="caption"
                sx={{
                  textAlign: "center",
                  fontSize: "0.75rem",
                  color: "text.secondary",
                  lineHeight: 1.5,
                }}
              >
                {t("page.purchase.recreate.coupon.placeholder")}
              </Typography>
              <Button
                size="small"
                variant="outlined"
                startIcon={<DiscountIcon />}
                onClick={() => setCouponApplied(true)}
              >
                {t("page.purchase.recreate.coupon.apply")}
              </Button>
            </Box>
          )}
        </Box>

        <Divider />

        {/* Pontaカード（日本ローカライズ：元伝票でスキャン漏れの場合はここでスキャン） */}
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, fontSize: "0.9rem", mb: 1 }}
          >
            {t("page.purchase.recreate.ponta.title")}
          </Typography>
          {pontaNo ? (
            <Chip
              size="small"
              color="success"
              variant="outlined"
              icon={<CardMembershipIcon />}
              label={t("page.purchase.recreate.ponta.scanned", { no: pontaNo })}
            />
          ) : (
            <>
              <Box sx={{ display: "flex", gap: 0.75 }}>
                <OutlinedInput
                  size="small"
                  value={pontaInput}
                  onChange={(e) => setPontaInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handlePontaScan()}
                  placeholder={t("page.purchase.recreate.ponta.placeholder")}
                  sx={{ flex: 1, height: 32, fontSize: "0.78rem" }}
                />
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handlePontaScan}
                  disabled={!pontaInput.trim()}
                >
                  {t("page.purchase.recreate.ponta.scan")}
                </Button>
              </Box>
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  mt: 0.75,
                  fontSize: "0.7rem",
                  color: "text.secondary",
                }}
              >
                {t("page.purchase.recreate.ponta.note")}
              </Typography>
            </>
          )}
        </Box>

        {/* Spacer pushes ledger + button to the bottom */}
        <Box sx={{ flex: 1 }} />

        {/* Ledger — pinned above the update button */}
        <Box sx={{ px: 2, py: 1.5, flexShrink: 0 }}>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
          >
            <Typography variant="caption" color="text.secondary">
              {t("page.purchase.recreate.ledger.itemCount")}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {itemCount}点
            </Typography>
          </Box>
          <Divider sx={{ my: 0.75, borderColor: "text.primary" }} />
          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
          >
            <Typography variant="caption" color="text.secondary">
              {t("page.purchase.recreate.ledger.subtotal")}
            </Typography>
            <Typography variant="body2">
              ¥{subtotal.toLocaleString()}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="caption" color="text.secondary">
              {t("page.purchase.recreate.ledger.tax")}
            </Typography>
            <Typography variant="body2">¥{tax.toLocaleString()}</Typography>
          </Box>
          {couponApplied && (
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}
            >
              <Typography variant="caption" color="text.secondary">
                {t("page.purchase.recreate.ledger.coupon")}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "primary.main", fontWeight: 600 }}
              >
                {t("page.purchase.recreate.coupon.bonus", {
                  amount: couponBonus.toLocaleString(),
                })}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Update button */}
        <Box sx={{ px: 1.5, pb: 1.5, flexShrink: 0 }}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleUpdate}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.9rem",
              py: 1.1,
            }}
          >
            {t("page.purchase.recreate.ledger.updateButton", {
              total: total.toLocaleString(),
            })}
          </Button>
        </Box>
      </Box>

      {/* Step 5: Consent Document Verification Popup (承諾書検証) */}
      <ConsentFormFlow
        open={consentOpen}
        entryId={_entry.id}
        receiptNumber={_entry.receiptNumber}
        onComplete={handleConsentComplete}
        onCancel={() => setConsentOpen(false)}
      />

      {/* E-44-01-09: 確定 → 帳票出力（レシートプリンタ4種） */}
      <AppModal
        open={completeOpen}
        onClose={handleCompleteClose}
        title={t("page.purchase.recreate.complete.title")}
        actions={[
          {
            label: t("page.purchase.recreate.complete.close"),
            onClick: handleCompleteClose,
            variant: "contained",
          },
        ]}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
          <TaskAltIcon color="success" />
          <Typography sx={{ fontSize: "0.9rem", fontWeight: 600 }}>
            {t("page.purchase.recreate.complete.message")}
          </Typography>
        </Box>
        <Paper variant="outlined">
          {(["r1", "r2", "r3", "r4"] as const).map((key) => (
            <Box
              key={key}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 1.5,
                py: 0.75,
                borderBottom: "1px solid",
                borderColor: "divider",
                "&:last-child": { borderBottom: 0 },
              }}
            >
              <PrintOutlinedIcon
                sx={{ fontSize: "1rem", color: "text.secondary" }}
              />
              <Typography sx={{ fontSize: "0.82rem" }}>
                {t(`page.purchase.recreate.complete.${key}`)}
              </Typography>
            </Box>
          ))}
        </Paper>
      </AppModal>
    </Box>
  );
}
