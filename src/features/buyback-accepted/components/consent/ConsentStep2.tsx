import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import Typography from "@mui/material/Typography";
import BadgeIcon from "@mui/icons-material/Badge";
import ArticleIcon from "@mui/icons-material/Article";
import PublicIcon from "@mui/icons-material/Public";
import DriveEtaIcon from "@mui/icons-material/DriveEta";
import HomeIcon from "@mui/icons-material/Home";
import HelpOutlinedIcon from "@mui/icons-material/HelpOutlined";
import { useTranslation } from "react-i18next";
import { useBuyback } from "../../context/BuybackContext";
import { ID_DOCUMENT_OPTIONS } from "../../types";
import type { IdDocumentType } from "../../types";

const ICONS: Record<IdDocumentType, React.ReactNode> = {
  "drivers-license": (
    <DriveEtaIcon sx={{ fontSize: 56, color: "primary.main" }} />
  ),
  "my-number": <ArticleIcon sx={{ fontSize: 56, color: "primary.main" }} />,
  passport: <PublicIcon sx={{ fontSize: 56, color: "primary.main" }} />,
  "driving-history": (
    <DriveEtaIcon sx={{ fontSize: 56, color: "primary.main" }} />
  ),
  "resident-card": <HomeIcon sx={{ fontSize: 56, color: "primary.main" }} />,
  other: <HelpOutlinedIcon sx={{ fontSize: 56, color: "primary.main" }} />,
};

export function ConsentStep2() {
  const { setIdType, goTo } = useBuyback();
  const { t } = useTranslation();

  const handleSelect = (type: IdDocumentType) => {
    setIdType(type);
    goTo("consent-3");
  };

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        p: 4,
      }}
    >
      <Typography variant="body1" sx={{ mb: 1 }}>
        {t("buybackConsentWizard.consentStep2.requestDocuments")}
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        {t("buybackConsentWizard.consentStep2.selectDocument")}
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 2,
          maxWidth: 720,
          mx: "auto",
          width: "100%",
        }}
      >
        {ID_DOCUMENT_OPTIONS.map(({ type }) => (
          <Card
            key={type}
            variant="outlined"
            sx={{ borderRadius: 2, aspectRatio: "4/3" }}
          >
            <CardActionArea
              onClick={() => handleSelect(type)}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 1.5,
                p: 2,
              }}
            >
              <Box sx={{ color: "text.secondary" }}>
                {type === "other" ? (
                  <BadgeIcon sx={{ fontSize: 56, color: "text.disabled" }} />
                ) : (
                  ICONS[type]
                )}
              </Box>
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, textAlign: "center", lineHeight: 1.3 }}
              >
                {t(`buybackConsentWizard.idDocument.${type}`)}
              </Typography>
            </CardActionArea>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
