import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import CheckIcon from "@mui/icons-material/Check";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";

import { BUYBACK_BLUE, BUYBACK_BORDER, BUYBACK_SOFT_BLUE } from "../constants";
import type {
  BuyBackReceptionDialogMode,
  BuyBackReceptionState,
} from "../types";

const STAFF_CODE_LENGTH = 7;

interface BuyBackReceptionWorkspaceProps {
  state: BuyBackReceptionState;
  onChange: (patch: Partial<BuyBackReceptionState>) => void;
  onOpenPrint: (dialog: BuyBackReceptionDialogMode) => void;
}

function normalizeStaffCode(value: string) {
  return value.replace(/[^0-9]/g, "").slice(0, STAFF_CODE_LENGTH);
}

function isValidStaffCode(value: string) {
  return /^\d{7}$/.test(value);
}

export function BuyBackReceptionWorkspace({
  state,
  onChange,
  onOpenPrint,
}: BuyBackReceptionWorkspaceProps) {
  const { t } = useTranslation();
  const staffCode = normalizeStaffCode(state.staffCode);
  const isStaffCodeValid = isValidStaffCode(staffCode);

  const steps = [
    {
      key: "staff",
      label: t("page.front.buyBackReception.step.staff"),
      done: isStaffCodeValid,
    },
    {
      key: "application",
      label: t("page.front.buyBackReception.step.application"),
      done: Boolean(state.customerName && state.customerPhone),
    },
    {
      key: "special",
      label: t("page.front.buyBackReception.step.special"),
      done: true,
    },
    {
      key: "print",
      label: t("page.front.buyBackReception.step.print"),
      done: state.printedReceptionTicket,
    },
    {
      key: "branch",
      label: t("page.front.buyBackReception.step.branch"),
      done: state.branchCount <= 1 || state.printedBranchTicket,
    },
    {
      key: "sms",
      label: t("page.front.buyBackReception.step.sms"),
      done: true,
    },
  ];

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) 340px",
        gap: 1.25,
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          p: 1.75,
          overflow: "auto",
          borderColor: BUYBACK_BORDER,
          bgcolor: "white",
          borderRadius: 1.25,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 1.5,
            mb: 1.5,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{ fontWeight: 800, fontSize: 17, lineHeight: 1.35 }}
            >
              {t("page.front.buyBackReception.heading")}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.25 }}
            >
              {t("page.front.buyBackReception.subHeading")}
            </Typography>
          </Box>
          <Chip
            size="small"
            color={state.completed ? "success" : "primary"}
            label={
              state.completed
                ? t("page.front.buyBackReception.completed")
                : t("page.front.buyBackReception.inProgress")
            }
            sx={{ flexShrink: 0, fontWeight: 700 }}
          />
        </Box>

        <StepProgress steps={steps} />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 1.25,
            alignItems: "stretch",
          }}
        >
          <SectionCard title={t("page.front.buyBackReception.staffBlock")}>
            <Stack spacing={0.75}>
              <TextField
                size="small"
                fullWidth
                label={t("page.front.buyBackReception.staffCode")}
                value={staffCode}
                error={Boolean(staffCode) && !isStaffCodeValid}
                helperText={
                  Boolean(staffCode) && !isStaffCodeValid
                    ? t("page.front.buyBackReception.staffCodeLengthError")
                    : t("page.front.buyBackReception.staffRequired")
                }
                onChange={(event) =>
                  onChange({
                    staffCode: normalizeStaffCode(event.target.value),
                  })
                }
                placeholder={t(
                  "page.front.buyBackReception.staffCodePlaceholder",
                )}
                slotProps={{
                  htmlInput: {
                    inputMode: "numeric",
                    maxLength: STAFF_CODE_LENGTH,
                  },
                  input: {
                    endAdornment: (
                      <QrCodeScannerIcon
                        sx={{ fontSize: 18, color: "text.secondary" }}
                      />
                    ),
                  },
                }}
              />
            </Stack>
          </SectionCard>

          <SectionCard
            title={t("page.front.buyBackReception.applicationBlock")}
          >
            <Stack spacing={0.75} sx={{ height: "100%" }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
                  gap: 1,
                }}
              >
                <TextField
                  size="small"
                  fullWidth
                  label={t("page.front.buyBackReception.customerName")}
                  value={state.customerName}
                  onChange={(event) =>
                    onChange({ customerName: event.target.value })
                  }
                />
                <TextField
                  size="small"
                  fullWidth
                  label={t("page.front.buyBackReception.customerPhone")}
                  value={state.customerPhone}
                  onChange={(event) =>
                    onChange({ customerPhone: event.target.value })
                  }
                />
              </Box>
              <Typography
                variant="caption"
                sx={{ minHeight: 20, visibility: "hidden" }}
              >
                -
              </Typography>
            </Stack>
          </SectionCard>

          <SectionCard title={t("page.front.buyBackReception.checkBlock")}>
            <Stack spacing={1} sx={{ height: "100%" }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
                  gap: 1,
                }}
              >
                <Button
                  fullWidth
                  variant={state.hasSpecialItem ? "contained" : "outlined"}
                  onClick={() =>
                    onChange({ hasSpecialItem: !state.hasSpecialItem })
                  }
                  sx={{ height: 42, fontWeight: 700 }}
                >
                  {t("page.front.buyBackReception.specialItem")}
                </Button>
                <Button
                  fullWidth
                  variant={state.smsAvailable ? "contained" : "outlined"}
                  onClick={() =>
                    onChange({ smsAvailable: !state.smsAvailable })
                  }
                  sx={{ height: 42, fontWeight: 700 }}
                >
                  {state.smsAvailable
                    ? t("page.front.buyBackReception.smsAvailable")
                    : t("page.front.buyBackReception.smsUnavailable")}
                </Button>
              </Box>
              <Typography
                variant="caption"
                color={state.hasSpecialItem ? "warning.main" : "text.secondary"}
                sx={{ display: "block", minHeight: 20 }}
              >
                {state.hasSpecialItem
                  ? t("page.front.buyBackReception.specialGuide")
                  : t("page.front.buyBackReception.noSpecialGuide")}
              </Typography>
            </Stack>
          </SectionCard>

          <SectionCard title={t("page.front.buyBackReception.printBlock")}>
            <Stack spacing={1} sx={{ height: "100%" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {t("page.front.buyBackReception.receptionNo")}
                </Typography>
                <Typography sx={{ fontWeight: 800, color: BUYBACK_BLUE }}>
                  {state.receptionNo}
                </Typography>
                <Box sx={{ flex: 1 }} />
                <Chip
                  size="small"
                  color={state.printedReceptionTicket ? "success" : "default"}
                  label={
                    state.printedReceptionTicket
                      ? t("page.front.buyBackReception.printed")
                      : t("page.front.buyBackReception.notPrinted")
                  }
                  sx={{ height: 22, fontWeight: 700 }}
                />
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
                  gap: 1,
                }}
              >
                <Button
                  variant="contained"
                  disabled={!isStaffCodeValid}
                  onClick={() => onOpenPrint("buybackReceiptPrint")}
                  sx={{ height: 42, fontWeight: 800 }}
                >
                  {t("page.front.buyBackReception.issueReceipt")}
                </Button>
                <Button
                  variant="outlined"
                  disabled={!state.printedReceptionTicket}
                  onClick={() => onOpenPrint("buybackBranchPrint")}
                  sx={{ height: 42, fontWeight: 800 }}
                >
                  {t("page.front.buyBackReception.issueBranch")}
                </Button>
              </Box>
            </Stack>
          </SectionCard>
        </Box>
      </Paper>

      <BuyBackReceptionSummaryPanel
        state={{ ...state, staffCode }}
        isStaffCodeValid={isStaffCodeValid}
        onFinish={() => onOpenPrint("buybackComplete")}
      />
    </Box>
  );
}

function StepProgress({
  steps,
}: {
  steps: Array<{ key: string; label: string; done: boolean }>;
}) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
        gap: 0.75,
        mb: 1.5,
      }}
    >
      {steps.map((step, index) => (
        <Box
          key={step.key}
          sx={{
            minHeight: 50,
            px: 1.05,
            py: 0.85,
            border: "1px solid",
            borderColor: step.done ? "primary.light" : BUYBACK_BORDER,
            borderRadius: 1.2,
            bgcolor: step.done ? BUYBACK_SOFT_BLUE : "#f8fafc",
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            minWidth: 0,
          }}
        >
          <Box
            sx={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              bgcolor: step.done ? BUYBACK_BLUE : "#d9dee7",
              color: "white",
              flexShrink: 0,
            }}
          >
            {step.done ? (
              <CheckIcon sx={{ fontSize: 14 }} />
            ) : (
              <Typography sx={{ fontSize: 10, fontWeight: 800 }}>
                {index + 1}
              </Typography>
            )}
          </Box>
          <Typography
            sx={{
              minWidth: 0,
              fontSize: 11.5,
              fontWeight: 800,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {step.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.35,
        borderColor: BUYBACK_BORDER,
        borderRadius: 1.2,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography sx={{ fontWeight: 800, fontSize: 13.5, mb: 1.1 }}>
        {title}
      </Typography>
      <Box sx={{ flex: 1 }}>{children}</Box>
    </Paper>
  );
}

function BuyBackReceptionSummaryPanel({
  state,
  isStaffCodeValid,
  onFinish,
}: {
  state: BuyBackReceptionState;
  isStaffCodeValid: boolean;
  onFinish: () => void;
}) {
  const { t } = useTranslation();

  const canFinish =
    isStaffCodeValid &&
    state.printedReceptionTicket &&
    (state.branchCount <= 1 || state.printedBranchTicket);

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        borderColor: BUYBACK_BORDER,
        borderRadius: 1.25,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        bgcolor: "white",
      }}
    >
      <Typography sx={{ fontWeight: 800, fontSize: 14 }}>
        {t("page.front.breakdownDetail")}
      </Typography>
      <Typography variant="caption" sx={{ color: "text.secondary", mt: 1 }}>
        {t("page.front.buyBackReception.summaryTitle")}
      </Typography>
      <Divider sx={{ my: 1.1 }} />
      <SummaryLine
        label={t("page.front.buyBackReception.staffCode")}
        value={state.staffCode || "-"}
        invalid={Boolean(state.staffCode) && !isStaffCodeValid}
      />
      <SummaryLine
        label={t("page.front.buyBackReception.receptionNo")}
        value={state.receptionNo}
      />
      <SummaryLine
        label={t("page.front.buyBackReception.branchCount")}
        value={`${state.branchCount}`}
      />
      <SummaryLine
        label={t("page.front.buyBackReception.receptionTicket")}
        value={
          state.printedReceptionTicket
            ? t("page.front.buyBackReception.printed")
            : t("page.front.buyBackReception.notPrinted")
        }
      />
      <SummaryLine
        label={t("page.front.buyBackReception.branchTicket")}
        value={
          state.printedBranchTicket
            ? t("page.front.buyBackReception.printed")
            : t("page.front.buyBackReception.notPrinted")
        }
      />
      <SummaryLine
        label={t("page.front.buyBackReception.sms")}
        value={
          state.smsAvailable
            ? t("page.front.buyBackReception.smsAvailableShort")
            : t("page.front.buyBackReception.smsUnavailableShort")
        }
      />
      <Box sx={{ flex: 1 }} />
      <Button
        fullWidth
        variant="contained"
        disabled={!canFinish}
        onClick={onFinish}
        sx={{ height: 42, fontWeight: 800 }}
      >
        {t("page.front.buyBackReception.finish")}
      </Button>
    </Paper>
  );
}

function SummaryLine({
  label,
  value,
  invalid,
}: {
  label: string;
  value: string;
  invalid?: boolean;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        py: 0.65,
        gap: 1,
      }}
    >
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          fontWeight: 800,
          color: invalid ? "error.main" : "text.primary",
          textAlign: "right",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}
