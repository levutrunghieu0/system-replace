import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import InputAdornment from "@mui/material/InputAdornment";
import OutlinedInput from "@mui/material/OutlinedInput";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Tooltip from "@mui/material/Tooltip";
import Divider from "@mui/material/Divider";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import SearchIcon from "@mui/icons-material/Search";
import ViewWeekIcon from "@mui/icons-material/ViewWeek";
import PersonOutlineIcon from "@mui/icons-material/Person2Outlined";
import { useTranslation } from "react-i18next";
import { useRouter } from "@tanstack/react-router";
import { useLayoutContext } from "../../contexts/LayoutContext";

const HEADER_HEIGHT = 56;

interface AppHeaderProps {
  showSecondaryNav: boolean;
}

export default function AppHeader({ showSecondaryNav }: AppHeaderProps) {
  const { t } = useTranslation();
  const { screenTitle, showBackButton, onBack } = useLayoutContext();
  const router = useRouter();
  const handleBack = () => (onBack ? onBack() : router.history.back());
  console.log("AppHeader rendered with showSecondaryNav:", showSecondaryNav); // Debug log;

  return (
    <Box
      sx={{
        height: HEADER_HEIGHT,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        px: 1.5,
        gap: 1,
        bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
        boxShadow: "0 1px 4px 0 rgba(0,0,0,0.06)",
      }}
    >
      {/* Back button + Screen title */}
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}
      >
        {showBackButton && (
          <Tooltip title={t("action.back")} arrow>
            <IconButton
              size="small"
              onClick={handleBack}
              sx={{ color: "text.primary" }}
            >
              <ArrowBackIosNewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        {screenTitle && (
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              whiteSpace: "nowrap",
              fontSize: "1rem",
              color: "text.primary",
            }}
          >
            {screenTitle}
          </Typography>
        )}
      </Box>

      {/* Spacer */}
      <Box sx={{ flex: 1 }} />

      {/* Search box with barcode icon inside */}
      <OutlinedInput
        size="small"
        placeholder={t("header.search")}
        startAdornment={
          <InputAdornment position="start">
            <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
          </InputAdornment>
        }
        endAdornment={
          <InputAdornment position="end">
            <Tooltip title="Barcode scan" arrow>
              <IconButton
                size="small"
                edge="end"
                sx={{
                  color: "text.secondary",
                  "&:hover": { color: "text.primary" },
                }}
              >
                <ViewWeekIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </InputAdornment>
        }
        sx={{
          maxWidth: 360,
          flex: "0 1 360px",
          height: 36,
          fontSize: "0.875rem",
          bgcolor: "background.paper",
          borderRadius: 1,
          "& fieldset": { borderColor: "divider" },
          "&:hover fieldset": { borderColor: "text.secondary" },
          "&.Mui-focused fieldset": { borderColor: "primary.main" },
        }}
      />

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 1 }} />

      {/* Staff login / scan area */}
      <Tooltip title={t("header.scanStaff")} arrow>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 1,
            py: 0.5,
            borderRadius: 2,
            cursor: "pointer",
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          <Badge
            variant="dot"
            color="error"
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            sx={{
              "& .MuiBadge-dot": {
                width: 8,
                height: 8,
                border: "1.5px solid white",
              },
            }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: "grey.200",
                color: "text.secondary",
              }}
            >
              <PersonOutlineIcon sx={{ fontSize: "1.2rem" }} />
            </Avatar>
          </Badge>
          <Typography
            variant="body2"
            sx={{
              fontSize: "0.82rem",
              whiteSpace: "nowrap",
              color: "text.primary",
              fontWeight: 500,
            }}
          >
            {t("header.scanStaff")}
          </Typography>
        </Box>
      </Tooltip>
    </Box>
  );
}

export { HEADER_HEIGHT };
