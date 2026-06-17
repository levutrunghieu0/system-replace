import { useState } from "react";
import { useTranslation } from "react-i18next";

import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import BlockIcon from "@mui/icons-material/Block";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PhoneIcon from "@mui/icons-material/Phone";
import PrintIcon from "@mui/icons-material/Print";

import type { PurchaseEntry, PurchaseListDialogType } from "../types";
import {
  canCancelPurchaseReception,
  canReissueStoreCopy,
  // canReissueCustomerTicket,
} from "../utils/purchaseListRules";

interface PurchaseRowActionMenuProps {
  entry: PurchaseEntry;
  onAction: (type: PurchaseListDialogType, entry: PurchaseEntry) => void;
  onOpen: (entry: PurchaseEntry) => void;
}

export function PurchaseRowActionMenu({
  entry,
  onAction,
  onOpen,
}: PurchaseRowActionMenuProps) {
  const { t } = useTranslation();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const handleClose = () => setAnchor(null);

  const handleAction = (type: PurchaseListDialogType) => {
    handleClose();
    onAction(type, entry);
  };

  const itemSx = { fontSize: "0.85rem", py: 1 };
  const iconSx = {
    fontSize: "1rem",
    color: "text.secondary",
    mr: 1.5,
    flexShrink: 0,
  };

  return (
    <>
      <IconButton
        size="small"
        aria-label={t("page.purchase.list.menu.action")}
        onClick={(event) => {
          event.stopPropagation();
          setAnchor(event.currentTarget);
        }}
        sx={{ color: "text.disabled", p: 0.5 }}
      >
        <MoreVertIcon sx={{ fontSize: "1.1rem" }} />
      </IconButton>

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={handleClose}
        onClick={(event) => event.stopPropagation()}
        slotProps={{
          paper: {
            sx: {
              minWidth: 240,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.16)",
            },
          },
        }}
      >
        <MenuItem
          dense
          onClick={() => {
            handleClose();
            onOpen(entry);
          }}
          sx={itemSx}
        >
          {t("page.purchase.list.menu.open")}
        </MenuItem>

        <Divider />

        {/* <MenuItem
          dense
          disabled={!canReissueCustomerTicket(entry)}
          onClick={() => handleAction("customerTicketReissue")}
          sx={itemSx}
        >
          <PrintIcon sx={iconSx} />
          {t("page.purchase.list.menu.customerTicketReissue")}
        </MenuItem> */}

        {/* E-41 Rule 1: settled / cancelled receptions cannot reissue the store copy */}
        <MenuItem
          dense
          disabled={!canReissueStoreCopy(entry)}
          onClick={() => handleAction("storeCopy")}
          sx={itemSx}
        >
          <PrintIcon sx={iconSx} />
          {t("page.purchase.list.menu.storeCopy")}
        </MenuItem>

        <MenuItem dense onClick={() => handleAction("branchLabel")} sx={itemSx}>
          <PrintIcon sx={iconSx} />
          {t("page.purchase.list.menu.branchLabel")}
        </MenuItem>

        <MenuItem dense onClick={() => handleAction("sms")} sx={itemSx}>
          <CloseIcon sx={iconSx} />
          {t("page.purchase.list.menu.smsStop")}
        </MenuItem>

        <MenuItem dense onClick={() => handleAction("phoneNumber")} sx={itemSx}>
          <PhoneIcon sx={iconSx} />
          {t("page.purchase.list.menu.phoneDisplay", {
            defaultValue: "電話番号",
          })}
        </MenuItem>

        <MenuItem dense onClick={handleClose} sx={itemSx}>
          {t("page.purchase.list.menu.consentView")}
        </MenuItem>

        <MenuItem dense onClick={handleClose} sx={itemSx}>
          {t("page.purchase.list.menu.consentRegister")}
        </MenuItem>

        <Divider />

        <MenuItem
          dense
          disabled={!canCancelPurchaseReception(entry)}
          onClick={() => handleAction("cancelReception")}
          sx={itemSx}
        >
          <BlockIcon sx={iconSx} />
          {t("page.purchase.list.menu.cancelReception")}
        </MenuItem>

        <Divider />

        <MenuItem
          dense
          onClick={handleClose}
          sx={{ ...itemSx, color: "error.main" }}
        >
          <DeleteOutlinedIcon sx={{ ...iconSx, color: "error.main" }} />
          {t("page.purchase.list.menu.delete")}
        </MenuItem>
      </Menu>
    </>
  );
}
