import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import Typography from "@mui/material/Typography";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { useTranslation } from "react-i18next";
import { useBuyback } from "../../context/BuybackContext";
import type { PaymentMethod } from "../../types";

const PAYMENT_OPTIONS: {
  method: PaymentMethod;
  labelKey: string;
  icon: React.ReactNode;
}[] = [
  {
    method: "cash",
    labelKey: "buybackWizard.payment.methods.cash",
    icon: <AttachMoneyIcon sx={{ fontSize: 56, color: "text.secondary" }} />,
  },
  {
    method: "pay",
    labelKey: "buybackWizard.payment.methods.pay",
    icon: <SmartphoneIcon sx={{ fontSize: 56, color: "text.secondary" }} />,
  },
  {
    method: "bank-transfer",
    labelKey: "buybackWizard.payment.methods.bankTransfer",
    icon: <AccountBalanceIcon sx={{ fontSize: 56, color: "text.secondary" }} />,
  },
];

type PaymentScreenProps = {
  onSelected?: () => void;
};

export function PaymentScreen({ onSelected }: PaymentScreenProps) {
  const { t } = useTranslation();
  const { setPaymentMethod, goTo } = useBuyback();

  const handleSelect = (method: PaymentMethod) => {
    setPaymentMethod(method);

    if (onSelected) {
      onSelected();
      return;
    }

    goTo("handoff-to-staff");
  };

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        bgcolor: "grey.50",
      }}
    >
      <Box sx={{ px: 4, py: 2.5, flexShrink: 0 }}>
        <Typography variant="body1">
          {t("buybackWizard.payment.prompt")}
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 6,
          py: 4,
          gap: 3,
        }}
      >
        {PAYMENT_OPTIONS.map(({ method, labelKey, icon }) => (
          <Card
            key={method}
            variant="outlined"
            sx={{
              flex: 1,
              maxWidth: 320,
              borderRadius: 2,
              bgcolor: "background.paper",
            }}
          >
            <CardActionArea
              onClick={() => handleSelect(method)}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                py: 5,
                px: 3,
                minHeight: 180,
              }}
            >
              {icon}
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                {t(labelKey)}
              </Typography>
            </CardActionArea>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
