import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import { useLayoutConfig } from "../hooks/useLayoutConfig";
import { useAppSettings } from "../contexts/AppSettingsContext";
import { failedSearchApi } from "../features/buy-back/api/failedSearchApi";
import { FailedSearchFilterPanel } from "../features/buy-back/components/FailedSearchFilterPanel";
import { FailedSearchResultTable } from "../features/buy-back/components/FailedSearchResultTable";
import { FailedTransactionDetailDialog } from "../features/buy-back/components/FailedTransactionDetailDialog";
import { canAccessFailedSearch } from "../features/buy-back/utils/failedSearchRules";
import type {
  FailedSearchCriteria,
  FailedTransaction,
} from "../features/buy-back/types";

export const Route = createFileRoute("/purchase/failed-search")({
  component: FailedSearchRoute,
});

const todayIso = () => new Date().toISOString().slice(0, 10);

// E-52: cancellation date range defaults to the current day.
const createDefaultCriteria = (): FailedSearchCriteria => ({
  cancelledFrom: todayIso(),
  cancelledTo: todayIso(),
  customerName: "",
  phoneNumber: "",
  receiptNumber: "",
  failedReason: "",
  staffCode: "",
});

function FailedSearchRoute() {
  const { t } = useTranslation();
  const { userRole } = useAppSettings();

  useLayoutConfig({ title: t("page.purchase.failedSearch.title") });

  // E-52 Rule 1: regular staff accounts must not see this screen's content.
  if (!canAccessFailedSearch(userRole)) {
    return <AccessDeniedPanel />;
  }

  return <FailedSearchPage />;
}

function FailedSearchPage() {
  const { t } = useTranslation();

  const [criteria, setCriteria] = useState<FailedSearchCriteria>(
    createDefaultCriteria,
  );
  const [rows, setRows] = useState<FailedTransaction[]>([]);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [detailTarget, setDetailTarget] = useState<FailedTransaction | null>(
    null,
  );

  const runSearch = useCallback(async (current: FailedSearchCriteria) => {
    setSearching(true);
    try {
      const result = await failedSearchApi.searchFailedTransactions(current);
      setRows(result);
      setSearched(true);
    } finally {
      setSearching(false);
    }
  }, []);

  // Cancelled receptions are synced in real time; show today's list on entry.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void runSearch(createDefaultCriteria());
  }, [runSearch]);

  const handleCriteriaChange = useCallback(
    (patch: Partial<FailedSearchCriteria>) => {
      setCriteria((current) => ({ ...current, ...patch }));
    },
    [],
  );

  const handleReset = useCallback(() => {
    const defaults = createDefaultCriteria();
    setCriteria(defaults);
    void runSearch(defaults);
  }, [runSearch]);

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", gap: 1.5, height: "100%" }}
    >
      <FailedSearchFilterPanel
        criteria={criteria}
        searching={searching}
        onChange={handleCriteriaChange}
        onSearch={() => void runSearch(criteria)}
        onReset={handleReset}
      />

      <Box
        sx={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          px: 0.5,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
          {t("page.purchase.failedSearch.resultTitle")}
        </Typography>
        {searched && (
          <Typography variant="caption" color="text.secondary">
            {t("page.purchase.failedSearch.resultCount", {
              count: rows.length,
            })}
          </Typography>
        )}
      </Box>

      {/* E-52 Rule 2: history lookup only — rows cannot be edited */}
      <Box sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        <FailedSearchResultTable
          rows={rows}
          searched={searched}
          onShowDetail={setDetailTarget}
        />
      </Box>

      <FailedTransactionDetailDialog
        transaction={detailTarget}
        onClose={() => setDetailTarget(null)}
      />
    </Box>
  );
}

function AccessDeniedPanel() {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          p: 4,
          borderRadius: 2.5,
          maxWidth: 420,
          textAlign: "center",
        }}
      >
        <LockOutlinedIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
          {t("page.purchase.failedSearch.accessDenied.title")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
          {t("page.purchase.failedSearch.accessDenied.message")}
        </Typography>
      </Paper>
    </Box>
  );
}
