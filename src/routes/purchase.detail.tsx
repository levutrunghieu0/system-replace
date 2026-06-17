import { useState, useMemo, useRef } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import SmsOutlinedIcon from "@mui/icons-material/SmsOutlined";
import { useLayoutConfig } from "../hooks/useLayoutConfig";
import { MOCK_PURCHASE_LIST } from "../features/buy-back/api/buyBackApi";
import { QuantityStepper } from "../components/QuantityStepper";

export const Route = createFileRoute("/purchase/detail")({
  validateSearch: (s: Record<string, unknown>) => ({
    receiptId: typeof s.receiptId === "number" ? s.receiptId : undefined,
  }),
  component: PurchaseDetailPage,
});

// ─── Local types ──────────────────────────────────────────────────────────────

interface AssessmentItem {
  id: string;
  displayName: string;
  appraisalValue: number;
  purchasePrice: number;
  qty: number;
  fields: Record<string, string>;
  isManualOverride: boolean;
}

// ─── Form field definitions (built with t() at render time) ──────────────────

type FieldKey =
  | "category"
  | "brand"
  | "grade"
  | "size"
  | "color"
  | "accessories";

interface FieldOption {
  value: string;
  label: string;
}
interface FieldDef {
  key: FieldKey;
  label: string;
  options: FieldOption[];
}

const FIELD_KEYS: FieldKey[] = [
  "category",
  "brand",
  "grade",
  "size",
  "color",
  "accessories",
];
const EMPTY_FIELDS = Object.fromEntries(FIELD_KEYS.map((k) => [k, ""]));

function buildFieldDefs(t: TFunction): FieldDef[] {
  const opt = (category: string, keys: string[]): FieldOption[] =>
    keys.map((k) => ({
      value: k,
      label: t(
        `page.purchase.detail.itemInput.options.${category}.${k}` as Parameters<
          typeof t
        >[0],
      ),
    }));

  return [
    {
      key: "category",
      label: t("page.purchase.detail.itemInput.fields.category"),
      options: opt("category", [
        "sneakers",
        "coat",
        "jacket",
        "pants",
        "bag",
        "other",
      ]),
    },
    {
      key: "brand",
      label: t("page.purchase.detail.itemInput.fields.brand"),
      options: opt("brand", [
        "adidas",
        "nike",
        "marni",
        "gucci",
        "uniqlo",
        "other",
      ]),
    },
    {
      key: "grade",
      label: t("page.purchase.detail.itemInput.fields.grade"),
      options: opt("grade", ["new", "unused", "a", "b", "c", "d"]),
    },
    {
      key: "size",
      label: t("page.purchase.detail.itemInput.fields.size"),
      options: opt("size", ["xs", "s", "m", "l", "xl", "xxl", "free"]),
    },
    {
      key: "color",
      label: t("page.purchase.detail.itemInput.fields.color"),
      options: opt("color", [
        "white",
        "black",
        "red",
        "blue",
        "green",
        "beige",
        "other",
      ]),
    },
    {
      key: "accessories",
      label: t("page.purchase.detail.itemInput.fields.accessories"),
      options: opt("accessories", ["yes", "no"]),
    },
  ];
}

function computeAppraisal(fields: Record<string, string>): number {
  const filled = Object.values(fields).filter(Boolean).length;
  if (filled < 2) return 0;
  return filled * 2500 + 7000;
}

function formatMoneyInput(value: string): string {
  const numeric = value.replace(/[^0-9]/g, "");
  if (!numeric) return "";

  return Number(numeric).toLocaleString();
}

function parseMoneyInput(value: string): string {
  return value.replace(/[^0-9]/g, "");
}

// ─── SelectField ──────────────────────────────────────────────────────────────

function SelectField({
  fieldKey,
  label,
  options,
  value,
  onChange,
}: {
  fieldKey: string;
  label: string;
  options: FieldOption[];
  value: string;
  onChange: (key: string, val: string) => void;
}) {
  return (
    <FormControl size="small" fullWidth>
      <InputLabel sx={{ fontSize: "0.8rem" }}>{label}</InputLabel>
      <Select
        label={label}
        value={value}
        onChange={(e) => onChange(fieldKey, e.target.value)}
        sx={{ fontSize: "0.85rem" }}
      >
        {options.map((o) => (
          <MenuItem key={o.value} value={o.value} sx={{ fontSize: "0.85rem" }}>
            {o.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

// ─── Left card ────────────────────────────────────────────────────────────────

interface LeftCardProps {
  categoryInput: string;
  onCategoryChange: (v: string) => void;
  onCategoryConfirm: () => void;
  confirmedCategory: string;
  onCategoryClose: () => void;
  fields: Record<string, string>;
  onFieldChange: (key: string, val: string) => void;
  appraisalValue: number;
  purchasePriceInput: string;
  onPurchasePriceChange: (v: string) => void;
  qty: number;
  onQtyChange: (v: number) => void;
  canAdd: boolean;
  isEditing: boolean;
  onAddOrModify: () => void;
  categoryInputRef: React.RefObject<HTMLInputElement | null>;
}

function LeftCard({
  categoryInput,
  onCategoryChange,
  onCategoryConfirm,
  confirmedCategory,
  onCategoryClose,
  fields,
  onFieldChange,
  appraisalValue,
  purchasePriceInput,
  onPurchasePriceChange,
  qty,
  onQtyChange,
  canAdd,
  isEditing,
  onAddOrModify,
  categoryInputRef,
}: LeftCardProps) {
  const { t } = useTranslation();
  const fieldDefs = buildFieldDefs(t);
  const isManualOverride =
    purchasePriceInput !== "" &&
    Number(parseMoneyInput(purchasePriceInput)) !== appraisalValue;

  return (
    <Box
      sx={{
        flex: "0 0 59%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        overflow: "hidden",
        bgcolor: "background.paper",
      }}
    >
      {/* Card header */}
      <Box
        sx={{
          px: 2,
          py: 1.25,
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <Typography
          variant="body2"
          sx={{ fontWeight: 700, fontSize: "0.9rem" }}
        >
          {t("page.purchase.detail.inputCard.title")}
        </Typography>
        {confirmedCategory && (
          <IconButton
            size="small"
            onClick={onCategoryClose}
            sx={{ color: "text.secondary" }}
          >
            <CloseIcon sx={{ fontSize: "1rem" }} />
          </IconButton>
        )}
      </Box>

      {/* Scrollable form body */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          px: 2,
          py: 2,
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
          "&::-webkit-scrollbar": { width: 5 },
          "&::-webkit-scrollbar-thumb": { bgcolor: "divider", borderRadius: 3 },
        }}
      >
        {/* 区分判定 */}
        <Box>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              color: "text.secondary",
              mb: 0.75,
              display: "block",
            }}
          >
            {t("page.purchase.detail.classification.label")}
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              size="small"
              fullWidth
              value={confirmedCategory || categoryInput}
              onChange={(e) =>
                !confirmedCategory && onCategoryChange(e.target.value)
              }
              placeholder={t("page.purchase.detail.classification.placeholder")}
              inputRef={categoryInputRef}
              slotProps={{
                input: {
                  readOnly: Boolean(confirmedCategory),
                  sx: confirmedCategory
                    ? { bgcolor: "grey.50", color: "text.secondary" }
                    : {},
                },
              }}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  categoryInput.trim() &&
                  !confirmedCategory
                )
                  onCategoryConfirm();
              }}
            />
            <IconButton
              size="small"
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                flexShrink: 0,
              }}
            >
              <QrCodeScannerIcon
                fontSize="small"
                sx={{ color: "text.secondary" }}
              />
            </IconButton>
          </Box>
          {!confirmedCategory && categoryInput.trim() && (
            <Box sx={{ mt: 1 }}>
              <Button
                variant="text"
                size="small"
                onClick={onCategoryConfirm}
                sx={{ textTransform: "none", fontSize: "0.78rem" }}
              >
                {t("page.purchase.detail.classification.confirmHint", {
                  category: categoryInput,
                })}
              </Button>
            </Box>
          )}
        </Box>

        {/* 個品入力 — only shown when category is confirmed */}
        {confirmedCategory && (
          <Box>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: "text.secondary",
                mb: 1,
                display: "block",
              }}
            >
              {t("page.purchase.detail.itemInput.title")}
            </Typography>

            {/* Row 1: 3 equal columns */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 1.5,
                mb: 1.5,
              }}
            >
              {fieldDefs.slice(0, 3).map((f) => (
                <SelectField
                  key={f.key}
                  fieldKey={f.key}
                  label={f.label}
                  options={f.options}
                  value={fields[f.key]}
                  onChange={onFieldChange}
                />
              ))}
            </Box>

            {/* Row 2: full width */}
            <Box sx={{ mb: 1.5 }}>
              <SelectField
                fieldKey={fieldDefs[3].key}
                label={fieldDefs[3].label}
                options={fieldDefs[3].options}
                value={fields[fieldDefs[3].key]}
                onChange={onFieldChange}
              />
            </Box>

            {/* Row 3: カラー / 付属品 - 6 / 6 */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 1.5,
                mb: 1.5,
              }}
            >
              {fieldDefs.slice(4).map((f) => (
                <SelectField
                  key={f.key}
                  fieldKey={f.key}
                  label={f.label}
                  options={f.options}
                  value={fields[f.key]}
                  onChange={onFieldChange}
                />
              ))}
            </Box>
          </Box>
        )}
      </Box>

      {/* Sticky bottom bar — only when category is confirmed */}
      {confirmedCategory && (
        <Box
          sx={{
            borderTop: "1px solid",
            borderColor: "divider",
            px: 2,
            py: 1.25,
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexShrink: 0,
            bgcolor: "background.paper",
            flexWrap: "wrap",
          }}
        >
          {/* 査定額 */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              flexShrink: 0,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {t("page.purchase.detail.itemInput.appraisalLabel")}
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, fontFamily: "monospace", minWidth: 72 }}
            >
              ¥{appraisalValue > 0 ? appraisalValue.toLocaleString() : "0"}
            </Typography>
          </Box>

          {/* 買取額 input */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              flexShrink: 0,
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                flexShrink: 0,
                fontWeight: 600,
                lineHeight: 1,
              }}
            >
              {t("page.purchase.detail.itemInput.purchasePriceLabel")}
            </Typography>
            <TextField
              size="small"
              value={purchasePriceInput}
              onChange={(e) =>
                onPurchasePriceChange(formatMoneyInput(e.target.value))
              }
              placeholder="0"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontWeight: 800 }}
                      >
                        ¥
                      </Typography>
                    </InputAdornment>
                  ),
                },
                htmlInput: {
                  inputMode: "numeric",
                  pattern: "[0-9,]*",
                  style: {
                    textAlign: "right",
                    fontWeight: 800,
                    fontSize: "0.88rem",
                    paddingTop: 5,
                    paddingBottom: 5,
                  },
                },
              }}
              sx={{
                width: 130,
                "& .MuiOutlinedInput-root": {
                  height: 30,
                  borderRadius: 1,
                  bgcolor: isManualOverride ? "#fffde7" : "background.paper",
                  transition:
                    "background-color 160ms ease, border-color 160ms ease",
                  "& fieldset": {
                    borderColor: isManualOverride ? "warning.main" : "divider",
                  },
                  "&:hover fieldset": {
                    borderColor: isManualOverride
                      ? "warning.dark"
                      : "text.secondary",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: isManualOverride
                      ? "warning.main"
                      : "primary.main",
                    borderWidth: 1,
                  },
                },
                "& .MuiInputAdornment-root": {
                  mr: 0.25,
                },
              }}
            />
          </Box>

          {/* Quantity stepper */}
          <Box sx={{ flexShrink: 0 }}>
            <QuantityStepper
              value={qty}
              min={1}
              onChange={onQtyChange}
              compact
            />
          </Box>

          {/* Add / Modify button */}
          <Button
            variant="contained"
            size="small"
            disabled={!canAdd}
            onClick={onAddOrModify}
            startIcon={
              isEditing ? (
                <FileUploadIcon sx={{ fontSize: "0.9rem !important" }} />
              ) : (
                <FileDownloadIcon sx={{ fontSize: "0.9rem !important" }} />
              )
            }
            sx={{
              textTransform: "none",
              fontWeight: 700,
              ml: "auto",
              flexShrink: 0,
            }}
          >
            {isEditing
              ? t("page.purchase.detail.itemInput.modifyButton")
              : t("page.purchase.detail.itemInput.addButton")}
          </Button>
        </Box>
      )}
    </Box>
  );
}

// ─── Right card ───────────────────────────────────────────────────────────────

interface RightCardProps {
  items: AssessmentItem[];
  editingId: string | null;
  concurrentUser?: string;
  consentOutOfSync: boolean;
  onAddClick: () => void;
  onItemClick: (item: AssessmentItem) => void;
  onComplete: () => void;
  onSaveClose: () => void;
}

function QtyBadge({ n }: { n: number }) {
  return (
    <Box
      sx={{
        width: 22,
        height: 22,
        borderRadius: "50%",
        bgcolor: "grey.200",
        color: "text.secondary",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.72rem",
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {n}
    </Box>
  );
}

function RightCard({
  items,
  editingId,
  concurrentUser,
  consentOutOfSync,
  onAddClick,
  onItemClick,
  onComplete,
  onSaveClose,
}: RightCardProps) {
  const { t } = useTranslation();
  const retailValue = items.reduce((s, i) => s + i.appraisalValue * i.qty, 0);
  const purchaseValue = items.reduce((s, i) => s + i.purchasePrice * i.qty, 0);
  const totalQty = items.reduce((s, i) => s + i.qty, 0);
  const hasItems = items.length > 0;

  return (
    <Box
      sx={{
        flex: "0 0 39%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        overflow: "hidden",
        bgcolor: "background.paper",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2,
          py: 1.25,
          borderBottom: "1px solid",
          borderColor: "divider",
          flexShrink: 0,
        }}
      >
        <Typography
          variant="body2"
          sx={{ fontWeight: 700, fontSize: "0.9rem" }}
        >
          {t("page.purchase.detail.assessedItems.title")}
        </Typography>
      </Box>

      {/* Scrollable items list */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          px: 1.5,
          pt: 1.5,
          pb: 1,
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
          "&::-webkit-scrollbar": { width: 5 },
          "&::-webkit-scrollbar-thumb": { bgcolor: "divider", borderRadius: 3 },
        }}
      >
        {/* Items */}
        {items.map((item) => (
          <Box
            key={item.id}
            onClick={() => onItemClick(item)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 1,
              py: 0.75,
              borderRadius: 1,
              cursor: "pointer",
              bgcolor: editingId === item.id ? "primary.light" : "transparent",
              "&:hover": {
                bgcolor:
                  editingId === item.id ? "primary.light" : "action.hover",
              },
            }}
          >
            <Typography
              variant="body2"
              sx={{
                flex: 1,
                fontWeight: 500,
                fontSize: "0.83rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {item.displayName}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: "monospace",
                fontSize: "0.82rem",
                color: "text.secondary",
                flexShrink: 0,
              }}
            >
              ¥{item.purchasePrice.toLocaleString()}
            </Typography>
            <QtyBadge n={item.qty} />
          </Box>
        ))}

        {/* + 追加 button */}
        <Box sx={{ mt: hasItems ? 0.5 : 0 }}>
          <Button
            fullWidth
            variant="outlined"
            color="inherit"
            size="small"
            startIcon={<AddIcon fontSize="small" />}
            onClick={onAddClick}
            sx={{
              textTransform: "none",
              fontSize: "0.85rem",
              fontWeight: 600,
              borderColor: "divider",
              color: "text.secondary",
              py: 0.75,
            }}
          >
            {t("page.purchase.detail.assessedItems.addButton")}
          </Button>
        </Box>
      </Box>

      {/* Fixed bottom: ledger + actions */}
      <Box
        sx={{ flexShrink: 0, borderTop: "1px solid", borderColor: "divider" }}
      >
        {/* Ledger */}
        <Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 0.5,
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: "0.82rem" }}
            >
              {t("page.purchase.detail.ledger.retailValue")}
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontFamily: "monospace", fontSize: "0.82rem" }}
            >
              ¥{retailValue.toLocaleString()}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: "0.82rem" }}
            >
              {t("page.purchase.detail.ledger.purchasePrice")}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontFamily: "monospace",
                fontWeight: 800,
                fontSize: "1.3rem",
                color: hasItems ? "text.primary" : "text.disabled",
              }}
            >
              ¥{purchaseValue > 0 ? purchaseValue.toLocaleString() : "0"}
            </Typography>
          </Box>
        </Box>

        {/* Concurrency warning */}
        {concurrentUser && (
          <Box
            sx={{
              mx: 1.5,
              mb: 1,
              display: "flex",
              alignItems: "center",
              gap: 1,
              bgcolor: "primary.light",
              borderRadius: 1,
              px: 1.5,
              py: 0.75,
            }}
          >
            <InfoOutlinedIcon
              sx={{ fontSize: "1rem", color: "primary.main", flexShrink: 0 }}
            />
            <Typography
              variant="caption"
              sx={{ color: "primary.dark", fontWeight: 600 }}
            >
              {t("page.purchase.detail.concurrency.message", {
                name: concurrentUser,
              })}
            </Typography>
          </Box>
        )}

        {/* Out-of-sync note */}
        {consentOutOfSync && hasItems && (
          <Box
            sx={{
              mx: 1.5,
              mb: 1,
              bgcolor: "#fff3e0",
              borderRadius: 1,
              px: 1.5,
              py: 0.75,
            }}
          >
            <Typography
              variant="caption"
              color="warning.dark"
              sx={{ fontWeight: 600 }}
            >
              {t("page.purchase.detail.ledger.outOfSyncWarning")}
            </Typography>
          </Box>
        )}

        {/* Action buttons */}
        <Box
          sx={{
            px: 1.5,
            pb: 1.5,
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          <Button
            fullWidth
            variant={hasItems ? "contained" : "outlined"}
            color="primary"
            disabled={!hasItems}
            onClick={onComplete}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.9rem",
              py: 1.05,
              boxShadow: "none",
              "&:hover": {
                boxShadow: "none",
              },
            }}
          >
            {t("page.purchase.detail.action.complete", { n: totalQty })}
          </Button>

          <Button
            fullWidth
            variant="outlined"
            color="inherit"
            onClick={onSaveClose}
            sx={{ textTransform: "none", fontWeight: 500, fontSize: "0.85rem" }}
          >
            {t("page.purchase.detail.action.saveClose")}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

// ─── Sticky footer actions ────────────────────────────────────────────────────

interface AssessmentFooterProps {
  hasItems: boolean;
  onTemporarySave: () => void;
  onQuoteIssue: () => void;
  onCorrection: () => void;
  onReceptionCancel: () => void;
  onPurchaseStatusInquiry: () => void;
  onNotEstablishedCancelSearch: () => void;
  onStop: () => void;
  onAllNotEstablished: () => void;
}

function AssessmentFooter({
  hasItems,
  onTemporarySave,
  onQuoteIssue,
  onCorrection,
  onReceptionCancel,
  onPurchaseStatusInquiry,
  onNotEstablishedCancelSearch,
  onStop,
  onAllNotEstablished,
}: AssessmentFooterProps) {
  const { t } = useTranslation();

  const buttonSx = {
    textTransform: "none",
    fontWeight: 700,
    minHeight: 34,
    whiteSpace: "nowrap",
    borderRadius: 1.5,
  } as const;

  return (
    <Box
      sx={{
        flexShrink: 0,
        borderTop: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        px: 1.5,
        py: 1,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          overflowX: "auto",
          overflowY: "hidden",
          pb: 0.25,
          "&::-webkit-scrollbar": { height: 5 },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "divider",
            borderRadius: 3,
          },
        }}
      >
        <Button
          variant="outlined"
          color="inherit"
          onClick={onTemporarySave}
          sx={buttonSx}
        >
          {t("page.purchase.detail.action.temporarySave", {
            defaultValue: "一時保存",
          })}
        </Button>

        <Button
          variant="outlined"
          color="inherit"
          disabled={!hasItems}
          onClick={onQuoteIssue}
          sx={buttonSx}
        >
          {t("page.purchase.detail.action.quoteIssue", {
            defaultValue: "見積書発行",
          })}
        </Button>

        <Button
          variant="outlined"
          color="inherit"
          disabled={!hasItems}
          onClick={onCorrection}
          sx={buttonSx}
        >
          {t("page.purchase.detail.action.correction", {
            defaultValue: "明細訂正",
          })}
        </Button>

        <Button
          variant="outlined"
          color="warning"
          onClick={onReceptionCancel}
          sx={buttonSx}
        >
          {t("page.purchase.detail.action.receptionCancel", {
            defaultValue: "受付中止",
          })}
        </Button>

        <Button
          variant="outlined"
          color="inherit"
          onClick={onPurchaseStatusInquiry}
          sx={buttonSx}
        >
          {t("page.purchase.detail.action.purchaseStatusInquiry", {
            defaultValue: "買取状況照会",
          })}
        </Button>

        <Box sx={{ flex: 1, minWidth: 16 }} />

        <Button
          variant="outlined"
          color="inherit"
          onClick={onNotEstablishedCancelSearch}
          sx={buttonSx}
        >
          {t("page.purchase.detail.action.notEstablishedCancelSearch", {
            defaultValue: "不成立/取消検索",
          })}
        </Button>

        <Button
          variant="outlined"
          color="primary"
          onClick={onStop}
          sx={buttonSx}
        >
          {t("page.purchase.detail.action.stop", {
            defaultValue: "中止",
          })}
        </Button>

        <Button
          variant="contained"
          color="inherit"
          disabled={!hasItems}
          onClick={onAllNotEstablished}
          sx={{
            ...buttonSx,
            bgcolor: "grey.800",
            color: "common.white",
            "&:hover": { bgcolor: "grey.900" },
            "&.Mui-disabled": {
              bgcolor: "grey.200",
              color: "text.disabled",
            },
          }}
        >
          {t("page.purchase.detail.action.allNotEstablished", {
            defaultValue: "全不成立",
          })}
        </Button>
      </Box>
    </Box>
  );
}

type AssessmentConfirmStep = "quote" | "sms";

interface AssessmentConfirmDialogProps {
  open: boolean;
  step: AssessmentConfirmStep;
  onYes: () => void;
  onNo: () => void;
}

function AssessmentConfirmDialog({
  open,
  step,
  onYes,
  onNo,
}: AssessmentConfirmDialogProps) {
  const { t } = useTranslation();
  const isQuoteStep = step === "quote";

  return (
    <Dialog
      open={open}
      maxWidth="xs"
      fullWidth
      onClose={onNo}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            px: 1,
          },
        },
      }}
    >
      <DialogContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2.5,
            pt: 2,
            pb: 1,
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              bgcolor: "grey.100",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isQuoteStep ? (
              <DescriptionOutlinedIcon
                sx={{ fontSize: 34, color: "text.secondary" }}
              />
            ) : (
              <SmsOutlinedIcon sx={{ fontSize: 34, color: "text.secondary" }} />
            )}
          </Box>

          <Typography
            variant="body1"
            sx={{
              fontWeight: 600,
              textAlign: "center",
              whiteSpace: "pre-line",
            }}
          >
            {isQuoteStep
              ? t("page.purchase.detail.confirm.quoteMessage")
              : t("page.purchase.detail.confirm.smsMessage")}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1, justifyContent: "center" }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={onNo}
          sx={{
            textTransform: "none",
            minWidth: 120,
            fontWeight: 700,
          }}
        >
          {t("page.purchase.detail.confirm.no")}
        </Button>

        <Button
          variant="contained"
          color="primary"
          onClick={onYes}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            minWidth: 120,
          }}
        >
          {t("page.purchase.detail.confirm.yes")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function PurchaseDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { receiptId } = Route.useSearch();
  const entry =
    MOCK_PURCHASE_LIST.find((e) => e.id === receiptId) ?? MOCK_PURCHASE_LIST[0];

  const categoryInputRef = useRef<HTMLInputElement>(null);

  // Left panel state
  const [categoryInput, setCategoryInput] = useState("");
  const [confirmedCategory, setConfirmedCategory] = useState("");
  const [fields, setFields] = useState<Record<string, string>>(EMPTY_FIELDS);
  const [qty, setQty] = useState(1);
  const [purchasePriceInput, setPurchasePriceInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Right panel / shared state
  const [items, setItems] = useState<AssessmentItem[]>([]);
  const [consentOutOfSync, setConsentOutOfSync] = useState(
    entry.consentOutOfSync ?? false,
  );
  const [confirmStep, setConfirmStep] = useState<AssessmentConfirmStep | null>(
    null,
  );
  const [toast, setToast] = useState<string | null>(null);

  const appraisalValue = useMemo(() => computeAppraisal(fields), [fields]);

  const canAdd = useMemo(
    () =>
      confirmedCategory !== "" &&
      purchasePriceInput !== "" &&
      Object.values(fields).filter(Boolean).length >= 2,
    [confirmedCategory, purchasePriceInput, fields],
  );

  useLayoutConfig({
    title: `${t("page.purchase.detail.title")} ${entry.receiptNumber}`,
    showBackButton: true,
    hideSecondaryNav: true,
    onBack: () =>
      navigate({ to: "/purchase", search: { receiptId: undefined } }),
  });

  const handleFieldChange = (key: string, val: string) => {
    setFields((prev) => ({ ...prev, [key]: val }));
  };

  const handleCategoryConfirm = () => {
    if (categoryInput.trim()) setConfirmedCategory(categoryInput.trim());
  };

  const handleCategoryClose = () => {
    setConfirmedCategory("");
    setCategoryInput("");
    setFields(EMPTY_FIELDS);
    setPurchasePriceInput("");
    setQty(1);
    setEditingId(null);
  };

  const handleAddOrModify = () => {
    const fieldDefs = buildFieldDefs(t);
    const resolve = (key: FieldKey, value: string) => {
      const def = fieldDefs.find((f) => f.key === key);
      return def?.options.find((o) => o.value === value)?.label ?? value;
    };
    const displayName =
      [resolve("brand", fields.brand), resolve("category", fields.category)]
        .filter(Boolean)
        .join(" ") || confirmedCategory;
    const price = Number(parseMoneyInput(purchasePriceInput)) || 0;

    if (editingId) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === editingId
            ? {
                ...i,
                displayName,
                appraisalValue,
                purchasePrice: price,
                qty,
                fields,
                isManualOverride: price !== appraisalValue,
              }
            : i,
        ),
      );
      setConsentOutOfSync(true);
      setEditingId(null);
    } else {
      setItems((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          displayName,
          appraisalValue,
          purchasePrice: price,
          qty,
          fields,
          isManualOverride: price !== appraisalValue,
        },
      ]);
    }

    // Reset form for next item (keep category)
    setFields(EMPTY_FIELDS);
    setPurchasePriceInput("");
    setQty(1);
  };

  const handleItemClick = (item: AssessmentItem) => {
    if (editingId === item.id) {
      setEditingId(null);
      setFields(EMPTY_FIELDS);
      setPurchasePriceInput("");
      setQty(1);
      return;
    }
    setEditingId(item.id);
    setFields(item.fields);
    setPurchasePriceInput(formatMoneyInput(String(item.purchasePrice)));
    setQty(item.qty);
    if (!confirmedCategory) setConfirmedCategory(item.displayName);
  };

  const handleAddClick = () => {
    // Reset left panel to "ready for new item" state so the user
    // always sees a clear visual response (category clears → form closes → input focused)
    setEditingId(null);
    setConfirmedCategory("");
    setCategoryInput("");
    setFields(EMPTY_FIELDS);
    setPurchasePriceInput("");
    setQty(1);
    setTimeout(() => categoryInputRef.current?.focus(), 50);
  };

  const startAssessmentConfirmFlow = () => {
    if (items.length === 0) return;
    setConfirmStep("quote");
  };

  const handleQuoteDialogAnswer = () => {
    // Whether the user chooses 「はい」 or 「いいえ」 for quotation issuance,
    // the flow must continue to the assessment completion/SMS confirmation.
    setConfirmStep("sms");
  };

  const handleSmsDialogYes = () => {
    setConfirmStep(null);
    setToast(t("page.purchase.toast.assessmentCompleted"));
    window.setTimeout(() => {
      navigate({ to: "/purchase", search: { receiptId: undefined } });
    }, 600);
  };

  const handleSmsDialogNo = () => {
    // Do not complete the assessment when the user chooses 「いいえ」 in the
    // completion/SMS confirmation dialog.
    setConfirmStep(null);
  };

  const handleSaveClose = () => {
    setToast(t("page.purchase.toast.savedProgress"));
    navigate({ to: "/purchase", search: { receiptId: undefined } });
  };

  const showActionToast = (label: string) => {
    setToast(
      t("page.purchase.toast.prototypeAction", {
        action: label,
        defaultValue: `${label}を実行しました`,
      }),
    );
  };

  const handleTemporarySave = () => {
    setToast(t("page.purchase.toast.savedProgress"));
  };

  const handleQuoteIssue = () => showActionToast("見積書発行");

  const handleCorrection = () => showActionToast("明細訂正");

  const handleReceptionCancel = () => showActionToast("受付中止");

  const handlePurchaseStatusInquiry = () => showActionToast("買取状況照会");

  const handleNotEstablishedCancelSearch = () =>
    showActionToast("不成立/取消検索");

  const handleStop = () => showActionToast("中止");

  const handleAllNotEstablished = () => showActionToast("全不成立");

  return (
    <Box
      sx={{
        height: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <Box sx={{ display: "flex", gap: 1.5, flex: 1, minHeight: 0 }}>
        {/* ── Left: 買取査定入力 ── */}
        <LeftCard
          categoryInput={categoryInput}
          onCategoryChange={setCategoryInput}
          onCategoryConfirm={handleCategoryConfirm}
          confirmedCategory={confirmedCategory}
          onCategoryClose={handleCategoryClose}
          fields={fields}
          onFieldChange={handleFieldChange}
          appraisalValue={appraisalValue}
          purchasePriceInput={purchasePriceInput}
          onPurchasePriceChange={setPurchasePriceInput}
          qty={qty}
          onQtyChange={setQty}
          canAdd={canAdd}
          isEditing={editingId !== null}
          onAddOrModify={handleAddOrModify}
          categoryInputRef={categoryInputRef}
        />

        {/* ── Right: 査定商品 ── */}
        <RightCard
          items={items}
          editingId={editingId}
          concurrentUser={entry.concurrentUser}
          consentOutOfSync={consentOutOfSync}
          onAddClick={handleAddClick}
          onItemClick={handleItemClick}
          onComplete={startAssessmentConfirmFlow}
          onSaveClose={handleSaveClose}
        />
      </Box>

      <AssessmentFooter
        hasItems={items.length > 0}
        onTemporarySave={handleTemporarySave}
        onQuoteIssue={handleQuoteIssue}
        onCorrection={handleCorrection}
        onReceptionCancel={handleReceptionCancel}
        onPurchaseStatusInquiry={handlePurchaseStatusInquiry}
        onNotEstablishedCancelSearch={handleNotEstablishedCancelSearch}
        onStop={handleStop}
        onAllNotEstablished={handleAllNotEstablished}
      />

      <AssessmentConfirmDialog
        open={confirmStep === "quote"}
        step="quote"
        onYes={handleQuoteDialogAnswer}
        onNo={handleQuoteDialogAnswer}
      />

      <AssessmentConfirmDialog
        open={confirmStep === "sms"}
        step="sms"
        onYes={handleSmsDialogYes}
        onNo={handleSmsDialogNo}
      />

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={3500}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert severity="success" onClose={() => setToast(null)}>
          {toast}
        </Alert>
      </Snackbar>
    </Box>
  );
}
