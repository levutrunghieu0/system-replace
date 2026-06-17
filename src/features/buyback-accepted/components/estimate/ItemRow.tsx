import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useTranslation } from "react-i18next";
import { useBuyback } from "../../context/BuybackContext";
import type { EstimateItem } from "../../types";
import { GROSS_GRADE_RANGES } from "../../types";
import { couponBonusForItem } from "../../utils/estimateTotals";

interface ItemRowProps {
  item: EstimateItem;
}

export function ItemRow({ item }: ItemRowProps) {
  const { t } = useTranslation();
  const {
    coupon,
    reviseMode,
    toggleItemReturned,
    updateItemPrice,
    updateItemQuantity,
  } = useBuyback();

  const isEco = item.itemType === "eco";
  const isGross = item.itemType === "gross";
  const hasQuantityControl = (isGross || isEco) && reviseMode && !item.returned;

  const handlePriceChange = (raw: string) => {
    const num = parseInt(raw.replace(/[^0-9]/g, ""), 10);
    if (isNaN(num)) return;
    if (isGross && item.grossGrade) {
      const { min, max } = GROSS_GRADE_RANGES[item.grossGrade];
      updateItemPrice(item.id, Math.min(max, Math.max(min, num)));
    } else if (!isEco) {
      updateItemPrice(item.id, num);
    }
  };

  const total = item.estimatedPrice * item.quantity;
  const bonus = couponBonusForItem(item, coupon);

  const returnedTextSx = item.returned
    ? { textDecoration: "line-through", color: "text.disabled" }
    : undefined;

  return (
    <TableRow
      hover
      sx={{
        height: 86,
        bgcolor: item.returned ? "rgba(237, 108, 2, 0.08)" : undefined,
        "&:nth-of-type(even)": {
          bgcolor: item.returned ? "rgba(237, 108, 2, 0.08)" : "grey.50",
        },
      }}
    >
      <TableCell sx={{ color: "text.secondary", whiteSpace: "nowrap" }}>
        <Typography
          variant="body2"
          sx={{
            fontSize: "0.82rem",
            fontWeight: 700,
            color: "text.secondary",
          }}
        >
          {item.no}
        </Typography>
      </TableCell>

      <TableCell sx={{ whiteSpace: "nowrap" }}>
        <Typography
          variant="body2"
          sx={{ fontSize: "0.84rem", fontWeight: 700, ...returnedTextSx }}
        >
          {item.genre}
        </Typography>
      </TableCell>

      <TableCell>
        <Box
          sx={{
            minHeight: 62,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 0.25,
            minWidth: 0,
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontSize: "0.73rem",
              fontWeight: 700,
              lineHeight: 1.2,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              ...returnedTextSx,
            }}
          >
            {item.maker}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              fontSize: "0.85rem",
              fontWeight: 800,
              lineHeight: 1.3,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              ...returnedTextSx,
            }}
          >
            {item.name}
          </Typography>

          {item.comment && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontSize: "0.73rem",
                lineHeight: 1.25,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {item.comment}
            </Typography>
          )}
        </Box>
      </TableCell>

      <TableCell align="right">
        {reviseMode && !isEco && !item.returned ? (
          <TextField
            value={`¥${item.estimatedPrice.toLocaleString()}`}
            onChange={(e) => handlePriceChange(e.target.value)}
            size="small"
            sx={{
              width: 112,
              "& .MuiOutlinedInput-root": {
                height: 42,
                borderRadius: 2,
                bgcolor: "background.paper",
                "& input": {
                  textAlign: "right",
                  fontWeight: 800,
                  fontSize: "0.82rem",
                  px: 1.25,
                },
              },
            }}
            slotProps={{ htmlInput: { inputMode: "numeric" } }}
          />
        ) : (
          <Typography
            variant="body2"
            sx={{
              textAlign: "right",
              fontSize: "0.84rem",
              fontWeight: 700,
              whiteSpace: "nowrap",
              ...returnedTextSx,
            }}
          >
            ¥{item.estimatedPrice.toLocaleString()}
          </Typography>
        )}
      </TableCell>

      <TableCell align="center">
        <Box
          sx={{
            height: 42,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.6,
            minWidth: 86,
          }}
        >
          {hasQuantityControl && (
            <IconButton
              size="small"
              aria-label={t("buybackWizard.common.decrease", {
                defaultValue: "decrease",
              })}
              onClick={() => updateItemQuantity(item.id, -1)}
              sx={{
                width: 30,
                height: 30,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                "&:hover": {
                  bgcolor: "primary.dark",
                },
              }}
            >
              <RemoveIcon fontSize="small" />
            </IconButton>
          )}

          <Typography
            variant="body2"
            sx={{
              width: 22,
              textAlign: "center",
              fontSize: "0.86rem",
              fontWeight: 800,
              ...returnedTextSx,
            }}
          >
            {item.quantity}
          </Typography>

          {hasQuantityControl && (
            <IconButton
              size="small"
              aria-label={t("buybackWizard.common.increase", {
                defaultValue: "increase",
              })}
              onClick={() => updateItemQuantity(item.id, 1)}
              sx={{
                width: 30,
                height: 30,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                "&:hover": {
                  bgcolor: "primary.dark",
                },
              }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </TableCell>

      <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
        {bonus > 0 && !item.returned && (
          <Typography
            variant="body2"
            sx={{ fontSize: "0.82rem", fontWeight: 700, color: "primary.main" }}
          >
            +¥{bonus.toLocaleString()}
          </Typography>
        )}
      </TableCell>

      <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
        <Typography
          variant="body2"
          sx={{ fontSize: "0.84rem", fontWeight: 700, ...returnedTextSx }}
        >
          ¥{total.toLocaleString()}
        </Typography>
      </TableCell>

      <TableCell align="center" sx={{ px: 0.5 }}>
        <Checkbox
          checked={item.returned}
          onChange={() => toggleItemReturned(item.id)}
          color="warning"
          slotProps={{
            input: {
              "aria-label": t("buybackWizard.estimate.table.returnFlag"),
            },
          }}
        />
      </TableCell>
    </TableRow>
  );
}
