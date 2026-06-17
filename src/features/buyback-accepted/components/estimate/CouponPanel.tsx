import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import CancelIcon from "@mui/icons-material/Cancel";
import { useTranslation } from "react-i18next";
import { useBuyback } from "../../context/BuybackContext";
import { computeEstimateTotals } from "../../utils/estimateTotals";

interface CouponPanelProps {
  onConfirm: () => void;
  onAllReject: () => void;
}

export function CouponPanel({ onConfirm, onAllReject }: CouponPanelProps) {
  const { t } = useTranslation();
  const { items, coupon } = useBuyback();

  const totals = computeEstimateTotals(items, coupon);
  const couponLoaded = coupon.status === "loaded";
  const highlightSx = {
    fontWeight: 500,
    color: couponLoaded ? "primary.main" : "inherit",
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        borderLeft: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box sx={{ p: 2, flex: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
          {t("buybackWizard.estimate.coupon.title")}
        </Typography>

        {coupon.status === "idle" && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 3,
              color: "text.disabled",
            }}
          >
            <LocalOfferIcon sx={{ fontSize: 40, mb: 1, opacity: 0.4 }} />
            <Typography variant="body2" sx={{ textAlign: "center" }}>
              {t("buybackWizard.estimate.coupon.empty")}
            </Typography>
          </Box>
        )}

        {coupon.status === "loading" && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={40} />
          </Box>
        )}

        {couponLoaded && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              bgcolor: "primary.50",
              border: "1px solid",
              borderColor: "primary.200",
              borderRadius: 1,
              px: 2,
              py: 1.5,
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, color: "primary.main" }}
            >
              {coupon.name}
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, color: "primary.main" }}
            >
              {t("buybackWizard.estimate.coupon.bonus", {
                amount: totals.couponBonus.toLocaleString(),
              })}
            </Typography>
          </Box>
        )}
      </Box>

      <Divider />

      <Box sx={{ p: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {t("buybackWizard.estimate.summary.itemCount")}
          </Typography>

          <Box sx={{ textAlign: "right" }}>
            <Typography
              variant="body2"
              sx={{ ...highlightSx, fontWeight: 700 }}
            >
              {t("buybackWizard.estimate.summary.itemCountValue", {
                count: totals.acceptedCount,
              })}
            </Typography>
            {totals.returnedCount > 0 && (
              <Typography
                variant="caption"
                sx={{ color: "warning.main", fontWeight: 700 }}
              >
                {t("buybackWizard.estimate.summary.returnedCountValue", {
                  count: totals.returnedCount,
                })}
              </Typography>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 1 }} />

        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            {t("buybackWizard.estimate.summary.subtotal")}
          </Typography>
          <Typography variant="body2" sx={highlightSx}>
            ¥{totals.subtotal.toLocaleString()}
          </Typography>
        </Box>

        {couponLoaded && (
          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
          >
            <Typography variant="body2" color="text.secondary">
              {t("buybackWizard.estimate.summary.couponBonus")}
            </Typography>
            <Typography variant="body2" sx={highlightSx}>
              +¥{totals.couponBonus.toLocaleString()}
            </Typography>
          </Box>
        )}

        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {t("buybackWizard.estimate.summary.tax")}
          </Typography>
          <Typography variant="body2" sx={highlightSx}>
            ¥{totals.tax.toLocaleString()}
          </Typography>
        </Box>

        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={onConfirm}
          disabled={totals.acceptedCount === 0}
          sx={{ height: 52, fontSize: "0.9375rem", fontWeight: 700 }}
        >
          {t("buybackWizard.estimate.confirmButton", {
            amount: totals.total.toLocaleString(),
          })}
        </Button>

        <Button
          variant="outlined"
          color="error"
          fullWidth
          startIcon={<CancelIcon />}
          onClick={onAllReject}
          sx={{ mt: 1.5, height: 44, fontWeight: 700 }}
        >
          {t("buybackWizard.estimate.allRejectButton")}
        </Button>
      </Box>
    </Box>
  );
}
