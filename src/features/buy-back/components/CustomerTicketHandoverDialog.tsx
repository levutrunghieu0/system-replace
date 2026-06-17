import { useTranslation } from "react-i18next";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

interface CustomerTicketHandoverDialogProps {
  open: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function CustomerTicketHandoverDialog({
  open,
  onConfirm,
  onClose,
}: CustomerTicketHandoverDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: { borderRadius: 2 },
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>
        {t("page.purchase.customerTicketHandoverDialog.title")}
      </DialogTitle>

      <DialogContent>
        <DialogContentText>
          {t("page.purchase.customerTicketHandoverDialog.message")}
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button color="inherit" onClick={onClose}>
          {t("page.purchase.customerTicketHandoverDialog.cancel")}
        </Button>
        <Button variant="contained" onClick={onConfirm}>
          {t("page.purchase.customerTicketHandoverDialog.confirm")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
