import Box from "@mui/material/Box";
import { useTranslation } from "react-i18next";
import type { PurchaseStatus } from "../types";

interface StyleConfig {
  bgcolor: string;
  color: string;
  dotColor: string;
}

const STATUS_STYLE: Record<PurchaseStatus, StyleConfig> = {
  awaiting: { bgcolor: "#FFF7ED", color: "#C2410C", dotColor: "#F97316" },
  saved: { bgcolor: "#FEF9C3", color: "#92400E", dotColor: "#EAB308" },
  completed: { bgcolor: "#F3F4F6", color: "#6B7280", dotColor: "#9CA3AF" },
  settled: { bgcolor: "#EDE9FE", color: "#6D28D9", dotColor: "#8B5CF6" },
  cancelled: { bgcolor: "#FEE2E2", color: "#B91C1C", dotColor: "#EF4444" },
};

interface Props {
  status: PurchaseStatus;
}

export function PurchaseStatusChip({ status }: Props) {
  const { t } = useTranslation();
  const style = STATUS_STYLE[status];

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        bgcolor: style.bgcolor,
        color: style.color,
        fontWeight: 600,
        fontSize: "0.75rem",
        height: 24,
        px: 1.25,
        borderRadius: "12px",
        whiteSpace: "nowrap",
      }}
    >
      <Box
        sx={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          bgcolor: style.dotColor,
          flexShrink: 0,
        }}
      />
      {t(`page.purchase.list.status.${status}` as Parameters<typeof t>[0])}
    </Box>
  );
}
