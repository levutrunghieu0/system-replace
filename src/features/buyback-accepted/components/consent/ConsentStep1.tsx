import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";
import { useBuyback } from "../../context/BuybackContext";

type ConsentStep1Props = {
  onAgree?: () => void;
  onDecline?: () => void;
};

export function ConsentStep1({ onAgree, onDecline }: ConsentStep1Props) {
  const { goTo } = useBuyback();
  const { t } = useTranslation();
  const termsText = t("buybackConsentWizard.consentStep1.termsText");

  const handleAgree = () => {
    if (onAgree) {
      onAgree();
      return;
    }

    goTo("consent-5");
  };

  const handleDecline = () => {
    if (onDecline) {
      onDecline();
      return;
    }

    goTo("handoff-to-staff");
  };

  return (
    <Box
      sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}
    >
      <Box sx={{ px: 4, py: 2, flexShrink: 0 }}>
        <Typography variant="body1">
          {t("buybackConsentWizard.consentStep1.instruction")}
        </Typography>
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto", px: 8, pb: 2 }}>
        {termsText.split("\n\n").map((section, i) => (
          <Box key={i} sx={{ mb: 2 }}>
            {section.split("\n").map((line, j) => (
              <Typography
                key={j}
                variant="body2"
                sx={{
                  mb: 0.5,
                  fontWeight: line.match(/^[１２３123]/) ? 700 : 400,
                  fontSize:
                    line.startsWith("・") || line.startsWith("-")
                      ? "0.875rem"
                      : "0.9375rem",
                }}
              >
                {line}
              </Typography>
            ))}
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          p: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          display: "flex",
          justifyContent: "center",
          gap: 3,
          flexShrink: 0,
        }}
      >
        <Button
          variant="outlined"
          size="large"
          onClick={handleDecline}
          sx={{ minWidth: 160, height: 52, fontSize: "1rem" }}
        >
          {t("buybackConsentWizard.common.disagree")}
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={handleAgree}
          sx={{ minWidth: 160, height: 52, fontSize: "1rem" }}
        >
          {t("buybackConsentWizard.common.agree")}
        </Button>
      </Box>
    </Box>
  );
}
