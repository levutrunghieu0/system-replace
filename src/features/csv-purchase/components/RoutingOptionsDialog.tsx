import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useTranslation } from "react-i18next";

interface RoutingOptionsDialogProps {
  open: boolean;
  onContinue: () => void;
  onReturn: () => void;
}

export function RoutingOptionsDialog({
  open,
  onContinue,
  onReturn,
}: RoutingOptionsDialogProps) {
  const { t } = useTranslation();
  return (
    <Dialog
      open={open}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      id="routing-options-dialog"
    >
      <DialogContent
        sx={{
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          textAlign: "center",
        }}
      >
        <InfoOutlinedIcon sx={{ fontSize: 56, color: "primary.main" }} />
        <Typography sx={{ fontSize: "1rem", fontWeight: 700, mt: 1 }}>
          {t("page.warehouse.csvPurchase.routing.title")}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t("page.warehouse.csvPurchase.routing.subtitle")}
        </Typography>
      </DialogContent>
      <DialogActions
        sx={{
          px: 3,
          py: 2.5,
          gap: 1.5,
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "grey.50",
          justifyContent: "center",
        }}
      >
        <Button
          variant="outlined"
          onClick={onContinue}
          sx={{ textTransform: "none", minWidth: 130, fontWeight: 600 }}
          id="routing-continue-button"
        >
          {t("page.warehouse.csvPurchase.routing.continue")}
        </Button>
        <Button
          variant="contained"
          onClick={onReturn}
          sx={{ textTransform: "none", minWidth: 130, fontWeight: 700 }}
          id="routing-return-button"
        >
          {t("page.warehouse.csvPurchase.routing.return")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
