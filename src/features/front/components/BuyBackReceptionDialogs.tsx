import { useState } from "react";
import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import RemoveIcon from "@mui/icons-material/Remove";

import { BUYBACK_BLUE, BUYBACK_SOFT_BLUE } from "../constants";
import type {
  BuyBackReceptionDialogMode,
  BuyBackReceptionState,
} from "../types";

const STAFF_CODE_LENGTH = 7;

interface BuyBackReceptionDialogsProps {
  dialog: BuyBackReceptionDialogMode | null;
  state: BuyBackReceptionState;
  onClose: () => void;
  onChange: (patch: Partial<BuyBackReceptionState>) => void;
  onDialog: (dialog: BuyBackReceptionDialogMode | null) => void;
}

function normalizeStaffCode(value: string) {
  return value.replace(/[^0-9]/g, "").slice(0, STAFF_CODE_LENGTH);
}

function isValidStaffCode(value: string) {
  return /^\d{7}$/.test(value);
}

export function BuyBackReceptionDialogs({
  dialog,
  state,
  onClose,
  onChange,
  onDialog,
}: BuyBackReceptionDialogsProps) {
  const { t } = useTranslation();

  if (dialog === "buybackStaffScan") {
    return (
      <StaffCodeConfirmDialog
        key={`staff-${state.staffCode}`}
        initialStaffCode={state.staffCode}
        onClose={onClose}
        onConfirm={(staffCode) => {
          onChange({ staffCode });
          onClose();
        }}
      />
    );
  }

  if (dialog === "buybackReceiptPrint") {
    return (
      <PrintCountDialog
        key="receipt-print"
        title={t("page.front.buyBackReception.printTitle")}
        initialCount={1}
        onClose={onClose}
        onConfirm={() => {
          onChange({ printedReceptionTicket: true });
          onClose();
        }}
      />
    );
  }

  if (dialog === "buybackBranchPrint") {
    return (
      <PrintCountDialog
        key={`branch-print-${state.branchCount}`}
        title={t("page.front.buyBackReception.printTitle")}
        initialCount={Math.max(state.branchCount, 1)}
        onClose={onClose}
        onConfirm={(printCount) => {
          onChange({ branchCount: printCount, printedBranchTicket: true });
          onClose();
        }}
      />
    );
  }

  if (dialog === "buybackComplete") {
    return (
      <Dialog open maxWidth="xs" fullWidth>
        <DialogTitle sx={{ textAlign: "center", fontWeight: 800 }}>
          <CheckIcon sx={{ fontSize: 48, mb: 0.5, color: "success.main" }} />
          <Box>{t("page.front.buyBackReception.completeTitle")}</Box>
        </DialogTitle>
        <DialogContent dividers>
          <Typography
            align="center"
            variant="body2"
            sx={{ whiteSpace: "pre-line" }}
          >
            {state.smsAvailable
              ? t("page.front.buyBackReception.completeSmsGuide")
              : t("page.front.buyBackReception.completeNoSmsGuide")}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", p: 2 }}>
          <Button
            variant="contained"
            onClick={() => {
              onChange({ completed: true });
              onDialog(null);
            }}
            sx={{ minWidth: 120 }}
          >
            {t("page.front.done")}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return null;
}

function StaffCodeConfirmDialog({
  initialStaffCode,
  onClose,
  onConfirm,
}: {
  initialStaffCode: string;
  onClose: () => void;
  onConfirm: (staffCode: string) => void;
}) {
  const { t } = useTranslation();
  const [staffCode, setStaffCode] = useState(
    normalizeStaffCode(initialStaffCode),
  );

  const isValid = isValidStaffCode(staffCode);
  const showError = Boolean(staffCode) && !isValid;

  return (
    <Dialog
      open
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 1.5,
            width: 680,
            maxWidth: "calc(100vw - 48px)",
          },
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 800, fontSize: 16 }}>
        {t("page.front.buyBackReception.staffScanTitle")}
      </DialogTitle>
      <DialogContent dividers sx={{ minHeight: 170 }}>
        <Typography sx={{ fontSize: 12, mb: 2 }}>
          {t("page.front.buyBackReception.staffScanGuide")}
        </Typography>

        <Typography sx={{ fontSize: 12, fontWeight: 800, mb: 1 }}>
          {t("page.front.buyBackReception.staffCode")}
        </Typography>

        <TextField
          autoFocus
          size="small"
          value={staffCode}
          error={showError}
          onChange={(event) =>
            setStaffCode(normalizeStaffCode(event.target.value))
          }
          placeholder={t("page.front.buyBackReception.staffCodePlaceholder")}
          slotProps={{
            htmlInput: {
              inputMode: "numeric",
              maxLength: STAFF_CODE_LENGTH,
            },
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <QrCodeScannerIcon
                    sx={{
                      fontSize: 18,
                      color: "text.secondary",
                    }}
                  />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            width: 260,
            "& .MuiOutlinedInput-root": {
              height: 36,
              bgcolor: "white",
            },
          }}
        />

        <Typography
          variant="caption"
          color={showError ? "error" : "text.secondary"}
          sx={{ display: "block", mt: 0.9, minHeight: 18 }}
        >
          {showError
            ? t("page.front.buyBackReception.staffCodeLengthError")
            : t("page.front.buyBackReception.staffCodeLengthGuide")}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "flex-end", gap: 1.2, p: 2 }}>
        <Button
          variant="contained"
          color="inherit"
          onClick={onClose}
          sx={{
            minWidth: 120,
            bgcolor: "#9aa3b1",
            color: "white",
            "&:hover": { bgcolor: "#838c9a" },
          }}
        >
          {t("page.front.cancel")}
        </Button>
        <Button
          variant="contained"
          disabled={!isValid}
          onClick={() => onConfirm(staffCode)}
          sx={{ minWidth: 120 }}
        >
          {t("page.front.action.execute")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function PrintCountDialog({
  title,
  initialCount,
  onClose,
  onConfirm,
}: {
  title: string;
  initialCount: number;
  onClose: () => void;
  onConfirm: (count: number) => void;
}) {
  const { t } = useTranslation();
  const [count, setCount] = useState(Math.max(initialCount, 1));

  return (
    <Dialog
      open
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 1.5,
            width: 680,
            maxWidth: "calc(100vw - 48px)",
          },
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 800, fontSize: 16 }}>{title}</DialogTitle>
      <DialogContent dividers sx={{ minHeight: 170 }}>
        <Typography sx={{ fontSize: 12, mb: 2 }}>
          {t("page.front.buyBackReception.selectPrintCount")}
        </Typography>
        <Typography sx={{ fontSize: 12, fontWeight: 800, mb: 1 }}>
          {t("page.front.buyBackReception.countSpecify")}
        </Typography>

        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            borderRadius: 1,
            bgcolor: BUYBACK_SOFT_BLUE,
            p: 0.4,
          }}
        >
          <IconButton
            size="small"
            aria-label={t("page.front.buyBackReception.decreasePrintCount")}
            onClick={() => setCount((current) => Math.max(current - 1, 1))}
            sx={{ width: 30, height: 30, color: BUYBACK_BLUE }}
          >
            <RemoveIcon sx={{ fontSize: 16 }} />
          </IconButton>
          <TextField
            size="small"
            value={count}
            onChange={(event) =>
              setCount(Math.max(normalizeCountInput(event.target.value), 1))
            }
            slotProps={{
              htmlInput: {
                inputMode: "numeric",
              },
            }}
            sx={{
              width: 78,
              "& .MuiOutlinedInput-root": { height: 30, bgcolor: "white" },
              "& input": { textAlign: "center", p: 0, fontWeight: 700 },
            }}
          />
          <IconButton
            size="small"
            aria-label={t("page.front.buyBackReception.increasePrintCount")}
            onClick={() => setCount((current) => current + 1)}
            sx={{ width: 30, height: 30, color: BUYBACK_BLUE }}
          >
            <AddIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "flex-end", gap: 1.2, p: 2 }}>
        <Button
          variant="contained"
          color="inherit"
          onClick={onClose}
          sx={{
            minWidth: 120,
            bgcolor: "#9aa3b1",
            color: "white",
            "&:hover": { bgcolor: "#838c9a" },
          }}
        >
          {t("page.front.cancel")}
        </Button>
        <Button
          variant="contained"
          onClick={() => onConfirm(count)}
          sx={{ minWidth: 120 }}
        >
          {t("page.front.action.execute")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function normalizeCountInput(value: string) {
  return Number(value.replace(/[^0-9]/g, "")) || 0;
}
