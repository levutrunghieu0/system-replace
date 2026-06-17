import { useState } from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";

import type { PurchaseEntry, PurchaseListDialogType } from "../types";
import { PurchaseRowActionMenu } from "./PurchaseRowActionMenu";
import { PurchaseStatusChip } from "./PurchaseStatusChip";
import { Button, Typography } from "@mui/material";

interface PurchaseListTableProps {
  rows: PurchaseEntry[];
  selectedId?: number | string | null;
  onSelect?: (entry: PurchaseEntry) => void;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  onAction: (type: PurchaseListDialogType, entry: PurchaseEntry) => void;
  onOpenAssessment: (entry: PurchaseEntry) => void;
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
  whiteSpace: "nowrap" as const,
  borderBottom: "1px solid",
  borderColor: "divider",
  userSelect: "text" as const,
};

export function PurchaseListTable({
  rows,
  selectedId,
  onSelect,
  selectedIds,
  onSelectionChange,
  onAction,
  onOpenAssessment,
}: PurchaseListTableProps) {
  const { t } = useTranslation();

  // Tracks which row IDs have their phone number revealed
  const [revealedPhoneIds, setRevealedPhoneIds] = useState<Set<string>>(
    new Set(),
  );

  const handleTogglePhone = (id: string) => {
    setRevealedPhoneIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleRow = (id: string) => {
    if (!onSelectionChange || !selectedIds) return;
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onSelectionChange(next);
  };

  const columns = [
    { key: "no", label: t("page.purchase.list.col.no"), width: 40 },
    { key: "checkbox", label: t("page.purchase.list.col.select"), width: 20 },
    { key: "status", label: t("page.purchase.list.col.status"), width: 148 },
    {
      key: "receiptNumber",
      label: t("page.purchase.list.col.receiptNumber"),
      width: 96,
    },
    { key: "content", label: t("page.purchase.list.col.content"), width: 180 },
    {
      key: "quantity",
      label: t("page.purchase.list.col.quantity"),
      width: 64,
      align: "right" as const,
    },
    {
      key: "assignedEmployee",
      label: t("page.purchase.list.col.assignedEmployee"),
      width: 130,
    },
    {
      key: "updatedAt",
      label: t("page.purchase.list.col.updatedAt"),
      width: 180,
    },
    {
      key: "createdAt",
      label: t("page.purchase.list.col.createdAt"),
      width: 200,
    },
    {
      key: "customerPhone",
      label: t("page.purchase.list.col.phoneNumber.label"),
      width: 200,
      align: "center",
    },
    { key: "action", label: "", width: 36 },
  ];

  return (
    <Box sx={{ flex: 1, overflow: "auto" }}>
      <TableContainer
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
        }}
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
            {rows.map((row, index) => {
              const selected =
                selectedId != null && String(selectedId) === String(row.id);
              const rowChecked = selectedIds?.has(String(row.id)) ?? false;

              return (
                <TableRow
                  key={row.id}
                  hover
                  selected={selected}
                  onClick={() => onSelect?.(row)}
                  onDoubleClick={() => onOpenAssessment(row)}
                  sx={{
                    cursor: "pointer",
                    "&:last-child td": { border: 0 },
                    "&.Mui-selected": {
                      bgcolor: "action.selected",
                    },
                    "&.Mui-selected:hover": {
                      bgcolor: "action.selected",
                    },
                  }}
                >
                  <TableCell
                    sx={{
                      ...tdSx,
                      color: "text.secondary",
                      fontSize: "0.8rem",
                    }}
                  >
                    {String(index + 1).padStart(3, "0")}
                  </TableCell>
                  <TableCell
                    padding="checkbox"
                    sx={{ ...tdSx, px: 0.5 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleRow(String(row.id));
                    }}
                    onDoubleClick={(e) => e.stopPropagation()}
                  >
                    <Checkbox
                      size="small"
                      checked={rowChecked}
                      sx={{ p: 0.5 }}
                    />
                  </TableCell>
                  <TableCell sx={tdSx}>
                    <PurchaseStatusChip status={row.status} />
                  </TableCell>

                  <TableCell
                    sx={{
                      ...tdSx,
                      fontSize: "0.82rem",
                      fontFamily: "monospace",
                      fontWeight: 600,
                    }}
                  >
                    {row.receiptNumber}
                  </TableCell>

                  <TableCell sx={{ ...tdSx, fontSize: "0.82rem" }}>
                    {row.content}
                  </TableCell>

                  <TableCell
                    sx={{
                      ...tdSx,
                      textAlign: "right",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                    }}
                  >
                    {row.quantity}
                  </TableCell>

                  <TableCell sx={{ ...tdSx, fontSize: "0.82rem" }}>
                    {row.assignedEmployee}
                  </TableCell>

                  <TableCell
                    sx={{ ...tdSx, pr: 0.5 }}
                    onClick={(event) => event.stopPropagation()}
                    onDoubleClick={(event) => event.stopPropagation()}
                  >
                    {row.updatedAt}
                  </TableCell>

                  <TableCell
                    sx={{ ...tdSx, pr: 0.5 }}
                    onClick={(event) => event.stopPropagation()}
                    onDoubleClick={(event) => event.stopPropagation()}
                  >
                    {row.createdAt}
                  </TableCell>

                  <TableCell
                    sx={{
                      ...tdSx,
                      textAlign: "center",
                      verticalAlign: "middle",
                    }}
                    onClick={(event) => event.stopPropagation()}
                    onDoubleClick={(event) => event.stopPropagation()}
                  >
                    {(() => {
                      const rowId = String(row.id);
                      const revealed = revealedPhoneIds.has(rowId);
                      return (
                        <Box
                          sx={{
                            position: "relative",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            height: 30,
                            minWidth: 120,
                          }}
                        >
                          {/* Hidden state — button */}
                          <Box
                            sx={{
                              position: "absolute",
                              display: "flex",
                              justifyContent: "center",
                              opacity: revealed ? 0 : 1,
                              pointerEvents: revealed ? "none" : "auto",
                              transition: "opacity 220ms ease",
                            }}
                          >
                            <Button
                              variant="outlined"
                              color="inherit"
                              size="small"
                              endIcon={
                                <LocalPhoneOutlinedIcon
                                  sx={{ fontSize: "0.95rem" }}
                                />
                              }
                              onClick={() => handleTogglePhone(rowId)}
                              sx={{
                                textTransform: "none",
                                whiteSpace: "nowrap",
                                mt: 0.5,
                              }}
                            >
                              <Typography variant="caption">
                                {t("page.purchase.list.col.phoneNumber.action")}
                              </Typography>
                            </Button>
                          </Box>

                          {/* Revealed state — phone number + hide button */}
                          <Box
                            sx={{
                              position: "absolute",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 0.5,
                              opacity: revealed ? 1 : 0,
                              pointerEvents: revealed ? "auto" : "none",
                              transition: "opacity 220ms ease",
                              mt: 0.5,
                            }}
                          >
                            <Typography
                              variant="inherit"
                              sx={{
                                whiteSpace: "nowrap",
                              }}
                            >
                              {row.customerPhone ?? "—"}
                            </Typography>
                            <Button
                              variant="text"
                              color="inherit"
                              size="small"
                              onClick={() => handleTogglePhone(rowId)}
                              sx={{
                                minWidth: 0,
                                width: 35,
                                height: 15,
                                borderRadius: "50%",
                                color: "text.disabled",
                                "&:hover": { color: "text.secondary" },
                              }}
                            >
                              <VisibilityOffOutlinedIcon
                                sx={{ fontSize: "0.95rem" }}
                              />
                            </Button>
                          </Box>
                        </Box>
                      );
                    })()}
                  </TableCell>

                  <TableCell
                    sx={{ ...tdSx, px: 0.5, userSelect: "none" }}
                    onClick={(event) => event.stopPropagation()}
                    onDoubleClick={(event) => event.stopPropagation()}
                  >
                    <PurchaseRowActionMenu
                      entry={row}
                      onAction={onAction}
                      onOpen={onOpenAssessment}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}


