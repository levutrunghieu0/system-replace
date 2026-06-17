import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useTranslation } from "react-i18next";

import type { FailedReasonCategory, FailedSearchCriteria } from "../types";
import { FAILED_REASON_CATEGORIES } from "../utils/failedSearchRules";

interface FailedSearchFilterPanelProps {
  criteria: FailedSearchCriteria;
  searching: boolean;
  onChange: (patch: Partial<FailedSearchCriteria>) => void;
  onSearch: () => void;
  onReset: () => void;
}

const fieldSx = { bgcolor: "background.paper" };

export function FailedSearchFilterPanel({
  criteria,
  searching,
  onChange,
  onSearch,
  onReset,
}: FailedSearchFilterPanelProps) {
  const { t } = useTranslation();

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
        {t("page.purchase.failedSearch.filter.title")}
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(4, minmax(0, 1fr))",
          },
          gap: 1.5,
        }}
      >
        {/* Cancellation date range — defaults to today */}
        <TextField
          size="small"
          type="date"
          label={t("page.purchase.failedSearch.filter.cancelledFrom")}
          value={criteria.cancelledFrom}
          onChange={(e) => onChange({ cancelledFrom: e.target.value })}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={fieldSx}
        />
        <TextField
          size="small"
          type="date"
          label={t("page.purchase.failedSearch.filter.cancelledTo")}
          value={criteria.cancelledTo}
          onChange={(e) => onChange({ cancelledTo: e.target.value })}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={fieldSx}
        />

        {/* Customer name: matches Kanji and Kana */}
        <TextField
          size="small"
          label={t("page.purchase.failedSearch.filter.customerName")}
          placeholder={t(
            "page.purchase.failedSearch.filter.customerNamePlaceholder",
          )}
          value={criteria.customerName}
          onChange={(e) => onChange({ customerName: e.target.value })}
          sx={fieldSx}
        />

        {/* Phone: exact or trailing digits */}
        <TextField
          size="small"
          label={t("page.purchase.failedSearch.filter.phoneNumber")}
          placeholder={t(
            "page.purchase.failedSearch.filter.phoneNumberPlaceholder",
          )}
          value={criteria.phoneNumber}
          onChange={(e) => onChange({ phoneNumber: e.target.value })}
          slotProps={{ htmlInput: { inputMode: "numeric" } }}
          sx={fieldSx}
        />

        <TextField
          size="small"
          label={t("page.purchase.failedSearch.filter.receiptNumber")}
          placeholder={t(
            "page.purchase.failedSearch.filter.receiptNumberPlaceholder",
          )}
          value={criteria.receiptNumber}
          onChange={(e) => onChange({ receiptNumber: e.target.value })}
          sx={fieldSx}
        />

        <TextField
          size="small"
          select
          label={t("page.purchase.failedSearch.filter.failedReason")}
          value={criteria.failedReason}
          onChange={(e) =>
            onChange({
              failedReason: e.target.value as FailedReasonCategory | "",
            })
          }
          sx={fieldSx}
        >
          <MenuItem value="">
            {t("page.purchase.failedSearch.filter.allReasons")}
          </MenuItem>
          {FAILED_REASON_CATEGORIES.map((reason) => (
            <MenuItem key={reason} value={reason}>
              {t(`page.purchase.failedSearch.reason.${reason}`)}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          size="small"
          label={t("page.purchase.failedSearch.filter.staffCode")}
          placeholder={t(
            "page.purchase.failedSearch.filter.staffCodePlaceholder",
          )}
          value={criteria.staffCode}
          onChange={(e) => onChange({ staffCode: e.target.value })}
          sx={fieldSx}
        />

        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={onSearch}
            disabled={searching}
            sx={{ flex: 1, minWidth: 0 }}
          >
            {t("page.purchase.failedSearch.filter.search")}
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<RestartAltIcon />}
            onClick={onReset}
            sx={{ flexShrink: 0 }}
          >
            {t("page.purchase.failedSearch.filter.reset")}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
