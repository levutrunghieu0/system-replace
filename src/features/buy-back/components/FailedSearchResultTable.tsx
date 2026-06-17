import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { useTranslation } from "react-i18next";

import type { FailedTransaction } from "../types";
import { maskPhoneNumber } from "../utils/failedSearchRules";

interface FailedSearchResultTableProps {
  rows: FailedTransaction[];
  searched: boolean;
  onShowDetail: (row: FailedTransaction) => void;
}

const thSx = {
  fontSize: "0.75rem",
  fontWeight: 700,
  color: "text.secondary",
  py: 1,
  px: 1.5,
  whiteSpace: "nowrap" as const,
  bgcolor: "grey.50",
  borderBottom: "2px solid",
  borderColor: "divider",
};

const tdSx = {
  py: 0.75,
  px: 1.5,
  borderBottom: "1px solid",
  borderColor: "divider",
  verticalAlign: "top" as const,
  userSelect: "text" as const,
};

const formatDateTime = (value: string) => value.replace("T", " ");

const formatCurrency = (value: number) => `¥${value.toLocaleString()}`;

export function FailedSearchResultTable({
  rows,
  searched,
  onShowDetail,
}: FailedSearchResultTableProps) {
  const { t } = useTranslation();

  const columns = [
    { key: "no", label: t("page.purchase.failedSearch.col.no"), width: 44 },
    {
      key: "receiptNumber",
      label: t("page.purchase.failedSearch.col.receiptNumber"),
      width: 90,
    },
    {
      key: "period",
      label: t("page.purchase.failedSearch.col.period"),
      width: 180,
    },
    {
      key: "customer",
      label: t("page.purchase.failedSearch.col.customer"),
      width: 160,
    },
    {
      key: "phone",
      label: t("page.purchase.failedSearch.col.phone"),
      width: 120,
    },
    {
      key: "categories",
      label: t("page.purchase.failedSearch.col.categories"),
      width: 140,
    },
    {
      key: "estimatedTotal",
      label: t("page.purchase.failedSearch.col.estimatedTotal"),
      width: 110,
      align: "right" as const,
    },
    {
      key: "reason",
      label: t("page.purchase.failedSearch.col.reason"),
      width: 220,
    },
    {
      key: "staff",
      label: t("page.purchase.failedSearch.col.staff"),
      width: 150,
    },
    {
      key: "action",
      label: "",
      width: 110,
    },
  ];

  if (searched && rows.length === 0) {
    return (
      <Box
        sx={{
          py: 6,
          textAlign: "center",
          border: "1px dashed",
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {t("page.purchase.failedSearch.noResultTitle")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {t("page.purchase.failedSearch.noResult")}
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer
      sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1 }}
    >
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.key}
                sx={{
                  ...thSx,
                  width: column.width,
                  ...(column.align ? { textAlign: column.align } : {}),
                }}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={row.id} hover>
              <TableCell sx={tdSx}>{index + 1}</TableCell>
              <TableCell sx={{ ...tdSx, fontFamily: "monospace" }}>
                {row.receiptNumber}
              </TableCell>
              <TableCell sx={tdSx}>
                <Typography variant="caption" sx={{ display: "block" }}>
                  {formatDateTime(row.receivedAt)}
                </Typography>
                <Typography
                  variant="caption"
                  color="error.main"
                  sx={{ display: "block", fontWeight: 700 }}
                >
                  → {formatDateTime(row.cancelledAt)}
                </Typography>
              </TableCell>
              <TableCell sx={tdSx}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {row.customerNameKanji}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {row.customerNameKana}
                </Typography>
              </TableCell>
              {/* Privacy: middle digits are always masked on screen */}
              <TableCell sx={{ ...tdSx, fontFamily: "monospace" }}>
                {maskPhoneNumber(row.customerPhone)}
              </TableCell>
              <TableCell sx={tdSx}>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {row.itemCategories.map((category) => (
                    <Chip
                      key={category}
                      size="small"
                      label={category}
                      variant="outlined"
                    />
                  ))}
                </Box>
              </TableCell>
              <TableCell sx={{ ...tdSx, textAlign: "right" }}>
                {row.estimatedTotal != null
                  ? formatCurrency(row.estimatedTotal)
                  : t("page.purchase.failedSearch.noEstimate")}
              </TableCell>
              <TableCell sx={tdSx}>
                <Chip
                  size="small"
                  color="error"
                  variant="outlined"
                  label={t(
                    `page.purchase.failedSearch.reason.${row.failedReason}`,
                  )}
                />
                {row.failedNote && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mt: 0.5, whiteSpace: "normal" }}
                  >
                    {row.failedNote}
                  </Typography>
                )}
              </TableCell>
              <TableCell sx={tdSx}>
                <Typography variant="caption" sx={{ display: "block" }}>
                  {t("page.purchase.failedSearch.receptionStaffShort")}:{" "}
                  {row.receptionStaff.name}
                </Typography>
                <Typography variant="caption" sx={{ display: "block" }}>
                  {t("page.purchase.failedSearch.assessmentStaffShort")}:{" "}
                  {row.assessmentStaff?.name ?? "-"}
                </Typography>
              </TableCell>
              <TableCell sx={tdSx}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<VisibilityOutlinedIcon />}
                  onClick={() => onShowDetail(row)}
                >
                  {t("page.purchase.failedSearch.detailButton")}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
