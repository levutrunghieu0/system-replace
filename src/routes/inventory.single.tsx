import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import OutlinedInput from "@mui/material/OutlinedInput";
import Paper from "@mui/material/Paper";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import ClearIcon from "@mui/icons-material/Clear";
import DeleteIcon from "@mui/icons-material/Delete";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import SearchIcon from "@mui/icons-material/Search";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

import { useTranslation } from "react-i18next";

import { AppTable } from "../components/table";
import { AppModal } from "../components/common/AppModal";
import { useLayoutConfig } from "../hooks/useLayoutConfig";

export const Route = createFileRoute("/inventory/single")({
  component: SingleInventoryPage,
});

interface ScannedItem {
  id: number;
  productCode: string;
  productName: string;
  differential: number;
  subCategory: string;
  scannedAt: string;
}

type ToastState = {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info" | "warning";
};

const MOCK_PRODUCTS: Record<string, { name: string; subCategory: string }> = {
  "1234567": { name: "レ_カーディガン", subCategory: "01衣料" },
  "7654321": { name: "メ_スラックス", subCategory: "02服飾" },
  "1111111": { name: "レ_ブラウス", subCategory: "01衣料" },
  "2222222": { name: "メ_ジャケット", subCategory: "02服飾" },
  "1234567890123": { name: "Nike Zoom Vomero 5", subCategory: "01衣料" },
};

const isValidProductCode = (code: string) => /^\d{7}$|^\d{13}$/.test(code);

const formatTime = () =>
  new Intl.DateTimeFormat("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date());

function SingleInventoryPage() {
  const { t } = useTranslation();

  const [scanInput, setScanInput] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [executeConfirmOpen, setExecuteConfirmOpen] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);

  const [pendingCode, setPendingCode] = useState("");
  const [differential, setDifferential] = useState("");
  const [items, setItems] = useState<ScannedItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const [isLocked, setIsLocked] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: "",
    severity: "success",
  });

  const selectedCount = selectedIds.size;

  const totalDifferential = useMemo(
    () => items.reduce((sum, item) => sum + item.differential, 0),
    [items],
  );

  const isAllSelected = items.length > 0 && selectedIds.size === items.length;
  const isIndeterminate =
    selectedIds.size > 0 && selectedIds.size < items.length;

  useLayoutConfig({
    title: t("page.tanazaoroshi.single.title"),
    actions: [],
  });

  const showToast = (
    message: string,
    severity: ToastState["severity"] = "success",
  ) => {
    setToast({ open: true, message, severity });
  };

  const resetWork = () => {
    setItems([]);
    setSelectedIds(new Set());
    setScanInput("");
    setPendingCode("");
    setDifferential("");
    setIsLocked(false);
  };

  const handleScan = () => {
    const code = scanInput.trim();

    if (!code) return;

    if (!isValidProductCode(code)) {
      showToast(t("page.tanazaoroshi.single.toast.invalidCode"), "error");
      return;
    }

    setPendingCode(code);
    setDifferential(code.length === 13 ? "-1" : "");
    setDialogOpen(true);
    setScanInput("");
  };

  const handleQrSampleScan = () => {
    if (isLocked || isExecuting) return;

    const sampleCode = "1234567890123";
    const product = MOCK_PRODUCTS[sampleCode];

    setItems((prev) => [
      {
        id: Date.now(),
        productCode: sampleCode,
        productName: product.name,
        differential: -1,
        subCategory: product.subCategory,
        scannedAt: formatTime(),
      },
      ...prev,
    ]);

    showToast(t("page.tanazaoroshi.single.toast.added"), "success");
  };

  const handleConfirmDifferential = () => {
    if (!pendingCode) return;

    const parsedDifferential = Number(differential);

    if (!Number.isInteger(parsedDifferential)) {
      showToast(
        t("page.tanazaoroshi.single.toast.invalidDifferential"),
        "error",
      );
      return;
    }

    if (pendingCode.length === 13 && parsedDifferential !== -1) {
      showToast(t("page.tanazaoroshi.single.toast.fixedJanCode"), "error");
      return;
    }

    const product = MOCK_PRODUCTS[pendingCode] ?? {
      name: t("page.tanazaoroshi.single.unknownProduct"),
      subCategory: "ー",
    };

    setItems((prev) => [
      {
        id: Date.now(),
        productCode: pendingCode,
        productName: product.name,
        differential: parsedDifferential,
        subCategory: product.subCategory,
        scannedAt: formatTime(),
      },
      ...prev,
    ]);

    setDialogOpen(false);
    setPendingCode("");
    setDifferential("");
    showToast(t("page.tanazaoroshi.single.toast.added"), "success");
  };

  const handleToggleAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
      return;
    }

    setSelectedIds(new Set(items.map((item) => item.id)));
  };

  const handleToggleRow = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;

    setItems((prev) => prev.filter((item) => !selectedIds.has(item.id)));
    setSelectedIds(new Set());
    showToast(t("page.tanazaoroshi.single.toast.deleted"), "info");
  };

  const handleExecute = () => {
    if (items.length === 0 || isExecuting) return;

    setIsExecuting(true);

    window.setTimeout(() => {
      resetWork();
      setIsExecuting(false);
      setExecuteConfirmOpen(false);
      showToast(t("page.tanazaoroshi.single.toast.completed"), "success");
    }, 600);
  };

  const handleOpenSlipList = () => {
    showToast(
      t("page.tanazaoroshi.single.toast.slipListNotImplemented"),
      "info",
    );
  };

  const headerSx = {
    fontSize: "0.78rem",
    fontWeight: 700,
    color: "text.secondary",
    py: 1,
    px: 1.25,
    whiteSpace: "nowrap" as const,
    bgcolor: "background.paper",
    borderBottom: "1px solid",
    borderColor: "divider",
  };

  const cellSx = {
    fontSize: "0.82rem",
    py: 0.75,
    px: 1.25,
    whiteSpace: "nowrap" as const,
  };

  const columns = useMemo<ColumnDef<ScannedItem>[]>(
    () => [
      {
        id: "select",
        header: () => (
          <Checkbox
            size="small"
            checked={isAllSelected}
            indeterminate={isIndeterminate}
            onChange={handleToggleAll}
            disabled={items.length === 0 || isLocked}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            size="small"
            checked={selectedIds.has(row.original.id)}
            onChange={() => handleToggleRow(row.original.id)}
            disabled={isLocked}
          />
        ),
        meta: {
          headerSx: { ...headerSx, width: 44, px: 0.75 },
          cellSx: { ...cellSx, width: 44, px: 0.75 },
        },
      },
      {
        accessorKey: "productCode",
        header: t("page.tanazaoroshi.single.col.productCode"),
        cell: ({ row }) => (
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Typography sx={{ fontSize: "0.82rem", fontWeight: 700 }}>
              {row.original.productCode}
            </Typography>
            <Chip
              size="small"
              variant="outlined"
              label={
                row.original.productCode.length === 13
                  ? t("page.tanazaoroshi.single.codeType.jan")
                  : t("page.tanazaoroshi.single.codeType.product")
              }
              sx={{ height: 20, fontSize: "0.68rem" }}
            />
          </Stack>
        ),
        meta: { headerSx, cellSx },
      },
      {
        accessorKey: "productName",
        header: t("page.tanazaoroshi.single.col.productName"),
        cell: ({ getValue }) => (
          <Typography sx={{ fontSize: "0.82rem", fontWeight: 600 }}>
            {getValue<string>()}
          </Typography>
        ),
        meta: { headerSx, cellSx },
      },
      {
        accessorKey: "subCategory",
        header: t("page.tanazaoroshi.single.col.subCategory"),
        meta: { headerSx, cellSx },
      },
      {
        accessorKey: "differential",
        header: t("page.tanazaoroshi.single.col.differential"),
        cell: ({ getValue }) => {
          const value = getValue<number>();

          return (
            <Typography
              sx={{
                fontSize: "0.86rem",
                fontWeight: 800,
                color:
                  value < 0
                    ? "error.main"
                    : value > 0
                      ? "success.main"
                      : "text.primary",
              }}
            >
              {value > 0 ? `+${value}` : value}
            </Typography>
          );
        },
        meta: { headerSx, cellSx },
      },
      {
        accessorKey: "scannedAt",
        header: t("page.tanazaoroshi.single.col.scannedAt"),
        meta: { headerSx, cellSx },
      },
    ],
    [t, selectedIds, isAllSelected, isIndeterminate, items.length, isLocked],
  );

  return (
    <Box
      sx={{
        height: "100%",
        minHeight: 0,
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        bgcolor: "background.paper",
      }}
    >
      <Box
        sx={{
          pt: 1,
          pb: 0.75,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        {" "}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1}
          sx={{
            alignItems: { xs: "stretch", md: "center" },
            justifyContent: "space-between",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1}
            sx={{
              alignItems: { xs: "stretch", md: "center" },
              minWidth: 0,
              flex: 1,
            }}
          >
            <OutlinedInput
              size="small"
              value={scanInput}
              disabled={isLocked || isExecuting}
              onChange={(event) => setScanInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleScan();
                }
              }}
              placeholder={t("header.search")}
              startAdornment={
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                </InputAdornment>
              }
              endAdornment={
                <InputAdornment position="end" sx={{ mr: -0.75 }}>
                  {scanInput && (
                    <IconButton
                      size="small"
                      disabled={isLocked || isExecuting}
                      onClick={() => setScanInput("")}
                      sx={{
                        mr: 0.25,
                        borderRadius: 0.75,
                        color: "text.secondary",
                      }}
                    >
                      <ClearIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  )}

                  <Box
                    sx={{
                      height: 24,
                      borderLeft: "1px solid",
                      borderColor: "#d7dde5",
                      mx: 0.75,
                    }}
                  />

                  <Tooltip
                    title={t("page.tanazaoroshi.single.action.sampleScan", {
                      defaultValue: "Sample scan",
                    })}
                  >
                    <span>
                      <IconButton
                        size="small"
                        disabled={isLocked || isExecuting}
                        onClick={handleQrSampleScan}
                        sx={{
                          borderRadius: 0.75,
                          color: "text.secondary",
                          "&:hover": {
                            bgcolor: "action.hover",
                          },
                        }}
                      >
                        <QrCodeScannerIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </span>
                  </Tooltip>
                </InputAdornment>
              }
              sx={{
                width: { xs: "100%", md: 470 },
                height: 34,
                bgcolor: "white",
                fontSize: 12,
                "& input": {
                  py: 0.8,
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#d5dbe5",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#c7d0dc",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#b8c3d1",
                  borderWidth: 1,
                },
              }}
            />
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: "center",
              justifyContent: { xs: "flex-start", md: "flex-end" },
            }}
          >
            {isLocked && (
              <Chip
                size="small"
                color="warning"
                icon={<LockIcon />}
                label={t("page.tanazaoroshi.single.locked")}
                sx={{ fontWeight: 700 }}
              />
            )}
            <Chip
              size="small"
              label={t("page.tanazaoroshi.single.summary.items", {
                count: items.length,
              })}
              sx={{ fontWeight: 700 }}
            />
            <Chip
              size="small"
              color={
                totalDifferential < 0
                  ? "error"
                  : totalDifferential > 0
                    ? "success"
                    : "default"
              }
              variant="outlined"
              label={t("page.tanazaoroshi.single.summary.differential", {
                count:
                  totalDifferential > 0
                    ? `+${totalDifferential}`
                    : totalDifferential,
              })}
              sx={{ fontWeight: 700 }}
            />
          </Stack>
        </Stack>
      </Box>

      <Box
        sx={{
          minHeight: 0,
          overflow: "hidden",
          bgcolor: "background.paper",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            position: "relative",
            bgcolor: "background.paper",
            overflow: "hidden",
          }}
        >
          {items.length > 0 && (
            <Box
              sx={{
                mt: 1,
              }}
            >
              <AppTable<ScannedItem>
                data={items}
                columns={columns}
                getRowId={(row) => String(row.id)}
                stickyHeader
                containerMaxHeight={520}
                dense
                emptyMessage={t("page.tanazaoroshi.single.emptyMessage")}
              />
            </Box>
          )}

          {items.length === 0 && (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                px: 2,
                textAlign: "center",
              }}
            >
              <Stack
                spacing={1}
                sx={{ alignItems: "center", color: "text.secondary" }}
              >
                <Box
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "background.paper",
                    border: "1px dashed",
                    borderColor: "divider",
                  }}
                >
                  <QrCodeScannerIcon sx={{ fontSize: 34 }} />
                </Box>
                <Typography
                  sx={{
                    fontSize: "1rem",
                    fontWeight: 800,
                    color: "text.primary",
                  }}
                >
                  {t("page.tanazaoroshi.single.emptyTitle")}
                </Typography>
                <Typography sx={{ fontSize: "0.82rem", maxWidth: 420 }}>
                  {t("page.tanazaoroshi.single.emptyDescription")}
                </Typography>
              </Stack>
            </Box>
          )}
        </Box>
      </Box>

      <Box
        component="footer"
        sx={{
          px: 2,
          py: 1.25,
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={1}
          sx={{
            alignItems: { xs: "stretch", lg: "center" },
            justifyContent: "space-between",
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              startIcon={<PauseCircleIcon fontSize="small" />}
              disabled={items.length === 0 || isExecuting}
              onClick={() => setCancelConfirmOpen(true)}
            >
              {t("page.tanazaoroshi.single.action.cancelWork")}
            </Button>

            <Button
              variant="outlined"
              color="inherit"
              size="small"
              startIcon={<DeleteIcon fontSize="small" />}
              disabled={selectedCount === 0 || isLocked || isExecuting}
              onClick={handleDeleteSelected}
            >
              {t("page.tanazaoroshi.single.action.deleteSelected", {
                count: selectedCount,
              })}
            </Button>

            <Button
              variant="outlined"
              color="inherit"
              size="small"
              startIcon={<ReceiptLongIcon fontSize="small" />}
              onClick={handleOpenSlipList}
            >
              {t("page.tanazaoroshi.single.action.slipList")}
            </Button>

            <Tooltip title={t("page.tanazaoroshi.single.action.lockTooltip")}>
              <span>
                <Button
                  variant={isLocked ? "contained" : "outlined"}
                  color={isLocked ? "warning" : "inherit"}
                  size="small"
                  startIcon={
                    isLocked ? (
                      <LockIcon fontSize="small" />
                    ) : (
                      <LockOpenIcon fontSize="small" />
                    )
                  }
                  disabled={items.length === 0 || isExecuting}
                  onClick={() => setIsLocked((prev) => !prev)}
                >
                  {isLocked
                    ? t("page.tanazaoroshi.single.action.unlockStatus")
                    : t("page.tanazaoroshi.single.action.lockStatus")}
                </Button>
              </span>
            </Tooltip>
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              startIcon={<RestartAltIcon fontSize="small" />}
              disabled={items.length === 0 || isExecuting}
              onClick={resetWork}
            >
              {t("page.tanazaoroshi.single.action.reset")}
            </Button>

            <Button
              variant="contained"
              color="success"
              size="small"
              startIcon={
                isExecuting ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <PlayArrowIcon fontSize="small" />
                )
              }
              disabled={items.length === 0 || isExecuting}
              onClick={() => setExecuteConfirmOpen(true)}
              sx={{ minWidth: 128, fontWeight: 800 }}
            >
              {t("page.tanazaoroshi.single.action.run")}
            </Button>
          </Stack>
        </Stack>
      </Box>

      <AppModal
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={t("page.tanazaoroshi.single.dialog.title")}
        actions={[
          {
            label: t("page.tanazaoroshi.single.dialog.cancel"),
            onClick: () => setDialogOpen(false),
            color: "inherit",
          },
          {
            label: t("page.tanazaoroshi.single.dialog.confirm"),
            onClick: handleConfirmDifferential,
            variant: "contained",
            disabled: differential === "",
          },
        ]}
      >
        <Stack spacing={2}>
          <Paper
            variant="outlined"
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: "background.default",
            }}
          >
            <Stack spacing={1}>
              <Stack
                direction="row"
                spacing={1.5}
                sx={{ alignItems: "center" }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ minWidth: 96 }}
                >
                  {t("page.tanazaoroshi.single.dialog.productCode")}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 800 }}>
                  {pendingCode}
                </Typography>
                {pendingCode && (
                  <Chip
                    size="small"
                    variant="outlined"
                    label={
                      pendingCode.length === 13
                        ? t("page.tanazaoroshi.single.codeType.jan")
                        : t("page.tanazaoroshi.single.codeType.product")
                    }
                    sx={{ height: 20, fontSize: "0.68rem" }}
                  />
                )}
              </Stack>

              <Stack
                direction="row"
                spacing={1.5}
                sx={{ alignItems: "center" }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ minWidth: 96 }}
                >
                  {t("page.tanazaoroshi.single.dialog.productName")}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {MOCK_PRODUCTS[pendingCode]?.name ??
                    t("page.tanazaoroshi.single.unknownProduct")}
                </Typography>
              </Stack>
            </Stack>
          </Paper>

          <TextField
            label={t("page.tanazaoroshi.single.dialog.differentialCount")}
            helperText={
              pendingCode.length === 13
                ? t("page.tanazaoroshi.single.dialog.janFixedHelp")
                : t("page.tanazaoroshi.single.dialog.productHelp")
            }
            size="small"
            type="number"
            value={differential}
            onChange={(event) => setDifferential(event.target.value)}
            autoFocus
            onKeyDown={(event) => {
              if (event.key === "Enter" && differential !== "") {
                handleConfirmDifferential();
              }
            }}
            slotProps={{
              input: {
                readOnly: pendingCode.length === 13,
              },
            }}
          />
        </Stack>
      </AppModal>

      <AppModal
        open={executeConfirmOpen}
        onClose={() => setExecuteConfirmOpen(false)}
        title={t("page.tanazaoroshi.single.executeDialog.title")}
        actions={[
          {
            label: t("page.tanazaoroshi.single.executeDialog.cancel"),
            onClick: () => setExecuteConfirmOpen(false),
            color: "inherit",
            disabled: isExecuting,
          },
          {
            label: t("page.tanazaoroshi.single.executeDialog.confirm"),
            onClick: handleExecute,
            variant: "contained",
            color: "success",
            disabled: isExecuting,
          },
        ]}
      >
        <Stack spacing={1.5}>
          <Typography variant="body2">
            {t("page.tanazaoroshi.single.executeDialog.message")}
          </Typography>

          <Paper
            variant="outlined"
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: "background.default",
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              sx={{
                flexWrap: "wrap",
              }}
            >
              <Chip
                size="small"
                label={t("page.tanazaoroshi.single.summary.items", {
                  count: items.length,
                })}
              />
              <Chip
                size="small"
                color={
                  totalDifferential < 0
                    ? "error"
                    : totalDifferential > 0
                      ? "success"
                      : "default"
                }
                variant="outlined"
                label={t("page.tanazaoroshi.single.summary.differential", {
                  count:
                    totalDifferential > 0
                      ? `+${totalDifferential}`
                      : totalDifferential,
                })}
              />
            </Stack>
          </Paper>
        </Stack>
      </AppModal>

      <AppModal
        open={cancelConfirmOpen}
        onClose={() => setCancelConfirmOpen(false)}
        title={t("page.tanazaoroshi.single.cancelDialog.title")}
        actions={[
          {
            label: t("page.tanazaoroshi.single.cancelDialog.back"),
            onClick: () => setCancelConfirmOpen(false),
            color: "inherit",
          },
          {
            label: t("page.tanazaoroshi.single.cancelDialog.confirm"),
            onClick: () => {
              resetWork();
              setCancelConfirmOpen(false);
              showToast(t("page.tanazaoroshi.single.toast.cancelled"), "info");
            },
            variant: "contained",
            color: "error",
          },
        ]}
      >
        <Typography variant="body2">
          {t("page.tanazaoroshi.single.cancelDialog.message")}
        </Typography>
      </AppModal>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          severity={toast.severity}
          variant="filled"
          sx={{ fontSize: "0.85rem" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
