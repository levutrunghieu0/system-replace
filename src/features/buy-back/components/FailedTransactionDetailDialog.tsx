import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";

import { AppModal } from "../../../components/common/AppModal";
import type { FailedTransaction } from "../types";
import { maskPhoneNumber } from "../utils/failedSearchRules";

interface FailedTransactionDetailDialogProps {
  transaction: FailedTransaction | null;
  onClose: () => void;
}

const formatDateTime = (value: string) => value.replace("T", " ");

export function FailedTransactionDetailDialog({
  transaction,
  onClose,
}: FailedTransactionDetailDialogProps) {
  const { t } = useTranslation();

  if (!transaction) return null;

  return (
    <AppModal
      open
      onClose={onClose}
      maxWidth="sm"
      title={t("page.purchase.failedSearch.detail.title", {
        receiptNumber: transaction.receiptNumber,
      })}
      actions={[
        {
          label: t("page.purchase.failedSearch.detail.close"),
          onClick: onClose,
          variant: "outlined",
          color: "inherit",
        },
      ]}
    >
      {/* Transaction summary (read-only — E-52 Rule 2) */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 1,
          mb: 1.5,
        }}
      >
        <SummaryItem
          label={t("page.purchase.failedSearch.detail.customer")}
          value={`${transaction.customerNameKanji} / ${transaction.customerNameKana}`}
        />
        <SummaryItem
          label={t("page.purchase.failedSearch.col.phone")}
          value={maskPhoneNumber(transaction.customerPhone)}
        />
        <SummaryItem
          label={t("page.purchase.failedSearch.detail.receivedAt")}
          value={formatDateTime(transaction.receivedAt)}
        />
        <SummaryItem
          label={t("page.purchase.failedSearch.detail.cancelledAt")}
          value={formatDateTime(transaction.cancelledAt)}
        />
      </Box>

      <Box sx={{ mb: 1.5 }}>
        <Chip
          size="small"
          color="error"
          variant="outlined"
          label={t(
            `page.purchase.failedSearch.reason.${transaction.failedReason}`,
          )}
        />
        {transaction.failedNote && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            {transaction.failedNote}
          </Typography>
        )}
      </Box>

      <Divider sx={{ mb: 1.5 }} />

      {/* All items the customer brought in before cancellation (Rule 3) */}
      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
        {t("page.purchase.failedSearch.detail.itemsTitle", {
          count: transaction.items.length,
        })}
      </Typography>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t("page.purchase.failedSearch.detail.col.no")}</TableCell>
            <TableCell>
              {t("page.purchase.failedSearch.detail.col.category")}
            </TableCell>
            <TableCell>
              {t("page.purchase.failedSearch.detail.col.brand")}
            </TableCell>
            <TableCell>
              {t("page.purchase.failedSearch.detail.col.model")}
            </TableCell>
            <TableCell>
              {t("page.purchase.failedSearch.detail.col.condition")}
            </TableCell>
            <TableCell align="right">
              {t("page.purchase.failedSearch.detail.col.appraisalValue")}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transaction.items.map((item, index) => (
            <TableRow key={item.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell>{item.brand}</TableCell>
              <TableCell>{item.model}</TableCell>
              <TableCell>{item.condition}</TableCell>
              <TableCell align="right">
                {item.appraisalValue != null
                  ? `¥${item.appraisalValue.toLocaleString()}`
                  : t("page.purchase.failedSearch.noEstimate")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </AppModal>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block" }}
      >
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 700 }}>
        {value}
      </Typography>
    </Box>
  );
}
