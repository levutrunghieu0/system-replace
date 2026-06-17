import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import { useTranslation } from "react-i18next";
import { useBuyback } from "../../context/BuybackContext";

type BuybackContextWithDemoScan = ReturnType<typeof useBuyback> & {
  demoScanStaffCode?: () => void;
  simulateScan?: () => void;
};

type StaffCodeScanDialogProps = {
  open: boolean;
  title: string;
  description: string;
  onCancel: () => void;
  onScanned: () => void;
};

export function StaffCodeScanDialog({
  open,
  title,
  description,
  onCancel,
  onScanned,
}: StaffCodeScanDialogProps) {
  const buyback = useBuyback() as BuybackContextWithDemoScan;
  const { t } = useTranslation();

  const handleDemoScan = () => {
    const scan = buyback.demoScanStaffCode ?? buyback.simulateScan;
    scan?.();
    onScanned();
  };

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: "rgba(15, 23, 42, 0.56)",
            backdropFilter: "blur(2px)",
          },
        },
        paper: {
          sx: {
            borderRadius: 4,
            overflow: "visible",
            boxShadow: "0 24px 80px rgba(15, 23, 42, 0.32)",
          },
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            p: { xs: 3, sm: 4 },
            textAlign: "center",
            bgcolor: "background.paper",
          }}
        >
          <Box
            sx={{
              width: 76,
              height: 76,
              mx: "auto",
              mb: 2.5,
              borderRadius: "24px",
              bgcolor: "primary.50",
              color: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "inset 0 0 0 1px rgba(25, 118, 210, 0.16)",
            }}
          >
            <VerifiedUserIcon sx={{ fontSize: 40 }} />
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
            {title}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 4, lineHeight: 1.8 }}
          >
            {description}
          </Typography>

          <Button
            variant="contained"
            size="large"
            startIcon={<QrCodeScannerIcon />}
            onClick={handleDemoScan}
            sx={{
              height: 52,
              minWidth: 260,
              fontSize: "1rem",
              fontWeight: 800,
              borderRadius: 2,
            }}
          >
            {t("buybackConsentWizard.action.demoScanStaffCode")}
          </Button>

          <Box sx={{ mt: 2 }}>
            <Button variant="text" onClick={onCancel} sx={{ fontWeight: 700 }}>
              {t("buybackConsentWizard.common.cancel")}
            </Button>
          </Box>
        </Paper>
      </DialogContent>
    </Dialog>
  );
}
