import { useState, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import PrintIcon from "@mui/icons-material/Print";
import RemoveIcon from "@mui/icons-material/Remove";
import { useTranslation } from "react-i18next";
import { useReception } from "../../context/ReceptionContext";
import type { BagHandling } from "../../types";

const RECEPTION_NUMBER = Math.floor(Math.random() * 20 + 1);

const STAFF_ITEM_ROWS = [
  "スマートフォン/タブレット",
  "パソコン",
  "スマートウォッチ",
  "AirPods",
  "自転車",
];

const ITEM_CATEGORY_LABEL_KEYS: Record<string, string> = {
  "スマートフォン/タブレット": "smartphoneTablet",
  パソコン: "computer",
  スマートウォッチ: "smartWatch",
  AirPods: "airPods",
  自転車: "bicycle",
};

const BAG_HANDLING_LABEL_KEYS: Record<BagHandling, string> = {
  return: "return",
  assessment: "assessment",
  excluded: "excluded",
};

function ReceiptIssuedModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [countdown, setCountdown] = useState(30);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!open) return;

    timerRef.current = setInterval(() => {
      setCountdown((current) => {
        if (current <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }

          queueMicrotask(onClose);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [open, onClose]);

  return (
    <Dialog
      open={open}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 2, textAlign: "center" } } }}
    >
      <DialogContent sx={{ py: 4, px: 4 }}>
        <PrintIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />

        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
          {t("purchaseReceptionWizard.staff.receiptModal.title")}
        </Typography>

        <Box
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            py: 1.5,
            px: 3,
            mb: 2,
            display: "inline-block",
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {t("purchaseReceptionWizard.staff.receiptModal.receptionNumber", {
              number: RECEPTION_NUMBER,
            })}
          </Typography>
        </Box>

        <Typography variant="body1" sx={{ fontWeight: 700, mb: 1 }}>
          {t("purchaseReceptionWizard.staff.receiptModal.returnTablet")}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {t("purchaseReceptionWizard.staff.receiptModal.autoReturn")}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t("purchaseReceptionWizard.staff.receiptModal.scanStaff")}
        </Typography>

        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            color: countdown <= 10 ? "error.main" : "text.primary",
          }}
        >
          {countdown}
        </Typography>
      </DialogContent>
    </Dialog>
  );
}

export function StaffConfirmScreen() {
  const { t } = useTranslation();
  const {
    form,
    staffForm,
    updateStaffForm,
    setBagHandling,
    openDeviceCheck,
    closeWizard,
  } = useReception();

  const [showReceipt, setShowReceipt] = useState(false);

  const smsLabelKey =
    form.smsCapable === "yes"
      ? "canSend"
      : form.smsCapable === "no"
        ? "cannotSend"
        : "testDelivery";

  const smsColor =
    form.smsCapable === "yes"
      ? "success"
      : form.smsCapable === "no"
        ? "error"
        : "success";

  const handleRegister = () => {
    setShowReceipt(true);
  };

  const handleReceiptClose = () => {
    setShowReceipt(false);
    closeWizard();
  };

  const getItemLabel = (category: string) => {
    const key = ITEM_CATEGORY_LABEL_KEYS[category];
    return key ? t(`purchaseReceptionWizard.staff.item.${key}`) : category;
  };

  const isItemSelected = (category: string) => {
    if (form.itemCategories.includes(category)) return true;

    if (category === "スマートフォン/タブレット") {
      return (
        form.itemCategories.includes("携帯電話") ||
        form.itemCategories.includes("タブレット") ||
        form.itemCategories.includes("Apple製品") ||
        form.itemCategories.includes("スマートウォッチ")
      );
    }

    return false;
  };

  const getItemCheck = (category: string) => {
    return staffForm.deviceChecks[category];
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box sx={{ flex: 1, overflowY: "auto", px: 2, py: 1 }}>
        <Box component="section" sx={{ mb: 1.25 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
            {t("purchaseReceptionWizard.staff.section.items")}
          </Typography>

          <Box
            sx={{
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box
              sx={{
                minHeight: 34,
                display: "grid",
                gridTemplateColumns: "160px 1fr 120px 120px 120px",
                alignItems: "center",
                px: 1.5,
                color: "text.secondary",
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                {t("purchaseReceptionWizard.staff.column.status")}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                {t("purchaseReceptionWizard.staff.column.summary")}
              </Typography>
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, textAlign: "center" }}
              >
                {t("purchaseReceptionWizard.staff.column.confirm")}
              </Typography>
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, textAlign: "center" }}
              >
                {t("purchaseReceptionWizard.staff.column.confirmResult")}
              </Typography>
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, textAlign: "right" }}
              >
                {t("purchaseReceptionWizard.staff.column.assessmentCount")}
              </Typography>
            </Box>

            {STAFF_ITEM_ROWS.map((category) => {
              const check = getItemCheck(category);
              const selected = isItemSelected(category);
              const done = Boolean(check?.done);
              const count = done ? check?.count || 1 : selected ? 1 : 0;

              return (
                <Box
                  key={category}
                  sx={{
                    minHeight: 42,
                    display: "grid",
                    gridTemplateColumns: "160px 1fr 120px 120px 120px",
                    alignItems: "center",
                    px: 1.5,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {getItemLabel(category)}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    {selected ? getItemLabel(category) : ""}
                  </Typography>

                  <Box sx={{ textAlign: "center" }}>
                    {selected ? (
                      <Button
                        variant="text"
                        size="small"
                        disableElevation
                        onClick={() => openDeviceCheck(category)}
                        sx={{
                          minWidth: 76,
                          height: 28,
                          px: 1.5,
                          borderRadius: 999,
                          fontWeight: 700,
                          fontSize: "0.75rem",
                          lineHeight: 1,
                          whiteSpace: "nowrap",
                          color: done ? "primary.main" : "primary.contrastText",
                          bgcolor: done ? "primary.50" : "primary.main",
                          border: "1px solid",
                          borderColor: done ? "primary.light" : "primary.main",
                          boxShadow: "none",
                          "&:hover": {
                            bgcolor: done ? "primary.100" : "primary.dark",
                            borderColor: done ? "primary.main" : "primary.dark",
                            boxShadow: "none",
                          },
                        }}
                      >
                        {done
                          ? t("purchaseReceptionWizard.staff.action.reconfirm")
                          : t(
                              "purchaseReceptionWizard.staff.action.startConfirm",
                            )}
                      </Button>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        {t("purchaseReceptionWizard.common.hyphen")}
                      </Typography>
                    )}
                  </Box>

                  <Typography
                    variant="body2"
                    sx={{
                      textAlign: "center",
                      color: done ? "primary.main" : "text.secondary",
                      fontWeight: done ? 700 : 400,
                    }}
                  >
                    {done
                      ? t("purchaseReceptionWizard.staff.status.done")
                      : selected
                        ? t("purchaseReceptionWizard.staff.status.notYet")
                        : t("purchaseReceptionWizard.common.hyphen")}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{ textAlign: "right", fontWeight: 700 }}
                  >
                    {count > 0
                      ? t("purchaseReceptionWizard.staff.assessmentCount", {
                          count,
                        })
                      : ""}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>

        <Box
          component="section"
          sx={{
            minHeight: 44,
            display: "grid",
            gridTemplateColumns: "1fr auto",
            alignItems: "center",
            gap: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {t("purchaseReceptionWizard.staff.section.bag")}
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 96px)",
              gap: 1,
            }}
          >
            {(["return", "assessment", "excluded"] as BagHandling[]).map(
              (value) => (
                <Button
                  key={value}
                  variant={
                    staffForm.bagHandling === value ? "contained" : "outlined"
                  }
                  color={
                    staffForm.bagHandling === value ? "primary" : "inherit"
                  }
                  onClick={() => setBagHandling(value)}
                  size="small"
                  sx={{
                    minWidth: 96,
                    height: 34,
                    fontWeight: 700,
                  }}
                >
                  {t(
                    `purchaseReceptionWizard.staff.bag.${BAG_HANDLING_LABEL_KEYS[value]}`,
                  )}
                </Button>
              ),
            )}
          </Box>
        </Box>

        <Box
          component="section"
          sx={{
            minHeight: 44,
            display: "grid",
            gridTemplateColumns: "160px auto 1fr",
            alignItems: "center",
            gap: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {t("purchaseReceptionWizard.staff.section.branchCount")}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              size="small"
              aria-label={t("purchaseReceptionWizard.common.decrease")}
              onClick={() =>
                updateStaffForm({
                  branchCount: Math.max(1, staffForm.branchCount - 1),
                })
              }
              sx={{
                width: 28,
                height: 28,
                borderRadius: 0.5,
              }}
            >
              <RemoveIcon sx={{ fontSize: 18 }} />
            </IconButton>

            <Box
              sx={{
                width: 56,
                height: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "common.white",
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {staffForm.branchCount}
              </Typography>
            </Box>

            <IconButton
              size="small"
              aria-label={t("purchaseReceptionWizard.common.increase")}
              onClick={() =>
                updateStaffForm({ branchCount: staffForm.branchCount + 1 })
              }
              sx={{
                width: 28,
                height: 28,
                borderRadius: 0.5,
              }}
            >
              <AddIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          <Box />
        </Box>

        <Box
          component="section"
          sx={{
            minHeight: 140,
            display: "grid",
            gridTemplateColumns: "160px 1fr auto",
            alignItems: "flex-start",
            columnGap: 3,
            pt: 1.25,
            pb: 1.5,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {t("purchaseReceptionWizard.staff.section.sms")}
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Chip
              label={t("purchaseReceptionWizard.staff.smsChip", {
                label: t(`purchaseReceptionWizard.staff.sms.${smsLabelKey}`),
              })}
              color={smsColor as "success" | "error" | "warning"}
              variant="outlined"
              size="small"
              sx={{
                width: "fit-content",
                height: 24,
                fontWeight: 700,
                bgcolor: "common.white",
              }}
            />

            <Box sx={{ textAlign: "left" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                {t("purchaseReceptionWizard.staff.smsGuide.title")}
              </Typography>
              <Typography variant="body2">
                {t("purchaseReceptionWizard.staff.smsGuide.line1")}
              </Typography>
              <Typography variant="body2">
                {t("purchaseReceptionWizard.staff.smsGuide.line2")}
              </Typography>
              <Typography variant="body2">
                {t("purchaseReceptionWizard.staff.smsGuide.line3")}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              minWidth: 130,
              alignSelf: "center",
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {t("purchaseReceptionWizard.staff.waitingAssessment")}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 700 }}>
              {t("purchaseReceptionWizard.staff.waitingAssessmentCount", {
                count: 3,
              })}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          p: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Button
          variant="contained"
          size="large"
          onClick={handleRegister}
          sx={{ minWidth: 220, height: 52, fontSize: "1rem", fontWeight: 700 }}
        >
          {t("purchaseReceptionWizard.staff.action.completeRegistration")}
        </Button>
      </Box>

      {showReceipt && (
        <ReceiptIssuedModal open={showReceipt} onClose={handleReceiptClose} />
      )}
    </Box>
  );
}
