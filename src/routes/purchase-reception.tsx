import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import PrintIcon from "@mui/icons-material/Print";
import RemoveIcon from "@mui/icons-material/Remove";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import SvgIcon, { type SvgIconProps } from "@mui/material/SvgIcon";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { BuybackWizard } from "../features/buyback-accepted/components/BuybackWizard";
import {
  BuybackProvider,
  useBuyback,
} from "../features/buyback-accepted/context/BuybackContext";
import { ReceptionWizard } from "../features/purchase-reception/components/ReceptionWizard";
import {
  ReceptionProvider,
  useReception,
} from "../features/purchase-reception/context/ReceptionContext";
import { useLayoutConfig } from "../hooks/useLayoutConfig";

export const Route = createFileRoute("/purchase-reception")({
  component: PurchaseReceptionPage,
});

function PurchaseReceptionPage() {
  return (
    <ReceptionProvider>
      <BuybackProvider>
        <PurchaseReceptionContent />
        <ReceptionWizard />
        <BuybackWizard />
      </BuybackProvider>
    </ReceptionProvider>
  );
}

const DEMO_RECEIPTS = [{ no: 4, date: "2026/01/22", time: "10:23" }];

function BuybackReceptionIcon(props: SvgIconProps) {
  return (
    <SvgIcon viewBox="0 0 64 64" {...props}>
      <path
        d="M34 12l5 5 11-11"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 28h9v24h-9z"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M21 31h10c4.2 0 7.5 3.3 7.5 7.5v.5H29"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 44h18c3.5 0 6.8-1.4 9.2-3.8l5.8-5.8c1.7-1.7 4.4-1.7 6.1 0 1.6 1.6 1.6 4.3 0 6L51 49.5C48.1 52.4 44.2 54 40 54H21"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgIcon>
  );
}

function QuotationAgreementIcon(props: SvgIconProps) {
  return (
    <SvgIcon viewBox="0 0 64 64" {...props}>
      <path
        d="M18 8h28l8 8v25"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 8v48h25"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M45 8v10h9"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M27 24h18M27 33h16"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M41 50l12-12 6 6-12 12-8 2z"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgIcon>
  );
}

function CustomerCopyModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [printCount, setPrintCount] = useState(1);

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 2 } } }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontWeight: 700,
          pb: 1,
        }}
      >
        {t("purchaseReceptionPage.customerCopy.modalTitle")}
        <IconButton
          onClick={onClose}
          size="small"
          aria-label={t("purchaseReceptionPage.customerCopy.close")}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t("purchaseReceptionPage.customerCopy.description")}
        </Typography>

        <Table size="small" sx={{ mb: 3 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: "grey.100" }}>
              <TableCell sx={{ fontWeight: 700 }}>
                {t("purchaseReceptionPage.customerCopy.table.receptionNo")}
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                {t("purchaseReceptionPage.customerCopy.table.receptionDate")}
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                {t("purchaseReceptionPage.customerCopy.table.receptionTime")}
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                {t("purchaseReceptionPage.customerCopy.table.select")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {DEMO_RECEIPTS.map((r) => (
              <TableRow key={r.no}>
                <TableCell>{r.no}</TableCell>
                <TableCell>{r.date}</TableCell>
                <TableCell>{r.time}</TableCell>
                <TableCell>
                  <Button size="small" variant="outlined">
                    {t("purchaseReceptionPage.customerCopy.table.select")}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
          {t("purchaseReceptionPage.customerCopy.printCount")}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => setPrintCount((c) => Math.max(1, c - 1))}
            aria-label={t("purchaseReceptionPage.customerCopy.decrease")}
            sx={{
              color: "primary.main",
              border: "1px solid",
              borderColor: "primary.main",
            }}
          >
            <RemoveIcon />
          </IconButton>
          <Typography
            variant="body1"
            sx={{
              minWidth: 40,
              textAlign: "center",
              fontWeight: 700,
              fontSize: "1.25rem",
            }}
          >
            {printCount}
          </Typography>
          <IconButton
            size="small"
            onClick={() => setPrintCount((c) => c + 1)}
            aria-label={t("purchaseReceptionPage.customerCopy.increase")}
            sx={{
              color: "primary.main",
              border: "1px solid",
              borderColor: "primary.main",
            }}
          >
            <AddIcon />
          </IconButton>
        </Box>
      </DialogContent>

      <Box
        sx={{
          px: 3,
          pb: 3,
          display: "flex",
          justifyContent: "flex-end",
          gap: 2,
        }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{ minWidth: 120, height: 48 }}
        >
          {t("purchaseReceptionPage.customerCopy.cancel")}
        </Button>
        <Button
          variant="contained"
          onClick={onClose}
          sx={{ minWidth: 120, height: 48, fontWeight: 700 }}
        >
          {t("purchaseReceptionPage.customerCopy.run")}
        </Button>
      </Box>
    </Dialog>
  );
}

function PurchaseReceptionContent() {
  const { t } = useTranslation();
  const { openWizard, isWizardOpen, screen, goTo, closeWizard } =
    useReception();
  const { openBuyback } = useBuyback();
  const [showCustomerCopy, setShowCustomerCopy] = useState(false);
  const isStaffScreen =
    isWizardOpen && (screen === "staff-confirm" || screen === "device-check");

  useLayoutConfig({
    title: isStaffScreen
      ? t("purchaseReceptionPage.title.staffConfirm")
      : t("purchaseReceptionPage.title.main"),
    showBackButton: isStaffScreen,
    onBack: isStaffScreen
      ? () => {
          if (screen === "device-check") {
            goTo("staff-confirm");
            return;
          }
          closeWizard();
        }
      : undefined,
  });

  if (isStaffScreen) return null;

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 3,
          p: 1,
          alignContent: "start",
        }}
      >
        <Card
          variant="outlined"
          sx={{
            aspectRatio: "16 / 9",
            borderRadius: 2,
            borderColor: "divider",
          }}
        >
          <CardActionArea
            onClick={openWizard}
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
            }}
          >
            <BuybackReceptionIcon
              sx={{ fontSize: 76, color: "primary.main" }}
            />
            <Typography variant="body1" sx={{ fontWeight: 700 }}>
              {t("purchaseReceptionPage.card.reception")}
            </Typography>
          </CardActionArea>
        </Card>

        <Badge
          badgeContent={3}
          color="error"
          sx={{
            "& .MuiBadge-badge": {
              top: 12,
              right: 12,
              fontSize: 14,
              width: 24,
              height: 24,
              borderRadius: "50%",
            },
          }}
        >
          <Card
            variant="outlined"
            sx={{
              width: "100%",
              aspectRatio: "16 / 9",
              borderRadius: 2,
              borderColor: "primary.light",
              borderWidth: 2,
            }}
          >
            <CardActionArea
              onClick={openBuyback}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
              }}
            >
              <QuotationAgreementIcon
                sx={{ fontSize: 76, color: "primary.main" }}
              />
              <Typography variant="body1" sx={{ fontWeight: 700 }}>
                {t("purchaseReceptionPage.card.quotationAgreement")}
              </Typography>
            </CardActionArea>
          </Card>
        </Badge>
      </Box>

      <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={() => setShowCustomerCopy(true)}
          sx={{ minWidth: 180, height: 48 }}
        >
          {t("purchaseReceptionPage.customerCopy.button")}
        </Button>
      </Box>

      <CustomerCopyModal
        open={showCustomerCopy}
        onClose={() => setShowCustomerCopy(false)}
      />
    </Box>
  );
}
