import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import Tooltip from "@mui/material/Tooltip";

import { MOCK_PURCHASE_LIST } from "../features/buy-back/api/buyBackApi";
import { PurchaseStatusChip } from "../features/buy-back/components/PurchaseStatusChip";
import type { PurchaseEntry } from "../features/buy-back/types";
import { useLayoutConfig } from "../hooks/useLayoutConfig";

export const Route = createFileRoute("/purchase/reception-ticket-reissue")({
  component: CustomerTicketReissueRoute,
});

const inputSx = {
  bgcolor: "background.paper",
};

const dateInputSx = {
  ...inputSx,
  minWidth: 0,
  "& .MuiInputBase-input": {
    textAlign: "center",
  },
};

const normalizePhone = (value?: string | null) =>
  (value ?? "").replace(/\D/g, "");

function CustomerTicketReissueRoute() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [birthdayYear, setBirthdayYear] = useState("");
  const [birthdayMonth, setBirthdayMonth] = useState("");
  const [birthdayDay, setBirthdayDay] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [hasNoPhoneNumber, setHasNoPhoneNumber] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errors, setErrors] = useState<{ birthday?: string; phone?: string }>(
    {},
  );
  const [results, setResults] = useState<PurchaseEntry[]>([]);
  const [printTarget, setPrintTarget] = useState<PurchaseEntry | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useLayoutConfig({ title: t("page.purchase.customerTicketReissue.title") });

  const birthday = useMemo(() => {
    if (!birthdayYear || !birthdayMonth || !birthdayDay) return "";

    return `${birthdayYear.padStart(4, "0")}-${birthdayMonth.padStart(
      2,
      "0",
    )}-${birthdayDay.padStart(2, "0")}`;
  }, [birthdayDay, birthdayMonth, birthdayYear]);

  const resetSearchState = () => {
    setSearched(false);
    setResults([]);
  };

  const handleSearch = () => {
    const nextErrors: { birthday?: string; phone?: string } = {};

    if (!birthday) {
      nextErrors.birthday = t(
        "page.purchase.customerTicketReissue.validation.birthdayRequired",
      );
    }

    if (!hasNoPhoneNumber && !phoneNumber.trim()) {
      nextErrors.phone = t(
        "page.purchase.customerTicketReissue.validation.phoneRequired",
      );
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setSearched(false);
      setResults([]);
      return;
    }

    const normalizedInputPhone = normalizePhone(phoneNumber);

    const matchedRows = MOCK_PURCHASE_LIST.filter((entry) => {
      if (entry.status === "cancelled") return false;
      if (entry.customerBirthday !== birthday) return false;

      if (hasNoPhoneNumber) {
        return !entry.customerPhone;
      }

      return normalizePhone(entry.customerPhone) === normalizedInputPhone;
    });

    // Prototype/demo behavior:
    // Always show at least one selectable result after a valid search so the
    // customer ticket reissue flow can be reviewed even when mock data does not
    // match the entered customer information.
    const fallbackRows = MOCK_PURCHASE_LIST.filter(
      (entry) => entry.status !== "cancelled",
    ).slice(0, 3);

    setResults(matchedRows.length > 0 ? matchedRows : fallbackRows);
    setSearched(true);
  };

  const handlePrintConfirm = () => {
    setPrintTarget(null);
    setToast(t("page.purchase.customerTicketReissue.toast.printed"));
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: "grey.50",
      }}
    >
      <Box sx={{ px: 1, py: 1.25 }}>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {t("page.purchase.customerTicketReissue.instruction")}
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: "auto",
          px: 2,
          py: 2,
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: searched ? 1180 : 520,
            mx: "auto",
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: searched ? "400px minmax(0, 1fr)" : "minmax(360px, 520px)",
            },
            justifyContent: "center",
            alignItems: "stretch",
            gap: 2,
            transition:
              "max-width 260ms ease, grid-template-columns 260ms ease",
          }}
        >
          <CustomerVerificationForm
            birthdayYear={birthdayYear}
            birthdayMonth={birthdayMonth}
            birthdayDay={birthdayDay}
            phoneNumber={phoneNumber}
            hasNoPhoneNumber={hasNoPhoneNumber}
            errors={errors}
            onBirthdayYearChange={(value) => {
              setBirthdayYear(value);
              resetSearchState();
            }}
            onBirthdayMonthChange={(value) => {
              setBirthdayMonth(value);
              resetSearchState();
            }}
            onBirthdayDayChange={(value) => {
              setBirthdayDay(value);
              resetSearchState();
            }}
            onPhoneNumberChange={(value) => {
              setPhoneNumber(value);
              resetSearchState();
            }}
            onHasNoPhoneNumberChange={(checked) => {
              setHasNoPhoneNumber(checked);
              if (checked) setPhoneNumber("");
              resetSearchState();
            }}
          />

          {searched && (
            <CustomerMatchedResultPanel
              results={results}
              onPrint={(entry) => setPrintTarget(entry)}
            />
          )}
        </Box>
      </Box>

      <Divider />
      <Box
        sx={{
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          bgcolor: "background.paper",
        }}
      >
        <Button
          variant="contained"
          color="inherit"
          onClick={() => navigate({ to: "/purchase" })}
          sx={{ minWidth: 112 }}
        >
          {t("page.purchase.customerTicketReissue.cancel")}
        </Button>
        <Button
          variant="contained"
          onClick={handleSearch}
          sx={{ minWidth: 112 }}
        >
          {t("page.purchase.customerTicketReissue.search")}
        </Button>
      </Box>

      <Dialog
        open={Boolean(printTarget)}
        onClose={() => setPrintTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {t("page.purchase.customerTicketReissue.confirm.title")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("page.purchase.customerTicketReissue.confirm.message", {
              receiptNumber: printTarget?.receiptNumber ?? "",
            })}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button color="inherit" onClick={() => setPrintTarget(null)}>
            {t("common.cancel")}
          </Button>
          <Button variant="contained" onClick={handlePrintConfirm}>
            {t("page.purchase.customerTicketReissue.confirm.print")}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={3500}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert severity="success" onClose={() => setToast(null)}>
          {toast}
        </Alert>
      </Snackbar>
    </Box>
  );
}

interface CustomerVerificationFormProps {
  birthdayYear: string;
  birthdayMonth: string;
  birthdayDay: string;
  phoneNumber: string;
  hasNoPhoneNumber: boolean;
  errors: { birthday?: string; phone?: string };
  onBirthdayYearChange: (value: string) => void;
  onBirthdayMonthChange: (value: string) => void;
  onBirthdayDayChange: (value: string) => void;
  onPhoneNumberChange: (value: string) => void;
  onHasNoPhoneNumberChange: (checked: boolean) => void;
}

function CustomerVerificationForm({
  birthdayYear,
  birthdayMonth,
  birthdayDay,
  phoneNumber,
  hasNoPhoneNumber,
  errors,
  onBirthdayYearChange,
  onBirthdayMonthChange,
  onBirthdayDayChange,
  onPhoneNumberChange,
  onHasNoPhoneNumberChange,
}: CustomerVerificationFormProps) {
  const { t } = useTranslation();

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2.5,
        bgcolor: "background.paper",
        height: "100%",
        minHeight: { xs: 0, md: 430 },
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
          {t("page.purchase.customerTicketReissue.customerInfoTitle")}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {t("page.purchase.customerTicketReissue.customerInfoHint")}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.25 }}>
        <Box>
          <Typography
            variant="caption"
            sx={{ display: "block", fontWeight: 700, mb: 0.75 }}
          >
            {t("page.purchase.customerTicketReissue.birthday")}
            <Typography
              component="span"
              variant="caption"
              color="error.main"
              sx={{ ml: 0.5 }}
            >
              {t("page.purchase.customerTicketReissue.required")}
            </Typography>
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 1.25,
              width: "100%",
            }}
          >
            <TextField
              size="small"
              value={birthdayYear}
              onChange={(event) =>
                onBirthdayYearChange(
                  event.target.value.replace(/\D/g, "").slice(0, 4),
                )
              }
              placeholder={t("page.purchase.customerTicketReissue.year")}
              error={Boolean(errors.birthday)}
              slotProps={{
                htmlInput: {
                  inputMode: "numeric",
                },
              }}
              sx={dateInputSx}
            />
            <TextField
              size="small"
              value={birthdayMonth}
              onChange={(event) =>
                onBirthdayMonthChange(
                  event.target.value.replace(/\D/g, "").slice(0, 2),
                )
              }
              placeholder={t("page.purchase.customerTicketReissue.month")}
              error={Boolean(errors.birthday)}
              slotProps={{
                htmlInput: {
                  inputMode: "numeric",
                },
              }}
              sx={dateInputSx}
            />
            <TextField
              size="small"
              value={birthdayDay}
              onChange={(event) =>
                onBirthdayDayChange(
                  event.target.value.replace(/\D/g, "").slice(0, 2),
                )
              }
              placeholder={t("page.purchase.customerTicketReissue.day")}
              error={Boolean(errors.birthday)}
              slotProps={{
                htmlInput: {
                  inputMode: "numeric",
                },
              }}
              sx={dateInputSx}
            />
          </Box>
          {errors.birthday && (
            <Typography
              variant="caption"
              color="error.main"
              sx={{ mt: 0.5, display: "block" }}
            >
              {errors.birthday}
            </Typography>
          )}
        </Box>

        <Box>
          <Typography
            variant="caption"
            sx={{ display: "block", fontWeight: 700, mb: 0.75 }}
          >
            {t("page.purchase.customerTicketReissue.phoneNumber")}
          </Typography>
          <TextField
            size="small"
            fullWidth
            disabled={hasNoPhoneNumber}
            value={phoneNumber}
            onChange={(event) => onPhoneNumberChange(event.target.value)}
            placeholder={t(
              "page.purchase.customerTicketReissue.phonePlaceholder",
            )}
            error={Boolean(errors.phone)}
            sx={inputSx}
          />
          {errors.phone && (
            <Typography
              variant="caption"
              color="error.main"
              sx={{ mt: 0.5, display: "block" }}
            >
              {errors.phone}
            </Typography>
          )}
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={hasNoPhoneNumber}
                onChange={(event) =>
                  onHasNoPhoneNumberChange(event.target.checked)
                }
              />
            }
            label={
              <Typography variant="caption">
                {t("page.purchase.customerTicketReissue.noPhoneNumber")}
              </Typography>
            }
          />
        </Box>
      </Box>

      <Box
        sx={{
          mt: "auto",
          pt: 2,
          borderTop: "1px dashed",
          borderColor: "divider",
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {t("page.purchase.customerTicketReissue.customerInfoNote")}
        </Typography>
      </Box>
    </Paper>
  );
}

interface CustomerMatchedResultPanelProps {
  results: PurchaseEntry[];
  onPrint: (entry: PurchaseEntry) => void;
}

function CustomerMatchedResultPanel({
  results,
  onPrint,
}: CustomerMatchedResultPanelProps) {
  const { t } = useTranslation();

  if (results.length === 0) {
    return (
      <Paper
        variant="outlined"
        sx={{
          height: "100%",
          minHeight: { xs: 260, md: 430 },
          borderRadius: 2.5,
          bgcolor: "background.paper",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
        }}
      >
        <Box sx={{ maxWidth: 480, textAlign: "center" }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            {t("page.purchase.customerTicketReissue.noResultTitle")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            {t("page.purchase.customerTicketReissue.noResult")}
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        width: "100%",
        height: "100%",
        minHeight: { xs: 360, md: 430 },
        borderRadius: 2.5,
        overflow: "hidden",
        bgcolor: "background.paper",
        display: "flex",
        flexDirection: "column",
        animation: "fadeSlideUp 260ms ease",
        "@keyframes fadeSlideUp": {
          from: {
            opacity: 0,
            transform: "translateY(12px)",
          },
          to: {
            opacity: 1,
            transform: "translateY(0)",
          },
        },
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.5,
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          flexDirection: { xs: "column", sm: "row" },
          gap: 1,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
            {t("page.purchase.customerTicketReissue.resultTitle")}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t("page.purchase.customerTicketReissue.selectToPrintHint")}
          </Typography>
        </Box>

        <Box
          sx={{
            px: 1.25,
            py: 0.5,
            borderRadius: 999,
            bgcolor: "grey.100",
            border: "1px solid",
            borderColor: "divider",
            flexShrink: 0,
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 900 }}>
            {t("page.purchase.customerTicketReissue.resultCount", {
              count: results.length,
            })}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          px: 1.25,
          py: 1.25,
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          bgcolor: "grey.50",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {results.map((entry) => (
            <MatchedTicketCard
              key={entry.id}
              entry={entry}
              onPrint={() => onPrint(entry)}
            />
          ))}
        </Box>
      </Box>
    </Paper>
  );
}

interface MatchedTicketCardProps {
  entry: PurchaseEntry;
  onPrint: () => void;
}

function MatchedTicketCard({ entry, onPrint }: MatchedTicketCardProps) {
  const { t } = useTranslation();

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.25,
        borderRadius: 2,
        bgcolor: "background.paper",
        borderColor: "divider",
        transition:
          "border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease",
        "&:hover": {
          borderColor: "primary.light",
          boxShadow: "0 8px 20px rgba(15, 23, 42, 0.08)",
          transform: "translateY(-1px)",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 1.25,
          mb: 1,
        }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", lineHeight: 1.1 }}
          >
            {t("page.purchase.customerTicketReissue.result.receiptNumber")}
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 900,
              fontFamily: "monospace",
              lineHeight: 1.15,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {entry.receiptNumber}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            flexShrink: 0,
          }}
        >
          <PurchaseStatusChip status={entry.status} />
          <Tooltip
            title={t("page.purchase.customerTicketReissue.result.reissue")}
          >
            <IconButton
              color="primary"
              onClick={onPrint}
              size="small"
              sx={{
                width: 34,
                height: 34,
                borderRadius: 1.25,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                boxShadow: "none",
                "&:hover": {
                  bgcolor: "primary.dark",
                  boxShadow: "none",
                },
              }}
            >
              <PrintOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(4, minmax(0, 1fr))",
          },
          gap: 0.75,
        }}
      >
        <InfoMeta
          label={t("page.purchase.customerTicketReissue.result.receivedAt")}
          value={entry.receivedAt}
        />
        <InfoMeta
          label={t("page.purchase.customerTicketReissue.result.storeName")}
          value={entry.storeName}
        />
        <InfoMeta
          label={t("page.purchase.customerTicketReissue.result.content")}
          value={entry.content}
        />
        <InfoMeta
          label={t("page.purchase.list.col.assignedEmployee")}
          value={entry.assignedEmployee}
        />
      </Box>
    </Paper>
  );
}

interface InfoMetaProps {
  label: string;
  value?: string | null;
}

function InfoMeta({ label, value }: InfoMetaProps) {
  return (
    <Box
      sx={{
        minWidth: 0,
        px: 1,
        py: 0.75,
        borderRadius: 1.5,
        bgcolor: "grey.50",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          display: "block",
          mb: 0.25,
          lineHeight: 1.2,
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          display: "block",
          fontWeight: 800,
          color: "text.primary",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          lineHeight: 1.35,
        }}
      >
        {value || "-"}
      </Typography>
    </Box>
  );
}
