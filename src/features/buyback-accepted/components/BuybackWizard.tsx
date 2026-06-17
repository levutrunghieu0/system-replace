import { useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import SvgIcon from "@mui/material/SvgIcon";
import Typography from "@mui/material/Typography";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import EditNoteIcon from "@mui/icons-material/EditNote";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { useTranslation } from "react-i18next";
import { useBuyback } from "../context/BuybackContext";
import { WizardHeader } from "../../purchase-reception/components/WizardHeader";
import { TabletHandoffModal } from "../../purchase-reception/components/TabletHandoffModal";
import { EstimateScreen } from "./estimate/EstimateScreen";
import { ConsentStep1 } from "./consent/ConsentStep1";
import { ConsentStep2 } from "./consent/ConsentStep2";
import { ConsentStep3 } from "./consent/ConsentStep3";
import { ConsentStep4 } from "./consent/ConsentStep4";
import { ConsentStep5 } from "./consent/ConsentStep5";
import { SignatureScreen } from "./consent/SignatureScreen";
import { StaffCodeScanDialog } from "./consent/StaffCodeScanScreen";
import { PaymentScreen } from "./payment/PaymentScreen";
import { SettlementScreen } from "./payment/SettlementScreen";
import { CONSENT_STEP_COUNT } from "../types";
import type { BuybackScreen } from "../types";

type StaffAuthAction = "decline" | "signed" | "payment" | "cancel";

const CONSENT_SCREEN_TO_STEP: Partial<Record<BuybackScreen, number>> = {
  "consent-1": 1,
  "consent-5": 2,
  signature: 3,
  "consent-2": 4,
  "consent-3": 4,
  "consent-4": 4,
};

const CONSENT_SCREENS: BuybackScreen[] = [
  "consent-1",
  "consent-2",
  "consent-3",
  "consent-4",
  "consent-5",
  "signature",
];

const CONSENT_BACK: Partial<Record<BuybackScreen, BuybackScreen>> = {
  "consent-5": "consent-1",
  signature: "consent-5",
  "consent-3": "consent-2",
  "consent-4": "consent-3",
};

const CONSENT_FORWARD: Partial<Record<BuybackScreen, BuybackScreen>> = {
  "consent-1": "consent-5",
  "consent-5": "signature",
  "consent-2": "consent-3",
  "consent-3": "consent-4",
  "consent-4": "payment",
};

function ConsentClipboardIcon() {
  return (
    <SvgIcon
      viewBox="0 0 24 24"
      sx={{
        width: 56,
        height: 56,
        mb: 2,
        color: "#212121",
      }}
    >
      <path
        fill="currentColor"
        d="M19 3h-4.18C14.4 1.84 13.3 1 12 1S9.6 1.84 9.18 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2Zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1Zm2 14H7v-2h7v2Zm3-4H7v-2h10v2Zm0-4H7V7h10v2Z"
      />
    </SvgIcon>
  );
}

function HeaderBar({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        bgcolor: "primary.main",
        color: "white",
        px: 2,
        height: 56,
        display: "flex",
        alignItems: "center",
        gap: 1,
        flexShrink: 0,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            bgcolor: "rgba(255,255,255,0.2)",
            borderRadius: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </Box>

        <Typography
          variant="h5"
          sx={{ color: "white", fontWeight: 700, fontSize: "1rem" }}
        >
          {title}
        </Typography>
      </Box>

      {children}
    </Box>
  );
}

function EstimateHeader({ onRevise }: { onRevise: () => void }) {
  const { t } = useTranslation();
  const { closeBuyback, estimateState, reviseMode } = useBuyback();

  return (
    <HeaderBar
      icon={<ReceiptLongIcon sx={{ fontSize: 18, color: "white" }} />}
      title={t("buybackWizard.estimate.title")}
    >
      <Button
        variant="outlined"
        size="small"
        startIcon={<AssignmentIcon sx={{ fontSize: 16 }} />}
        onClick={onRevise}
        disabled={estimateState !== "list" || reviseMode}
        sx={{
          color: "white",
          borderColor: "rgba(255,255,255,0.5)",
          fontSize: "0.8125rem",
          "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" },
          "&.Mui-disabled": {
            color: "rgba(255,255,255,0.4)",
            borderColor: "rgba(255,255,255,0.2)",
          },
        }}
      >
        {t("buybackWizard.estimate.reviseButton")}
      </Button>

      <IconButton onClick={closeBuyback} sx={{ color: "white", ml: 0.5 }}>
        <CloseIcon />
      </IconButton>
    </HeaderBar>
  );
}

function PaymentHeader() {
  const { t } = useTranslation();
  const { goTo, closeBuyback } = useBuyback();

  return (
    <HeaderBar
      icon={<ReceiptLongIcon sx={{ fontSize: 18, color: "white" }} />}
      title={t("buybackWizard.payment.title")}
    >
      <IconButton
        onClick={() => goTo("consent-4")}
        sx={{ color: "rgba(255,255,255,0.6)" }}
        size="small"
        aria-label={t("buybackWizard.common.back", { defaultValue: "Back" })}
      >
        ←
      </IconButton>

      <IconButton
        disabled
        sx={{ color: "rgba(255,255,255,0.3)" }}
        size="small"
        aria-label={t("buybackWizard.common.next", { defaultValue: "Next" })}
      >
        →
      </IconButton>

      <IconButton onClick={closeBuyback} sx={{ color: "white" }}>
        <CloseIcon />
      </IconButton>
    </HeaderBar>
  );
}

function SettlementHeader() {
  const { t } = useTranslation();
  const { closeBuyback, settlementStatus } = useBuyback();

  return (
    <HeaderBar
      icon={<PointOfSaleIcon sx={{ fontSize: 18, color: "white" }} />}
      title={t("buybackWizard.settlement.title")}
    >
      <IconButton
        onClick={closeBuyback}
        disabled={settlementStatus === "processing"}
        sx={{ color: "white" }}
      >
        <CloseIcon />
      </IconButton>
    </HeaderBar>
  );
}

export function BuybackWizard() {
  const { t } = useTranslation();
  const {
    isOpen,
    screen,
    mainScreen,
    goTo,
    closeBuyback,
    enterReviseMode,
    allRejectNotice,
    dismissAllRejectNotice,
  } = useBuyback();

  const [showReviseDialog, setShowReviseDialog] = useState(false);
  const [pendingStaffAction, setPendingStaffAction] =
    useState<StaffAuthAction | null>(null);
  const [staffAuthOpen, setStaffAuthOpen] = useState(false);
  const [staffAuthBackgroundScreen, setStaffAuthBackgroundScreen] =
    useState<BuybackScreen>("estimate");

  const consentStep = CONSENT_SCREEN_TO_STEP[mainScreen] ?? null;
  const isConsent = CONSENT_SCREENS.includes(mainScreen);
  const isPayment = mainScreen === "payment";
  const isSettlement = mainScreen === "settlement";

  const openStaffHandoff = (
    action: StaffAuthAction,
    backgroundScreen: BuybackScreen = mainScreen,
  ) => {
    setPendingStaffAction(action);
    setStaffAuthBackgroundScreen(backgroundScreen);
    goTo("handoff-to-staff");
  };

  const openStaffAuthPopup = () => {
    goTo(staffAuthBackgroundScreen);
    setStaffAuthOpen(true);
  };

  const handleStaffAuthCancel = () => {
    setStaffAuthOpen(false);
    setPendingStaffAction(null);
    goTo(staffAuthBackgroundScreen);
  };

  const handleStaffAuthComplete = () => {
    const action = pendingStaffAction;
    setStaffAuthOpen(false);
    setPendingStaffAction(null);

    if (action === "decline") {
      goTo("failed-registration-confirm");
      return;
    }

    if (action === "signed") {
      goTo("consent-2");
      return;
    }

    if (action === "payment") {
      goTo("settlement");
      return;
    }

    closeBuyback();
  };

  return (
    <>
      <Dialog
        open={isOpen}
        fullScreen
        onClose={() => {}}
        slotProps={{
          paper: {
            sx: {
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            },
          },
        }}
      >
        {mainScreen === "estimate" && (
          <EstimateHeader onRevise={() => setShowReviseDialog(true)} />
        )}

        {isConsent && (
          <WizardHeader
            title={t("buybackWizard.consent.headerTitle")}
            currentStep={consentStep}
            stepCount={CONSENT_STEP_COUNT}
            iconLabel={t("buybackWizard.consent.iconLabel")}
            onBack={
              CONSENT_BACK[mainScreen]
                ? () => goTo(CONSENT_BACK[mainScreen]!)
                : undefined
            }
            onForward={
              CONSENT_FORWARD[mainScreen]
                ? () => goTo(CONSENT_FORWARD[mainScreen]!)
                : undefined
            }
            onClose={() => openStaffHandoff("cancel", mainScreen)}
          />
        )}

        {isPayment && <PaymentHeader />}
        {isSettlement && <SettlementHeader />}

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {mainScreen === "estimate" && <EstimateScreen />}
          {mainScreen === "consent-1" && (
            <ConsentStep1
              onAgree={() => goTo("consent-5")}
              onDecline={() => openStaffHandoff("decline", "consent-1")}
            />
          )}
          {mainScreen === "consent-2" && <ConsentStep2 />}
          {mainScreen === "consent-3" && <ConsentStep3 />}
          {mainScreen === "consent-4" && <ConsentStep4 />}
          {mainScreen === "consent-5" && <ConsentStep5 />}
          {mainScreen === "signature" && (
            <SignatureScreen
              onApproved={() => openStaffHandoff("signed", "signature")}
            />
          )}
          {mainScreen === "payment" && (
            <PaymentScreen
              onSelected={() => openStaffHandoff("payment", "payment")}
            />
          )}
          {mainScreen === "settlement" && <SettlementScreen />}
        </Box>
      </Dialog>

      <StaffCodeScanDialog
        open={isOpen && staffAuthOpen}
        title={t("buybackWizard.staffAuth.title", {
          defaultValue: t("buybackConsentWizard.staffAuth.title"),
        })}
        description={t("buybackWizard.staffAuth.description", {
          defaultValue: t("buybackConsentWizard.staffAuth.description"),
        })}
        onCancel={handleStaffAuthCancel}
        onScanned={handleStaffAuthComplete}
      />

      {/* Proceed-to-consent confirmation modal */}
      <Dialog
        open={isOpen && screen === "confirm-proceed"}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              textAlign: "center",
            },
          },
        }}
      >
        <DialogContent sx={{ py: 5, px: 4 }}>
          <ConsentClipboardIcon />

          <Typography variant="h5" sx={{ fontWeight: 700, mb: 4 }}>
            {t("buybackWizard.estimate.confirmProceed.title")}
          </Typography>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => goTo("estimate")}
              sx={{
                flex: 1,
                height: 52,
                fontSize: "1rem",
                fontWeight: 700,
              }}
            >
              {t("buybackWizard.estimate.confirmProceed.cancel")}
            </Button>

            <Button
              variant="contained"
              onClick={() => goTo("handoff-to-customer")}
              sx={{
                flex: 1,
                height: 52,
                fontSize: "1rem",
                fontWeight: 700,
              }}
            >
              {t("buybackWizard.estimate.confirmProceed.proceed")}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Revise quotation: staff code scan gate (E-28 Rule 1) */}
      <Dialog
        open={isOpen && showReviseDialog}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, textAlign: "center" } } }}
      >
        <DialogContent sx={{ py: 5, px: 4 }}>
          <EditNoteIcon sx={{ fontSize: 56, color: "warning.main", mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            {t("buybackWizard.estimate.reviseDialog.title")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            {t("buybackWizard.estimate.reviseDialog.description")}
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setShowReviseDialog(false)}
              sx={{ flex: 1, height: 52 }}
            >
              {t("buybackWizard.estimate.reviseDialog.cancel")}
            </Button>
            <Button
              variant="contained"
              startIcon={<QrCodeScannerIcon />}
              onClick={() => {
                setShowReviseDialog(false);
                enterReviseMode();
              }}
              sx={{ flex: 1, height: 52 }}
            >
              {t("buybackWizard.estimate.reviseDialog.scanDemo")}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* All-reject confirmation from consent decline after staff authentication */}
      <Dialog
        open={isOpen && screen === "failed-registration-confirm"}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              textAlign: "center",
            },
          },
        }}
      >
        <DialogContent sx={{ py: 5, px: 4 }}>
          <CancelIcon sx={{ fontSize: 56, color: "text.secondary", mb: 2 }} />

          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            {t("buybackWizard.consent.allRejectPrompt")}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            {t("buybackWizard.consent.allRejectDescription", {
              defaultValue: t("buybackConsentWizard.failedConfirm.description"),
            })}
          </Typography>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => goTo("consent-1")}
              sx={{
                flex: 1,
                height: 52,
                fontSize: "1rem",
                fontWeight: 700,
              }}
            >
              {t("buybackWizard.consent.cancel")}
            </Button>

            <Button
              variant="contained"
              onClick={closeBuyback}
              sx={{
                flex: 1,
                height: 52,
                fontSize: "1rem",
                fontWeight: 700,
              }}
            >
              {t("buybackWizard.consent.handOver")}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <TabletHandoffModal
        open={isOpen && screen === "handoff-to-customer"}
        direction="to-customer"
        onCancel={() => goTo("estimate")}
        onConfirm={() => goTo("consent-1")}
      />

      <TabletHandoffModal
        open={isOpen && screen === "handoff-to-staff"}
        direction="to-staff"
        onCancel={() => goTo(staffAuthBackgroundScreen)}
        onConfirm={openStaffAuthPopup}
      />

      {/* All-reject registered notice (data forwarded to E-52) */}
      <Snackbar
        open={allRejectNotice}
        autoHideDuration={6000}
        onClose={dismissAllRejectNotice}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          icon={<CheckCircleIcon />}
          severity="info"
          variant="filled"
          onClose={dismissAllRejectNotice}
        >
          {t("buybackWizard.estimate.allRejectDone")}
        </Alert>
      </Snackbar>
    </>
  );
}
