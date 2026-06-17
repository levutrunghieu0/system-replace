import { useCallback, useMemo, useState } from "react";
import {
  createFileRoute,
  Outlet,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import OutlinedInput from "@mui/material/OutlinedInput";
import Snackbar from "@mui/material/Snackbar";
import Typography from "@mui/material/Typography";
import SearchIcon from "@mui/icons-material/Search";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import DevicesOutlinedIcon from "@mui/icons-material/DevicesOutlined";

import { useLayoutConfig } from "../hooks/useLayoutConfig";
import {
  buyBackApi,
  MOCK_PURCHASE_LIST,
} from "../features/buy-back/api/buyBackApi";
import { BranchLabelDialog } from "../features/buy-back/components/BranchLabelDialog";
import { CashDrawerDialog } from "../features/buy-back/components/CashDrawerDialog";
import { PurchaseCancelDialog } from "../features/buy-back/components/PurchaseCancelDialog";
import { PurchaseListBottomBar } from "../features/buy-back/components/PurchaseListBottomBar";
import { PurchaseListFilterBar } from "../features/buy-back/components/PurchaseListFilterBar";
import { PurchaseListTable } from "../features/buy-back/components/PurchaseListTable";
import { SmsStopDialog } from "../features/buy-back/components/SmsStopDialog";
import { StoreCopyDialog } from "../features/buy-back/components/StoreCopyDialog";
import type {
  PurchaseEntry,
  PurchaseListDialogType,
  StoreCopyReissuePayload,
} from "../features/buy-back/types";
import { PhoneNumberDialog } from "../features/buy-back/components/PhoneNumberDialog";

export const Route = createFileRoute("/purchase")({
  component: PurchaseLayoutRoute,
});

function PurchaseLayoutRoute() {
  const { location } = useRouterState();
  const isExact =
    location.pathname === "/purchase" || location.pathname === "/purchase/";

  if (!isExact) return <Outlet />;

  return <PurchaseListPage />;
}

const OPENABLE_ASSESSMENT_STATUSES = ["awaiting", "saved"] as const;

function isOpenableAssessmentStatus(status: PurchaseEntry["status"]) {
  return OPENABLE_ASSESSMENT_STATUSES.includes(
    status as (typeof OPENABLE_ASSESSMENT_STATUSES)[number],
  );
}

function PurchaseListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [rows, setRows] = useState<PurchaseEntry[]>(MOCK_PURCHASE_LIST);
  const [search, setSearch] = useState("");
  const [activeDialog, setActiveDialog] =
    useState<PurchaseListDialogType>(null);
  const [selectedEntry, setSelectedEntry] = useState<PurchaseEntry | null>(
    null,
  );
  const [selectedRow, setSelectedRow] = useState<PurchaseEntry | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isReissueConfirmOpen, setIsReissueConfirmOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useLayoutConfig({ title: t("page.purchase.list.title") });

  const filteredRows = useMemo(
    () =>
      rows.filter(
        (row) =>
          !search ||
          row.receiptNumber.includes(search) ||
          row.content.includes(search) ||
          row.assignedEmployee.includes(search),
      ),
    [rows, search],
  );

  const assessingCount = useMemo(
    () =>
      rows.filter((row) => row.status === "awaiting" || row.status === "saved")
        .length,
    [rows],
  );

  const closeDialog = useCallback(() => {
    setActiveDialog(null);
    setSelectedEntry(null);
  }, []);

  const handleAction = useCallback(
    (type: PurchaseListDialogType, entry: PurchaseEntry) => {
      setSelectedEntry(entry);
      setActiveDialog(type);
    },
    [],
  );

  const handleOpenAssessment = useCallback(
    (entry: PurchaseEntry) => {
      if (!isOpenableAssessmentStatus(entry.status)) {
        setToast(
          t("page.purchase.list.validation.onlyOpenAwaitingOrSaved", {
            defaultValue:
              "査定待ち、または査定一時保存の受付のみ明細読込できます。",
          }),
        );
        return;
      }

      navigate({ to: "/purchase/detail", search: { receiptId: entry.id } });
    },
    [navigate, t],
  );

  const handleLoadSelectedDetails = useCallback(() => {
    if (selectedIds.size === 0) return;
    // Use the first checked row for navigation
    const firstId = [...selectedIds][0];
    const entry = filteredRows.find((r) => String(r.id) === firstId);
    if (entry) handleOpenAssessment(entry);
  }, [handleOpenAssessment, selectedIds, filteredRows]);

  const handleOpenCustomerTicketReissueConfirm = useCallback(() => {
    setIsReissueConfirmOpen(true);
  }, []);

  const handleCustomerTicketReissueCancel = useCallback(() => {
    setIsReissueConfirmOpen(false);
  }, []);

  const handleCustomerTicketReissueConfirm = useCallback(() => {
    setIsReissueConfirmOpen(false);
    navigate({
      to: "/purchase/reception-ticket-reissue",
    });
  }, [navigate]);

  // E-41: reissue the store copy — keeps the same receipt number (Rule 2),
  // records an audit log (Rule 3) and reports the reissue number in the toast.
  const handleStoreCopyReissueConfirm = useCallback(
    async (payload: StoreCopyReissuePayload) => {
      if (!selectedEntry) return;

      const operator =
        sessionStorage.getItem("tantousha") || selectedEntry.assignedEmployee;
      const log = await buyBackApi.reissueStoreCopy(
        selectedEntry.id,
        payload,
        operator,
      );

      setRows((currentRows) =>
        currentRows.map((row) =>
          row.id === selectedEntry.id
            ? { ...row, storeCopyReissueCount: log.reissueNumber }
            : row,
        ),
      );

      closeDialog();
      setToast(
        t("page.purchase.toast.storeCopyReissued", {
          receiptNumber: log.receiptNumber,
          count: log.reissueNumber,
        }),
      );
    },
    [closeDialog, selectedEntry, t],
  );

  const handlePurchaseCancelConfirm = useCallback(() => {
    if (!selectedEntry) return;

    setRows((currentRows) =>
      currentRows.map((row) =>
        row.id === selectedEntry.id
          ? {
              ...row,
              status: "cancelled",
            }
          : row,
      ),
    );

    closeDialog();
    setToast(t("page.purchase.toast.cancelReceptionComplete"));
  }, [closeDialog, selectedEntry, t]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box sx={{ px: 0, pb: 1.5 }}>
        <OutlinedInput
          size="small"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t("page.purchase.list.search")}
          startAdornment={
            <InputAdornment position="start">
              <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
            </InputAdornment>
          }
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                size="small"
                edge="end"
                aria-label={t("page.purchase.list.searchQr")}
                sx={{ color: "text.secondary" }}
              >
                <QrCodeScannerIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          }
          sx={{
            width: "100%",
            height: 38,
            fontSize: "0.875rem",
            bgcolor: "background.paper",
            "& fieldset": { borderColor: "divider" },
          }}
        />
      </Box>
      <Box sx={{ pb: 1 }}>
        <PurchaseListFilterBar />
      </Box>
      <PurchaseListTable
        rows={filteredRows}
        selectedId={selectedRow?.id ?? null}
        onSelect={setSelectedRow}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onAction={handleAction}
        onOpenAssessment={handleOpenAssessment}
      />
      <PurchaseListBottomBar
        assessingCount={assessingCount}
        loadDetailsDisabled={selectedIds.size === 0}
        onLoadDetails={handleLoadSelectedDetails}
        onCustomerTicketReissue={handleOpenCustomerTicketReissueConfirm}
      />
      {selectedEntry && (
        <>
          <SmsStopDialog
            open={activeDialog === "sms"}
            receiptNumber={selectedEntry.receiptNumber}
            onConfirm={() => {
              closeDialog();
              setToast(t("page.purchase.toast.smsStopped"));
            }}
            onClose={closeDialog}
          />

          <StoreCopyDialog
            open={activeDialog === "storeCopy"}
            receiptNumber={selectedEntry.receiptNumber}
            reissueCount={selectedEntry.storeCopyReissueCount ?? 0}
            onConfirm={handleStoreCopyReissueConfirm}
            onClose={closeDialog}
          />

          <BranchLabelDialog
            open={activeDialog === "branchLabel"}
            receiptNumber={selectedEntry.receiptNumber}
            onConfirm={() => {
              closeDialog();
              setToast(t("page.purchase.toast.branchLabelPrinting"));
            }}
            onClose={closeDialog}
          />

          <CashDrawerDialog
            open={activeDialog === "cashDrawer"}
            receiptNumber={selectedEntry.receiptNumber}
            onComplete={() => {
              closeDialog();
              setToast(t("page.purchase.toast.checkoutComplete"));
            }}
            onClose={closeDialog}
          />

          <PhoneNumberDialog
            open={activeDialog === "phoneNumber"}
            receiptNumber={selectedEntry.receiptNumber}
            customerPhone={selectedEntry.customerPhone}
            onClose={closeDialog}
          />

          <PurchaseCancelDialog
            open={activeDialog === "cancelReception"}
            receiptNumber={selectedEntry.receiptNumber}
            onConfirm={handlePurchaseCancelConfirm}
            onClose={closeDialog}
          />
        </>
      )}
      <CustomerTicketReissueConfirmDialog
        open={isReissueConfirmOpen}
        onCancel={handleCustomerTicketReissueCancel}
        onConfirm={handleCustomerTicketReissueConfirm}
      />
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

interface CustomerTicketReissueConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function CustomerTicketReissueConfirmDialog({
  open,
  onConfirm,
  onCancel,
}: CustomerTicketReissueConfirmDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog
      open={open}
      maxWidth="xs"
      fullWidth
      onClose={onCancel}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            px: 1,
          },
        },
      }}
    >
      <DialogContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2.5,
            pt: 2,
            pb: 1,
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              bgcolor: "grey.100",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <DevicesOutlinedIcon
              sx={{ fontSize: 34, color: "text.secondary" }}
            />
          </Box>

          <Typography
            variant="body1"
            sx={{
              fontWeight: 600,
              textAlign: "center",
              whiteSpace: "pre-line",
            }}
          >
            {t("page.purchase.customerTicketHandoverDialog.message")}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1, justifyContent: "center" }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={onCancel}
          sx={{
            textTransform: "none",
            minWidth: 120,
            fontWeight: 700,
          }}
        >
          {t("page.purchase.customerTicketHandoverDialog.cancel")}
        </Button>

        <Button
          variant="contained"
          color="primary"
          onClick={onConfirm}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            minWidth: 120,
          }}
        >
          {t("page.purchase.customerTicketHandoverDialog.confirm")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
