import { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import { useTranslation } from "react-i18next";

interface InvoiceVerificationModalProps {
  open: boolean;
  totalAmount: number;
  onConfirm: (slipAmount: number) => void;
  onCancel: () => void;
  submitting?: boolean;
}

export function InvoiceVerificationModal({
  open,
  totalAmount,
  onConfirm,
  onCancel,
  submitting = false,
}: InvoiceVerificationModalProps) {
  const { t } = useTranslation();
  const [slipAmountStr, setSlipAmountStr] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setSlipAmountStr("");
      setError(null);
    }
  }, [open]);

  // Auto-generate slip details
  const generatedSlipNo = "SL-987654";
  const currentDate = new Date().toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const handleExecute = () => {
    const entered = parseFloat(slipAmountStr.replace(/,/g, ""));
    if (isNaN(entered)) {
      setError(t("page.warehouse.csvPurchase.invoice.error.notANumber"));
      return;
    }
    console.log('totalAmount', totalAmount)

    if (entered !== totalAmount) {
      setError(t("page.warehouse.csvPurchase.invoice.error.amountMismatch"));
      return;
    }

    setError(null);
    onConfirm(entered);
  };

  const rowSx = {
    display: "flex",
    alignItems: "center",
    px: 3,
    py: 2,
    borderBottom: "1px solid",
    borderColor: "divider",
  };
  const labelSx = {
    minWidth: 120,
    fontSize: "0.875rem",
    fontWeight: 600,
    color: "text.secondary",
  };

  return (
    <Dialog
      open={open}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}
    >
      <DialogTitle
        sx={{
          fontSize: "0.975rem",
          fontWeight: 700,
          py: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        {t("page.warehouse.csvPurchase.invoice.title")}
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {error && (
          <Box sx={{ p: 2, pb: 0 }}>
            <Alert
              severity="error"
              variant="filled"
              sx={{ py: 0.25, fontSize: "0.8rem" }}
            >
              {error}
            </Alert>
          </Box>
        )}

        <Box sx={rowSx}>
          <Typography sx={labelSx}>
            {t("page.warehouse.csvPurchase.invoice.slipNumber")}
          </Typography>
          <Typography sx={{ fontSize: "0.875rem", fontWeight: 600 }}>
            {generatedSlipNo}
          </Typography>
        </Box>

        <Box sx={rowSx}>
          <Typography sx={labelSx}>
            {t("page.warehouse.csvPurchase.invoice.slipDate")}
          </Typography>
          <Typography sx={{ fontSize: "0.875rem", fontWeight: 600 }}>
            {currentDate}
          </Typography>
        </Box>

        <Box sx={{ ...rowSx, borderBottom: "none", pb: 3 }}>
          <Typography sx={labelSx}>
            {t("page.warehouse.csvPurchase.invoice.slipAmount")}
          </Typography>
          <Box
            sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 0.5 }}
          >
            <TextField
              size="small"
              placeholder="0"
              value={slipAmountStr}
              onChange={(e) => {
                setError(null);
                // Filter numbers only
                const cleanVal = e.target.value.replace(/[^0-9]/g, "");
                setSlipAmountStr(
                  cleanVal ? Number(cleanVal).toLocaleString("ja-JP") : "",
                );
              }}
              slotProps={{
                input: {
                  style: {
                    textAlign: "right",
                    fontWeight: 700,
                    fontSize: "1.05rem",
                  },
                },
              }}
              sx={{ width: "100%" }}
            />
            <Typography variant="caption" color="text.secondary">
              {t("page.warehouse.csvPurchase.invoice.demoHint", {
                amount: totalAmount.toLocaleString(),
              })}
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          gap: 1.5,
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "grey.50",
        }}
      >
        <Button
          variant="outlined"
          color="inherit"
          onClick={onCancel}
          sx={{ textTransform: "none", minWidth: 100, fontWeight: 600 }}
        >
          {t("action.cancel")}
        </Button>
        <Button
          variant="contained"
          onClick={handleExecute}
          disabled={!slipAmountStr || submitting}
          sx={{ textTransform: "none", minWidth: 100, fontWeight: 700 }}
        >
          {submitting ? <CircularProgress size={20} color="inherit" /> : t("action.run")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
