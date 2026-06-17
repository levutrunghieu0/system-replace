import { useMemo } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";

interface PhoneNumberDialogProps {
  open: boolean;
  receiptNumber: string;
  customerPhone?: string;
  onClose: () => void;
}

function normalizeReceiptNumber(receiptNumber: string) {
  const numericReceiptNumber = receiptNumber.replace(/[^0-9]/g, "");

  if (!numericReceiptNumber) return receiptNumber;

  return String(Number(numericReceiptNumber));
}

export function PhoneNumberDialog({
  open,
  receiptNumber,
  customerPhone,
  onClose,
}: PhoneNumberDialogProps) {
  const { t } = useTranslation();

  const displayReceiptNumber = useMemo(
    () => normalizeReceiptNumber(receiptNumber),
    [receiptNumber],
  );

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 1.5,
            width: 560,
            maxWidth: "calc(100vw - 48px)",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          px: 3,
          pt: 2.25,
          pb: 1,
          fontSize: "0.95rem",
          fontWeight: 700,
        }}
      >
        {t("page.purchase.phoneNumberDialog.title", {
          defaultValue: "電話番号確認",
        })}
      </DialogTitle>

      <DialogContent
        sx={{
          minHeight: 210,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 3,
          py: 3,
        }}
      >
        {customerPhone ? (
          <Box
            sx={{
              width: 260,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1.5,
              overflow: "hidden",
              bgcolor: "background.paper",
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1.4fr",
                bgcolor: "grey.100",
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <HeaderCell>
                {t("page.purchase.phoneNumberDialog.receiptNumber", {
                  defaultValue: "受付番号",
                })}
              </HeaderCell>
              <HeaderCell>
                {t("page.purchase.phoneNumberDialog.phoneNumber", {
                  defaultValue: "電話番号",
                })}
              </HeaderCell>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1.4fr" }}>
              <BodyCell>{displayReceiptNumber}</BodyCell>
              <BodyCell
                sx={{
                  color: "primary.main",
                  fontWeight: 800,
                  fontSize: "1rem",
                  letterSpacing: 0.1,
                }}
              >
                {customerPhone}
              </BodyCell>
            </Box>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
            {t("page.purchase.phoneNumberDialog.empty", {
              defaultValue: "電話番号が登録されていません。",
            })}
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 0 }}>
        <Button
          variant="contained"
          color="inherit"
          onClick={onClose}
          sx={{
            minWidth: 96,
            bgcolor: "grey.400",
            color: "common.white",
            fontWeight: 700,
            boxShadow: "none",
            "&:hover": {
              bgcolor: "grey.500",
              boxShadow: "none",
            },
          }}
        >
          {t("common.close", { defaultValue: "閉じる" })}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

interface CellProps {
  children: ReactNode;
  sx?: object;
}

function HeaderCell({ children }: CellProps) {
  return (
    <Typography
      component="div"
      variant="caption"
      sx={{
        px: 1.25,
        py: 1,
        textAlign: "center",
        color: "text.secondary",
        fontWeight: 700,
        borderRight: "1px solid",
        borderColor: "divider",
        "&:last-of-type": {
          borderRight: 0,
        },
      }}
    >
      {children}
    </Typography>
  );
}

function BodyCell({ children, sx }: CellProps) {
  return (
    <Typography
      component="div"
      variant="body2"
      sx={{
        minHeight: 70,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 1,
        textAlign: "center",
        borderRight: "1px solid",
        borderColor: "divider",
        fontWeight: 600,
        "&:last-of-type": {
          borderRight: 0,
        },
        ...sx,
      }}
    >
      {children}
    </Typography>
  );
}
