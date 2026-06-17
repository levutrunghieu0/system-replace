import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";
import { useBuyback } from "../../context/BuybackContext";

export function ConsentStep3() {
  const { goTo } = useBuyback();
  const { t } = useTranslation();

  return (
    <Box
      sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}
    >
      <Box sx={{ px: 4, py: 2, flexShrink: 0 }}>
        <Typography variant="body1">
          {t("buybackConsentWizard.consentStep3.instruction")}
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          px: 4,
          pb: 2,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        <Box
          sx={{
            flex: 1,
            bgcolor: "grey.200",
            borderRadius: 2,
            border: "2px solid",
            borderColor: "grey.300",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
          }}
        >
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ fontWeight: 700 }}
          >
            {t("buybackConsentWizard.consentStep3.ocrTitle")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("buybackConsentWizard.consentStep3.vendorNote")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("buybackConsentWizard.consentStep3.adjustLater")}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "flex-end",
          borderTop: "1px solid",
          borderColor: "divider",
          flexShrink: 0,
        }}
      >
        <Button
          variant="contained"
          size="large"
          onClick={() => goTo("consent-4")}
          sx={{ minWidth: 160, height: 52, fontSize: "1rem" }}
        >
          {t("buybackConsentWizard.common.capture")}
        </Button>
      </Box>
    </Box>
  );
}
