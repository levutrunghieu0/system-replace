import type { ReactNode } from "react";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import SellIcon from "@mui/icons-material/Sell";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import InventoryIcon from "@mui/icons-material/Inventory";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PersonIcon from "@mui/icons-material/Person";
import StoreIcon from "@mui/icons-material/Store";
// Sub-menu icons
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import ChecklistIcon from '@mui/icons-material/Checklist'
import DownloadingIcon from '@mui/icons-material/Downloading'
import CalculateIcon from '@mui/icons-material/Calculate'
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline'
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt'
import SettingsIcon from '@mui/icons-material/Settings'
import DashboardIcon from "@mui/icons-material/Dashboard";
import ListAltIcon from "@mui/icons-material/ListAlt";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import FindInPageIcon from "@mui/icons-material/FindInPage";
import SearchIcon from "@mui/icons-material/Search";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import MoveToInboxIcon from "@mui/icons-material/MoveToInbox";
import OutboxIcon from "@mui/icons-material/Outbox";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import GroupIcon from "@mui/icons-material/Group";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import AssessmentIcon from "@mui/icons-material/Assessment";
import TouchAppIcon  from '@mui/icons-material/TouchApp'


export interface SubMenuItem {
  key: string;
  /** Dot-notation i18n key relative to menu.secondary.<parentKey> */
  labelKey: string;
  path: string;
  icon: ReactNode;
}

export interface PrimaryMenuItem {
  key: string;
  /** Dot-notation i18n key relative to menu.primary */
  labelKey: string;
  icon: ReactNode;
  subItems: SubMenuItem[];
  path?: string;
}


export const primaryMenuItems: PrimaryMenuItem[] = [
  {
    key: "front",
    labelKey: "menu.primary.front",
    icon: <PointOfSaleIcon />,
    subItems: [], // Không có submenu
    path: "/front", // Thêm path để truy cập trực tiếp
  } ,
  {
    key: "purchaseReception",
    labelKey: "menu.primary.purchaseReception",
    icon: <TouchAppIcon  />,
    subItems: [
      {
        key: "list",
        labelKey: "menu.secondary.purchaseReception.list",
        path: "/purchase-reception",
        icon: <ListAltIcon />,
      },
      {
        key: "register",
        labelKey: "menu.secondary.purchaseReception.register",
        path: "/purchase-reception/new",
        icon: <NoteAddIcon />,
      },
    ],
  },
  {
    key: "purchase",
    labelKey: "menu.primary.purchase",
    icon: <ManageSearchIcon />,
    subItems: [
      {
        key: "list",
        labelKey: "menu.secondary.purchase.list",
        path: "/purchase",
        icon: <ListAltIcon />,
      },
      {
        key: "detail",
        labelKey: "menu.secondary.purchase.detail",
        path: "/purchase/detail",
        icon: <FindInPageIcon />,
      },
    ],
  },
  {
    key: "inventory",
    labelKey: "menu.primary.inventory",
    icon: <InventoryIcon />,
    subItems: [
      
      {
        key: "list",
        labelKey: "menu.secondary.inventory.list",
        path: "/inventory",
        icon: <ListAltIcon />,
      },
      {
        key: "search",
        labelKey: "menu.secondary.inventory.search",
        path: "/inventory/search",
        icon: <SearchIcon />,
      },
      {
        key: "grossRegistration",
        labelKey: "menu.secondary.inventory.grossRegistration",
        path: "/inventory/gross",
        icon: <EditNoteIcon />,
      },
      {
        key: "grossDelete",
        labelKey: "menu.secondary.inventory.grossDelete",
        path: "/inventory/gross-delete",
        icon: <DeleteSweepIcon />,
      },
      {
        key: "priceIssue",
        labelKey: "menu.secondary.inventory.priceIssue",
        path: "/inventory/price-issue",
        icon: <LocalOfferIcon />,
      },
      {
        key: "priceIssueV2",
        labelKey: "menu.secondary.inventory.priceIssueV2",
        path: "/inventory/price-issue-v2",
        icon: <LocalOfferIcon />,
      },
      { key: 'shelfRegistration', labelKey: 'menu.secondary.tanazaoroshi.shelfRegistration', path: '/inventory/shelf-registration', icon: <QrCodeScannerIcon /> },
      { key: 'classification',   labelKey: 'menu.secondary.tanazaoroshi.classification',   path: '/inventory/classification',    icon: <CalculateIcon /> },
      { key: 'handy',            labelKey: 'menu.secondary.tanazaoroshi.handy',            path: '/inventory/handy',             icon: <SettingsIcon /> },
      { key: 'dataReceive',      labelKey: 'menu.secondary.tanazaoroshi.dataReceive',      path: '/inventory/data-receive',      icon: <DownloadingIcon /> },
      { key: 'correction',       labelKey: 'menu.secondary.tanazaoroshi.correction',       path: '/inventory/correction',        icon: <DriveFileRenameOutlineIcon /> },
      { key: 'update',           labelKey: 'menu.secondary.tanazaoroshi.update',           path: '/inventory/update',            icon: <SystemUpdateAltIcon /> },
      { key: 'checklist',        labelKey: 'menu.secondary.tanazaoroshi.checklist',        path: '/inventory/checklist',         icon: <ChecklistIcon /> },
    ],
  },
  {
    key: "warehouse",
    labelKey: "menu.primary.warehouse",
    icon: <WarehouseIcon />,
    subItems: [
      { key: 'list', labelKey: 'menu.secondary.warehouse.list', path: '/warehouse', icon: <ListAltIcon /> },
      { key: 'transferIn', labelKey: 'menu.secondary.warehouse.transferIn', path: '/warehouse/transfer-in', icon: <MoveToInboxIcon /> },
      { key: 'transferOut', labelKey: 'menu.secondary.warehouse.transferOut', path: '/warehouse/transfer-out', icon: <OutboxIcon /> },
      { key: 'consignmentRepurchase', labelKey: 'menu.secondary.warehouse.consignmentRepurchase', path: '/warehouse/consignment', icon: <AssignmentReturnIcon /> },
      { key: 'csvPurchase', labelKey: 'menu.secondary.warehouse.csvPurchase', path: '/warehouse/csv-purchase', icon: <NoteAddIcon /> },
      { key: 'csvPurchaseCorrection', labelKey: 'menu.secondary.warehouse.csvPurchaseCorrection', path: '/warehouse/csv-purchase-correction', icon: <EditNoteIcon /> },
      { key: 'provisionalL2', labelKey: 'menu.secondary.warehouse.provisionalL2', path: '/warehouse/provisional-l2', icon: <PendingActionsIcon /> },
    ],
  },
  {
    key: "ecTransaction",
    labelKey: "menu.primary.ecTransaction",
    icon: <LocalShippingIcon />,
    subItems: [
      {
        key: "list",
        labelKey: "menu.secondary.ecTransaction.list",
        path: "/ec",
        icon: <ListAltIcon />,
      },
      {
        key: "import",
        labelKey: "menu.secondary.ecTransaction.import",
        path: "/ec/import",
        icon: <CloudDownloadIcon />,
      },
    ],
  },
  {
    key: "member",
    labelKey: "menu.primary.member",
    icon: <PersonIcon />,
    subItems: [
      {
        key: "list",
        labelKey: "menu.secondary.member.list",
        path: "/users",
        icon: <GroupIcon />,
      },
      {
        key: "detail",
        labelKey: "menu.secondary.member.detail",
        path: "/users/detail",
        icon: <ManageAccountsIcon />,
      },
    ],
  },
  {
    key: "storeOperation",
    labelKey: "menu.primary.storeOperation",
    icon: <StoreIcon />,
    subItems: [
      {
        key: "dashboard",
        labelKey: "menu.secondary.storeOperation.dashboard",
        path: "/store",
        icon: <DashboardIcon />,
      },
      {
        key: "report",
        labelKey: "menu.secondary.storeOperation.report",
        path: "/store/report",
        icon: <AssessmentIcon />,
      },
    ],
  },
];
