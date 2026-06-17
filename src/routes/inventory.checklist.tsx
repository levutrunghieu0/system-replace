import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Select from "@mui/material/Select";
import Snackbar from "@mui/material/Snackbar";
import Typography from "@mui/material/Typography";
import PrintIcon from "@mui/icons-material/Print";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useTranslation } from "react-i18next";
import { useLayoutConfig } from "../hooks/useLayoutConfig";

export const Route = createFileRoute("/inventory/checklist")({
  component: ChecklistIssuePage,
});

type ReportType = "" | "shelfScan" | "diffList" | "diffListConfirmed";
type OutputFormat = "" | "perShelf" | "all" | "byCategory";

function ChecklistIssuePage() {
  const { t } = useTranslation();
  const [reportType, setReportType] = useState<ReportType>("");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("perShelf");
  const [toast, setToast] = useState({ open: false, message: "" });

  const canIssue = reportType !== "" && outputFormat !== "";

  const handleReset = () => {
    setReportType("");
    setOutputFormat("");
  };

  const handleIssue = () => {
    setToast({
      open: true,
      message: t("page.tanazaoroshi.checklist.toast.printing"),
    });
  };

  useLayoutConfig({
    title: t("page.tanazaoroshi.checklist.title"),
    actions: [
      {
        key: "reset",
        labelKey: "action.reset",
        position: "left",
        variant: "outlined",
        color: "inherit",
        startIcon: <RestartAltIcon fontSize="small" />,
        onClick: handleReset,
      },
      {
        key: "issue",
        labelKey: "page.tanazaoroshi.checklist.action.issue",
        position: "right",
        variant: "contained",
        color: "primary",
        startIcon: <PrintIcon fontSize="small" />,
        disabled: !canIssue,
        onClick: handleIssue,
      },
    ],
  });

  return (
    <Box sx={{ display: "flex", justifyContent: "center", pt: 4 }}>
      <Paper
        elevation={2}
        sx={{
          width: "100%",
          maxWidth: 520,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        {/* ── Page header ── */}
        <Box
          sx={{
            px: 3,
            py: 2,
            bgcolor: "grey.50",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography sx={{ fontSize: "0.82rem", color: "text.secondary" }}>
            {t("page.tanazaoroshi.checklist.title")}
          </Typography>
        </Box>

        <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}>
          {/* ── 表示項目 inner box ── */}
          <Box>
            <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, mb: 1 }}>
              {t("page.tanazaoroshi.checklist.sectionLabel")}
            </Typography>
            <Typography
              sx={{ fontSize: "0.8rem", color: "text.secondary", mb: 1.5 }}
            >
              {t("page.tanazaoroshi.checklist.selectHint")}
            </Typography>
            <Select
              size="small"
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
              displayEmpty
              fullWidth
              sx={{ fontSize: "0.875rem" }}
            >
              <MenuItem value="" disabled sx={{ fontSize: "0.875rem" }}>
                選択してください
              </MenuItem>
              {(["shelfScan", "diffList", "diffListConfirmed"] as const).map(
                (key) => (
                  <MenuItem key={key} value={key} sx={{ fontSize: "0.875rem" }}>
                    {t(`page.tanazaoroshi.checklist.reportOptions.${key}`)}
                  </MenuItem>
                ),
              )}
            </Select>
          </Box>

          <Divider />

          {/* ── 出力形式 ── */}
          <Box>
            <FormLabel
              sx={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "text.primary",
                display: "block",
                mb: 1.5,
              }}
            >
              {t("page.tanazaoroshi.checklist.outputFormat")}
            </FormLabel>
            <RadioGroup
              row
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
              sx={{ gap: 1 }}
            >
              {(["perShelf", "all", "byCategory"] as const).map((key) => (
                <FormControlLabel
                  key={key}
                  value={key}
                  control={<Radio size="small" />}
                  label={
                    <Typography sx={{ fontSize: "0.875rem" }}>
                      {t(`page.tanazaoroshi.checklist.formatOptions.${key}`)}
                    </Typography>
                  }
                />
              ))}
            </RadioGroup>
          </Box>
        </Box>
      </Paper>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="info" variant="filled" sx={{ fontSize: "0.85rem" }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
