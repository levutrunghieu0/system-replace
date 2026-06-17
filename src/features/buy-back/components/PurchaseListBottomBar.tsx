import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";

interface PurchaseListBottomBarProps {
  assessingCount: number;
  loadDetailsDisabled: boolean;
  onLoadDetails: () => void;
  onCustomerTicketReissue: () => void;
}

export function PurchaseListBottomBar({
  assessingCount,
  loadDetailsDisabled,
  onLoadDetails,
  onCustomerTicketReissue,
}: PurchaseListBottomBarProps) {
  const { t } = useTranslation();

  return (
    <>
      <Divider />
      <Box
        sx={{
          height: 60,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          gap: 1.5,
          bgcolor: "background.paper",
        }}
      >
        <Box
          sx={{
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            gap: 1,
            overflowX: "auto",
            "&::-webkit-scrollbar": {
              height: 4,
            },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: "divider",
              borderRadius: 999,
            },
          }}
        >
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            sx={{
              flexShrink: 0,
              textTransform: "none",
              fontWeight: 500,
              minWidth: 100,
            }}
          >
            {t("page.purchase.list.action.fieldTrip")}
          </Button>

          <Button
            variant="outlined"
            color="inherit"
            size="small"
            sx={{
              flexShrink: 0,
              textTransform: "none",
              fontWeight: 500,
              minWidth: 100,
            }}
          >
            {t("page.purchase.list.action.function")}
          </Button>

          <Button
            variant="contained"
            color="primary"
            size="small"
            disabled={loadDetailsDisabled}
            onClick={onLoadDetails}
            startIcon={<DescriptionOutlinedIcon fontSize="small" />}
            sx={{
              flexShrink: 0,
              textTransform: "none",
              fontWeight: 700,
              minWidth: 100,
              boxShadow: "none",
              "&:hover": {
                boxShadow: "none",
              },
            }}
          >
            {t("page.purchase.list.screenAction.loadDetails", {
              defaultValue: "明細読込",
            })}
          </Button>

          <Button
            variant="outlined"
            color="inherit"
            size="small"
            onClick={onCustomerTicketReissue}
            startIcon={<ReceiptLongOutlinedIcon fontSize="small" />}
            sx={{
              flexShrink: 0,
              textTransform: "none",
              fontWeight: 500,
              minWidth: 120,
            }}
          >
            {t("page.purchase.list.menu.customerTicketReissue")}
          </Button>
        </Box>

        <Box sx={{ textAlign: "right", flexShrink: 0 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", lineHeight: 1.4 }}
          >
            {t("page.purchase.list.action.assessingCountLabel")}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.4 }}>
            {t("page.purchase.list.action.assessingCountValue", {
              n: assessingCount,
            })}
          </Typography>
        </Box>
      </Box>
    </>
  );
}
