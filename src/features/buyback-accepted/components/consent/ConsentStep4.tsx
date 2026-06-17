import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import { useTranslation } from "react-i18next";
import { useBuyback } from "../../context/BuybackContext";

export function ConsentStep4() {
  const { goTo } = useBuyback();
  const { t } = useTranslation();

  return (
    <Box
      sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}
    >
      <Box sx={{ px: 4, py: 2, flexShrink: 0 }}>
        <Typography variant="body1">
          {t("buybackConsentWizard.consentStep4.instruction")}
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 3,
          color: "text.secondary",
          px: 4,
        }}
      >
        <CreditCardIcon sx={{ fontSize: 80, opacity: 0.4 }} />
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ textAlign: "center" }}
        >
          {t("buybackConsentWizard.consentStep4.scanGuide")}
        </Typography>
        <Button variant="outlined" onClick={() => goTo("payment")}>
          {t("buybackConsentWizard.action.demoScanOrSkip")}
        </Button>
      </Box>

      <Box
        sx={{
          p: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          display: "flex",
          justifyContent: "flex-end",
          gap: 2,
          flexShrink: 0,
        }}
      >
        <Button
          variant="outlined"
          size="large"
          onClick={() => goTo("payment")}
          sx={{ minWidth: 160, height: 52, fontSize: "1rem" }}
        >
          {t("buybackConsentWizard.common.skip")}
        </Button>
      </Box>
    </Box>
  );
}
