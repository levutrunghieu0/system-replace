import { useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Snackbar from "@mui/material/Snackbar";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import CancelIcon from "@mui/icons-material/Cancel";
import EditNoteIcon from "@mui/icons-material/EditNote";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useTranslation } from "react-i18next";
import { useBuyback } from "../../context/BuybackContext";
import { DEMO_ASSESSOR_NAME } from "../../types";
import { ItemRow } from "./ItemRow";
import { CouponPanel } from "./CouponPanel";

const ESTIMATE_TABLE_SX = {
  tableLayout: "fixed",
  width: "100%",
  "& th": {
    height: 44,
    py: 0,
    px: 1,
    bgcolor: "grey.100",
    color: "text.secondary",
    fontWeight: 800,
    fontSize: "0.76rem",
    lineHeight: 1.2,
    whiteSpace: "nowrap",
    borderBottom: "1px solid",
    borderColor: "divider",
    verticalAlign: "middle",
  },
  "& td": {
    px: 1,
    py: 1,
    verticalAlign: "middle",
    borderBottom: "1px solid",
    borderColor: "divider",
  },
};

function EstimateColumnGroup() {
  return (
    <colgroup>
      <col style={{ width: 48 }} />
      <col style={{ width: 76 }} />
      <col />
      <col style={{ width: 124 }} />
      <col style={{ width: 104 }} />
      <col style={{ width: 86 }} />
      <col style={{ width: 104 }} />
      <col style={{ width: 68 }} />
    </colgroup>
  );
}

export function EstimateScreen() {
  const { t } = useTranslation();
  const {
    estimateState,
    items,
    staffCodeScanned,
    reviseMode,
    exitReviseMode,
    simulateScan,
    setStaffCodeScanned,
    registerAllReject,
    goTo,
  } = useBuyback();

  const [showCodeWarning, setShowCodeWarning] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showAllRejectConfirm, setShowAllRejectConfirm] = useState(false);

  const handleConfirm = () => {
    if (!staffCodeScanned) {
      setShowCodeWarning(true);
      return;
    }
    goTo("confirm-proceed");
  };

  const renderTableHeader = () => (
    <TableHead>
      <TableRow>
        <TableCell>{t("buybackWizard.estimate.table.no")}</TableCell>
        <TableCell>{t("buybackWizard.estimate.table.genre")}</TableCell>
        <TableCell>{t("buybackWizard.estimate.table.productName")}</TableCell>
        <TableCell sx={{ textAlign: "right" }}>
          {t("buybackWizard.estimate.table.unitPrice")}
        </TableCell>
        <TableCell sx={{ textAlign: "center" }}>
          {t("buybackWizard.estimate.table.quantity")}
        </TableCell>
        <TableCell sx={{ textAlign: "right" }}>
          {t("buybackWizard.estimate.table.coupon")}
        </TableCell>
        <TableCell sx={{ textAlign: "right" }}>
          {t("buybackWizard.estimate.table.lineTotal")}
        </TableCell>
        <TableCell sx={{ textAlign: "center" }}>
          {t("buybackWizard.estimate.table.returnFlag")}
        </TableCell>
      </TableRow>
    </TableHead>
  );

  return (
    <Box sx={{ flex: 1, display: "flex", minHeight: 0 }}>
      <Box
        sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}
      >
        {reviseMode && (
          <Alert
            severity="warning"
            icon={<EditNoteIcon />}
            sx={{ borderRadius: 0, alignItems: "center" }}
            action={
              <Button
                color="inherit"
                size="small"
                variant="outlined"
                onClick={exitReviseMode}
              >
                {t("buybackWizard.estimate.reviseDone")}
              </Button>
            }
          >
            {t("buybackWizard.estimate.reviseBanner")}
          </Alert>
        )}

        {estimateState === "scan" && (
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              color: "text.secondary",
            }}
          >
            <QrCodeScannerIcon sx={{ fontSize: 80, opacity: 0.4 }} />
            <Typography variant="h6" color="text.secondary">
              {t("buybackWizard.estimate.scanPrompt")}
            </Typography>
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <Button variant="outlined" onClick={simulateScan}>
                {t("buybackWizard.estimate.scanDemo")}
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => setShowErrorModal(true)}
              >
                {t("buybackWizard.estimate.errorDemo")}
              </Button>
            </Box>
          </Box>
        )}

        {estimateState === "loading" && (
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress size={56} />
          </Box>
        )}

        {estimateState === "list" && (
          <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
            <Table size="small" stickyHeader sx={ESTIMATE_TABLE_SX}>
              <EstimateColumnGroup />
              {renderTableHeader()}
              <TableBody>
                {items.map((item) => (
                  <ItemRow key={item.id} item={item} />
                ))}
              </TableBody>
            </Table>
          </Box>
        )}

        {estimateState === "list" && !staffCodeScanned && (
          <Box sx={{ p: 1, borderTop: "1px solid", borderColor: "divider" }}>
            <Button size="small" variant="text" onClick={setStaffCodeScanned}>
              {t("buybackWizard.estimate.staffScanDemo")}
            </Button>
          </Box>
        )}
      </Box>

      <Box sx={{ width: { xs: 220, md: 240, lg: 280 }, flexShrink: 0 }}>
        <CouponPanel
          onConfirm={handleConfirm}
          onAllReject={() => setShowAllRejectConfirm(true)}
        />
      </Box>

      <Dialog
        open={showErrorModal}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 2, textAlign: "center" } } }}
      >
        <DialogContent sx={{ py: 4, px: 4 }}>
          <CancelIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            {t("buybackWizard.estimate.assessmentIncompleteLine1")}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            {t("buybackWizard.estimate.assessmentIncompleteLine2")}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {t("buybackWizard.estimate.assessorName", {
              name: DEMO_ASSESSOR_NAME,
            })}
          </Typography>
          <Button
            variant="contained"
            color="inherit"
            onClick={() => setShowErrorModal(false)}
            sx={{
              minWidth: 160,
              bgcolor: "grey.400",
              "&:hover": { bgcolor: "grey.500" },
            }}
          >
            {t("buybackWizard.estimate.cancel")}
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showAllRejectConfirm}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, textAlign: "center" } } }}
      >
        <DialogContent sx={{ py: 5, px: 4 }}>
          <CancelIcon sx={{ fontSize: 56, color: "error.main", mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            {t("buybackWizard.estimate.allRejectDialog.title")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            {t("buybackWizard.estimate.allRejectDialog.description")}
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setShowAllRejectConfirm(false)}
              sx={{ flex: 1, height: 52, fontSize: "1rem" }}
            >
              {t("buybackWizard.estimate.allRejectDialog.cancel")}
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                setShowAllRejectConfirm(false);
                registerAllReject();
              }}
              sx={{ flex: 1, height: 52, fontSize: "1rem" }}
            >
              {t("buybackWizard.estimate.allRejectDialog.confirm")}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={showCodeWarning}
        autoHideDuration={4000}
        onClose={() => setShowCodeWarning(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          icon={<WarningAmberIcon />}
          severity="warning"
          onClose={() => setShowCodeWarning(false)}
          variant="filled"
        >
          {t("buybackWizard.estimate.staffCodeWarning")}
        </Alert>
      </Snackbar>
    </Box>
  );
}
