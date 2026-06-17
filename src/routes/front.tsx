import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
import Paper from "@mui/material/Paper";
import Switch from "@mui/material/Switch";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import ContactlessIcon from "@mui/icons-material/Contactless";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ListAltIcon from "@mui/icons-material/ListAlt";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import RemoveIcon from "@mui/icons-material/Remove";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import TuneIcon from "@mui/icons-material/Tune";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useLayoutConfig } from "../hooks/useLayoutConfig";
import { BuyBackReceptionDialogs } from "../features/front/components/BuyBackReceptionDialogs";
import { BuyBackReceptionWorkspace } from "../features/front/components/BuyBackReceptionWorkspace";
import { emptyBuyBackReception } from "../features/front/constants";
import type {
  BuyBackReceptionDialogMode,
  BuyBackReceptionState,
} from "../features/front/types";

export const Route = createFileRoute("/front")({
  // buy-back: receive success key from the consent re-creation flow (§5)
  validateSearch: (s: Record<string, unknown>) => ({
    success: typeof s.success === "string" ? s.success : undefined,
  }),
  component: FrontPage,
});

type FrontMode =
  | "sale-empty"
  | "sale-cart"
  | "payment"
  | "register-count"
  | "register-confirmed"
  | "buyback-reception";
type DialogMode =
  | "otherSettlement"
  | "cardSelect"
  | "cardAmount"
  | "paymentComplete"
  | "installment"
  | "cardProcessing"
  | "barcodeAmount"
  | "barcodeScan"
  | "creditCancelMode"
  | "creditCancelConfirm"
  | "creditCancelReason"
  | "creditCancelCompleteNoRefund"
  | "creditCancelCompleteRefund"
  | BuyBackReceptionDialogMode
  | null;
type PayMethod = "credit" | "barcode" | "emoney" | "cash";

interface PaymentState {
  credit: number;
  barcode: number;
  emoney: number;
  cash: number;
}

interface ProductCatalogItem {
  code: string;
  maker: string;
  name: string;
  comment: string;
  attr: string;
  unitPrice: number;
  tax: string;
  priceBonus: number;
  priceDiscount: number;
  discountPercent: number;
  note: string;
}

interface CartItem extends ProductCatalogItem {
  qty: number;
  createdAt: number;
}

type CouponCode = "couponA" | "couponB" | "couponC" | "couponD";
type DisplayMode = "detailed" | "compact";
type SortMode =
  | "newestDesc"
  | "newestAsc"
  | "nameAsc"
  | "nameDesc"
  | "amountDesc"
  | "amountAsc";

interface SaleFilterState {
  attr: "all" | "S" | "M" | "L" | "-";
  tax: "all" | "税込";
  priceBand: "all" | "low" | "mid" | "high";
}

interface CouponDefinition {
  code: CouponCode;
  percentOff?: number;
  amountOff?: number;
}

const BLUE = "#1478f0";
const BORDER = "#d8dee6";
const HEADER_BG = "#f4f6f8";
const SOFT_BLUE = "#eef6ff";
const denominations = [
  "10,000円",
  "5,000円",
  "2,000円",
  "1,000円",
  "500円",
  "100円",
  "50円",
  "10円",
  "5円",
  "1円",
];
const denominationValues = [10000, 5000, 2000, 1000, 500, 100, 50, 10, 5, 1];
const emptyPayments: PaymentState = {
  credit: 0,
  barcode: 0,
  emoney: 0,
  cash: 0,
};
const emptySaleFilters: SaleFilterState = {
  attr: "all",
  tax: "all",
  priceBand: "all",
};
const couponDefinitions: CouponDefinition[] = [
  { code: "couponA" },
  { code: "couponB", percentOff: 5 },
  { code: "couponC", percentOff: 10 },
  { code: "couponD", amountOff: 1000 },
];
const previousOpeningPresetCounts = [10, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const previousOpeningPresetAdjustment = "";
const previousCashReserveAmount = 400000000;
const productCatalog: ProductCatalogItem[] = [
  {
    code: "12345\n67890\n12345",
    maker: "メーカー",
    name: "JORDAN BRANS AS M J ESS MMBR JK",
    comment: "詳細コメント",
    attr: "S",
    unitPrice: 8800,
    tax: "税込",
    priceBonus: 1000,
    priceDiscount: 0,
    discountPercent: 0,
    note: "ああああ",
  },
  {
    code: "12345\n67890\n12345",
    maker: "メーカー",
    name: "NIKE AIR MAX 90 BLACK/WHITE",
    comment: "詳細コメント",
    attr: "M",
    unitPrice: 12800,
    tax: "税込",
    priceBonus: 0,
    priceDiscount: 2560,
    discountPercent: 20,
    note: "ああああ",
  },
  {
    code: "12345\n67890\n12345",
    maker: "メーカー",
    name: "ADIDAS ORIGINALS TEE TREFOIL LOGO",
    comment: "詳細コメント",
    attr: "L",
    unitPrice: 3200,
    tax: "税込",
    priceBonus: 0,
    priceDiscount: 0,
    discountPercent: 0,
    note: "ああああ",
  },
];
const formatYen = (value: number) => `¥${value.toLocaleString()}`;
const formatFlowAmount = (value: number) =>
  `${value >= 0 ? "+" : "-"}¥${Math.abs(value).toLocaleString()}`;
const normalizeAmountInput = (value: string) =>
  value.replace(/[^0-9]/g, "").replace(/^0+(?=\d)/, "");
const getCartTotal = (items: CartItem[]) =>
  items.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
const normalizeRegisterCountInput = (value: string) =>
  Number(value.replace(/[^0-9]/g, "")) || 0;
const normalizeAdjustmentInput = (value: string) => {
  const compact = value.replace(/\s/g, "");
  if (compact === "" || compact === "-") return compact;
  const sign = compact.startsWith("-") ? "-" : "";
  const digits = compact.replace(/[^0-9]/g, "");
  if (!digits) return sign;
  return `${sign}${digits}`;
};

function getCouponDiscount(coupon: CouponCode, subtotal: number) {
  const rule = couponDefinitions.find((item) => item.code === coupon);
  if (!rule) return 0;

  if (rule.percentOff) {
    return Math.floor((subtotal * rule.percentOff) / 100);
  }
  if (rule.amountOff) {
    return Math.min(rule.amountOff, subtotal);
  }
  return 0;
}

function getPriceBand(unitPrice: number): SaleFilterState["priceBand"] {
  if (unitPrice < 5000) return "low";
  if (unitPrice < 10000) return "mid";
  return "high";
}

function findProductByScan(scannedCode: string): ProductCatalogItem {
  const product = productCatalog.find((item) => item.code === scannedCode);
  if (product) return product;

  return {
    code: scannedCode,
    maker: "メーカー",
    name: `SCAN ITEM ${scannedCode}`,
    comment: "詳細コメント",
    attr: "-",
    unitPrice: 1000,
    tax: "税込",
    priceBonus: 0,
    priceDiscount: 0,
    discountPercent: 0,
    note: "",
  };
}

function isBuyBackReceptionDialog(
  dialog: DialogMode,
): dialog is BuyBackReceptionDialogMode {
  return (
    dialog === "buybackStaffScan" ||
    dialog === "buybackReceiptPrint" ||
    dialog === "buybackBranchPrint" ||
    dialog === "buybackComplete"
  );
}

// ─── Buy-back: consent form re-creation success banner (§5) ──────────────────

function SuccessBanner({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 2,
        py: 1.25,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "primary.light",
        borderLeft: "4px solid",
        borderLeftColor: "primary.main",
        flexShrink: 0,
      }}
    >
      <InfoOutlinedIcon
        sx={{ fontSize: "1.1rem", color: "primary.main", flexShrink: 0 }}
      />
      <Typography variant="body2" sx={{ flex: 1, fontWeight: 500 }}>
        {message}
      </Typography>
      <IconButton
        size="small"
        onClick={onClose}
        sx={{ color: "text.secondary", p: 0.25 }}
      >
        <CloseIcon sx={{ fontSize: "1rem" }} />
      </IconButton>
    </Box>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function FrontPage() {
  const { t } = useTranslation();
  const { success } = Route.useSearch();
  const [bannerVisible, setBannerVisible] = useState(
    success === "recreateCompleted",
  );
  const [mode, setMode] = useState<FrontMode>("sale-empty");
  const [dialog, setDialog] = useState<DialogMode>(null);
  const [selectedCoupons, setSelectedCoupons] = useState<CouponCode[]>([]);
  const [selectedInstallment, setSelectedInstallment] = useState("1回");
  const [showReceipt, setShowReceipt] = useState(false);
  const [payments, setPayments] = useState<PaymentState>(emptyPayments);
  const [registerCounts, setRegisterCounts] = useState<number[]>(() =>
    denominations.map((_, index) => (index === 0 ? 10 : 0)),
  );
  const [registerAdjustment, setRegisterAdjustment] = useState("");
  const [scanValue, setScanValue] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [saleFilters, setSaleFilters] =
    useState<SaleFilterState>(emptySaleFilters);
  const [sortMode, setSortMode] = useState<SortMode>("newestDesc");
  const [displayMode, setDisplayMode] = useState<DisplayMode>("detailed");
  const [buyBackReception, setBuyBackReception] =
    useState<BuyBackReceptionState>(emptyBuyBackReception);

  const subtotal = getCartTotal(cartItems);
  const productDiscount = cartItems.reduce(
    (sum, item) => sum + item.priceDiscount,
    0,
  );
  const couponDiscount = selectedCoupons.reduce(
    (sum, coupon) => sum + getCouponDiscount(coupon, subtotal),
    0,
  );
  const taxableAmount = Math.max(
    subtotal - productDiscount - couponDiscount,
    0,
  );
  const consumptionTax = Math.round(taxableAmount * 0.1);
  const paymentTotal = taxableAmount + consumptionTax;
  const paidTotal =
    payments.credit + payments.barcode + payments.emoney + payments.cash;
  const paymentBalance = Math.max(paymentTotal - paidTotal, 0);

  const filteredCartItems = cartItems.filter((item) => {
    if (saleFilters.attr !== "all" && item.attr !== saleFilters.attr)
      return false;
    if (saleFilters.tax !== "all" && item.tax !== saleFilters.tax) return false;
    if (
      saleFilters.priceBand !== "all" &&
      getPriceBand(item.unitPrice) !== saleFilters.priceBand
    )
      return false;
    return true;
  });

  const visibleCartItems = [...filteredCartItems].sort((a, b) => {
    if (sortMode === "newestDesc") return b.createdAt - a.createdAt;
    if (sortMode === "newestAsc") return a.createdAt - b.createdAt;
    if (sortMode === "nameAsc") return a.name.localeCompare(b.name);
    if (sortMode === "nameDesc") return b.name.localeCompare(a.name);
    if (sortMode === "amountDesc")
      return b.unitPrice * b.qty - a.unitPrice * a.qty;
    return a.unitPrice * a.qty - b.unitPrice * b.qty;
  });

  const resetPayments = () => setPayments(emptyPayments);
  const addProductByScan = () => {
    const now = Date.now();
    const code =
      scanValue.trim() ||
      productCatalog[cartItems.length % productCatalog.length].code;
    const product = findProductByScan(code);
    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.code === product.code,
      );
      if (existingItem) {
        return currentItems.map((item) =>
          item.code === product.code ? { ...item, qty: item.qty + 1 } : item,
        );
      }
      return [...currentItems, { ...product, qty: 1, createdAt: now }];
    });
    setScanValue("");
    resetPayments();
    setMode("sale-cart");
  };
  const updateCartQuantity = (code: string, nextQty: number) => {
    setCartItems((currentItems) =>
      currentItems
        .map((item) =>
          item.code === code ? { ...item, qty: Math.max(nextQty, 0) } : item,
        )
        .filter((item) => item.qty > 0),
    );
    resetPayments();
  };
  const completePayment = (method: PayMethod, amount?: number) => {
    setPayments((currentPayments) => {
      const currentPaidTotal =
        currentPayments.credit +
        currentPayments.barcode +
        currentPayments.emoney +
        currentPayments.cash;
      const currentBalance = Math.max(paymentTotal - currentPaidTotal, 0);
      const requestedAmount = amount ?? currentBalance;
      const appliedAmount =
        method === "cash"
          ? requestedAmount
          : Math.min(requestedAmount, currentBalance);

      if (currentBalance === 0 || appliedAmount <= 0) return currentPayments;

      return {
        ...currentPayments,
        [method]: currentPayments[method] + appliedAmount,
      };
    });
  };
  const resetFlow = () => {
    setMode("sale-empty");
    setDialog(null);
    setSelectedCoupons([]);
    setSelectedInstallment("1回");
    setShowReceipt(false);
    setPayments(emptyPayments);
    setRegisterCounts(denominations.map((_, index) => (index === 0 ? 10 : 0)));
    setRegisterAdjustment("");
    setScanValue("");
    setSaleFilters(emptySaleFilters);
    setSortMode("newestDesc");
    setDisplayMode("detailed");
    setCartItems([]);
    setBuyBackReception(emptyBuyBackReception);
  };

  const title =
    mode === "buyback-reception"
      ? t("page.front.buyBackReception.title")
      : mode.startsWith("register")
        ? mode === "register-confirmed"
          ? t("page.front.title.registerSingleOpen")
          : t("page.front.title.registerOpen")
        : mode === "payment"
          ? t("page.front.title.payment")
          : mode === "sale-cart"
            ? t("page.front.title.sales")
            : t("page.front.title.front");

  const handlePrevOpeningReflect = () => {
    if (mode !== "register-count") return;

    setRegisterCounts([...previousOpeningPresetCounts]);
    setRegisterAdjustment(previousOpeningPresetAdjustment);
    setMode("register-confirmed");
  };

  const startBuyBackReception = () => {
    setBuyBackReception(emptyBuyBackReception);
    setMode("buyback-reception");
    setDialog("buybackStaffScan");
  };

  const updateBuyBackReception = (patch: Partial<BuyBackReceptionState>) => {
    setBuyBackReception((current) => ({ ...current, ...patch }));
  };

  const buyBackDialog = isBuyBackReceptionDialog(dialog) ? dialog : null;

  const actions = (() => {
    const makeAction = ({
      key,
      labelKey,
      variant = "outlined" as const,
      position = "left" as const,
      disabled = false,
      onClick,
      sx,
    }: {
      key: string;
      labelKey: string;
      variant?: "outlined" | "contained";
      position?: "left" | "right";
      disabled?: boolean;
      onClick: () => void;
      sx?: Record<string, unknown>;
    }) => ({
      key,
      label: t(labelKey),
      labelKey,
      variant,
      position,
      disabled,
      onClick,
      sx,
    });

    const stop = makeAction({
      key: "stop",
      labelKey: "page.front.action.stopWork",
      variant: "outlined",
      position: "left",
      onClick: resetFlow,
      sx: { minWidth: 88 },
    });

    const receptionTicketAction = makeAction({
      key: "reception-ticket",
      labelKey: "page.front.action.receptionTicket",
      variant: "outlined",
      position: "left",
      onClick: startBuyBackReception,
      sx: { minWidth: 110, fontWeight: 700 },
    });

    const receptionTicketBranchAction = makeAction({
      key: "reception-ticket-branch",
      labelKey: "page.front.action.receptionTicketBranch",
      variant: "outlined",
      position: "left",
      disabled:
        mode !== "buyback-reception" ||
        !buyBackReception.printedReceptionTicket,
      onClick: () => setDialog("buybackBranchPrint"),
      sx: { minWidth: 126, fontWeight: 700 },
    });

    const saleActionsLeft = [
      stop,
      makeAction({
        key: "delete-selected",
        labelKey: "page.front.action.deleteSelected",
        variant: "outlined",
        position: "left",
        disabled: true,
        onClick: () => undefined,
        sx: { minWidth: 104 },
      }),
      makeAction({
        key: "ticket-list",
        labelKey: "page.front.action.ticketList",
        variant: "outlined",
        position: "left",
        onClick: () => undefined,
        sx: { minWidth: 96 },
      }),
      receptionTicketAction,
      receptionTicketBranchAction,
      makeAction({
        key: "receipt-fix",
        labelKey: "page.front.action.receiptFix",
        variant: "outlined",
        position: "left",
        onClick: () => undefined,
        sx: { minWidth: 104 },
      }),
      makeAction({
        key: "correction",
        labelKey: "page.front.action.correction",
        variant: "outlined",
        position: "left",
        onClick: () => undefined,
        sx: { minWidth: 70 },
      }),
    ];

    if (mode === "buyback-reception") {
      return [
        stop,
        makeAction({
          key: "reception-ticket",
          labelKey: "page.front.action.receptionTicket",
          variant: "outlined",
          position: "left",
          disabled: !buyBackReception.staffCode,
          onClick: () => setDialog("buybackReceiptPrint"),
          sx: { minWidth: 110, fontWeight: 700 },
        }),
        makeAction({
          key: "reception-ticket-branch",
          labelKey: "page.front.action.receptionTicketBranch",
          variant: "outlined",
          position: "left",
          disabled: !buyBackReception.printedReceptionTicket,
          onClick: () => setDialog("buybackBranchPrint"),
          sx: { minWidth: 126, fontWeight: 700 },
        }),
        makeAction({
          key: "finish",
          labelKey: "page.front.action.finish",
          variant: "contained",
          position: "right",
          disabled:
            !buyBackReception.printedReceptionTicket ||
            (buyBackReception.branchCount > 1 &&
              !buyBackReception.printedBranchTicket),
          onClick: () => setDialog("buybackComplete"),
          sx: { minWidth: 112 },
        }),
      ];
    }

    if (mode === "sale-empty") {
      return [
        ...saleActionsLeft,
        makeAction({
          key: "checkout",
          labelKey: "page.front.action.checkout",
          variant: "contained",
          position: "right",
          disabled: true,
          onClick: () => undefined,
          sx: { minWidth: 124 },
        }),
      ];
    }

    if (mode === "sale-cart") {
      return [
        ...saleActionsLeft,
        makeAction({
          key: "checkout",
          labelKey: "page.front.action.checkout",
          variant: "contained",
          position: "right",
          disabled: cartItems.length === 0,
          onClick: () => setMode("payment"),
          sx: { minWidth: 124 },
        }),
      ];
    }

    if (mode === "payment") {
      return [
        makeAction({
          key: "stop",
          labelKey: "page.front.action.stopWork",
          variant: "outlined",
          position: "left",
          onClick: () => setMode(cartItems.length ? "sale-cart" : "sale-empty"),
          sx: { minWidth: 88 },
        }),
        makeAction({
          key: "payment-ticket-reprint",
          labelKey: "page.front.action.receiptReprint",
          variant: "outlined",
          position: "left",
          onClick: () => undefined,
          sx: { minWidth: 126 },
        }),
        makeAction({
          key: "reason-change",
          labelKey: "page.front.action.reasonChange",
          variant: "outlined",
          position: "left",
          onClick: () => setDialog("creditCancelMode"),
          sx: { minWidth: 96 },
        }),
        // 終了 は決済が完了（残額0）してから表示する
        ...(paymentBalance === 0 && paidTotal > 0
          ? [
              makeAction({
                key: "finish",
                labelKey: "page.front.action.finish",
                variant: "contained" as const,
                position: "right" as const,
                onClick: () => setMode("register-count"),
              }),
            ]
          : []),
      ];
    }

    if (mode === "register-confirmed") {
      return [
        makeAction({
          key: "stop",
          labelKey: "page.front.action.stopWork",
          variant: "outlined",
          position: "left",
          onClick: () => setMode("payment"),
          sx: { minWidth: 88 },
        }),
        makeAction({
          key: "run",
          labelKey: "page.front.action.execute",
          variant: "contained",
          position: "right",
          onClick: () => setShowReceipt(true),
        }),
      ];
    }

    return [
      makeAction({
        key: "stop",
        labelKey: "page.front.action.stopWork",
        variant: "outlined",
        position: "left",
        onClick: () => setMode("payment"),
        sx: { minWidth: 88 },
      }),
      makeAction({
        key: "prev-register",
        labelKey: "page.front.action.prevCloseReflect",
        variant: "outlined",
        position: "left",
        onClick: handlePrevOpeningReflect,
      }),
      makeAction({
        key: "run",
        labelKey: "page.front.action.execute",
        variant: "contained",
        position: "right",
        onClick: () => setShowReceipt(true),
      }),
    ];
  })();

  useLayoutConfig({
    title,
    showBackButton: mode !== "sale-empty",
    hideSecondaryNav: true,
    actions,
    onBack: () =>
      setMode(
        mode === "buyback-reception"
          ? "sale-empty"
          : mode === "payment"
            ? cartItems.length
              ? "sale-cart"
              : "sale-empty"
            : mode.startsWith("register")
              ? "payment"
              : "sale-empty",
      ),
  });

  return (
    <Box
      sx={{
        height: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      {(mode === "sale-empty" || mode === "sale-cart") && (
        <SaleWorkspace
          cartItems={cartItems}
          visibleCartItems={visibleCartItems}
          scanValue={scanValue}
          selectedCoupons={selectedCoupons}
          productDiscount={productDiscount}
          couponDiscount={couponDiscount}
          consumptionTax={consumptionTax}
          totalAfterDiscount={paymentTotal}
          saleFilters={saleFilters}
          sortMode={sortMode}
          displayMode={displayMode}
          onCouponToggle={(coupon, on) => {
            setSelectedCoupons((prev) =>
              on ? [...prev, coupon] : prev.filter((c) => c !== coupon),
            );
            resetPayments();
          }}
          onSaleFiltersChange={setSaleFilters}
          onClearSaleFilters={() => setSaleFilters(emptySaleFilters)}
          onSortModeChange={setSortMode}
          onDisplayModeChange={setDisplayMode}
          onQuantityChange={updateCartQuantity}
          onScan={addProductByScan}
          onScanValueChange={setScanValue}
        />
      )}
      {mode === "payment" && (
        <PaymentWorkspace
          cartItems={cartItems}
          payments={payments}
          total={paymentTotal}
          balance={paymentBalance}
          settled={paymentBalance === 0 && paidTotal > 0}
          installment={selectedInstallment}
          onOpenDialog={setDialog}
          onCashPayment={(amount) => completePayment("cash", amount)}
        />
      )}
      {(mode === "register-count" || mode === "register-confirmed") && (
        <RegisterCount
          confirmed={mode === "register-confirmed"}
          counts={registerCounts}
          adjustment={registerAdjustment}
          onAdjustmentChange={(value) =>
            setRegisterAdjustment(normalizeAdjustmentInput(value))
          }
          onCountChange={(index, nextCount) =>
            setRegisterCounts((currentCounts) =>
              currentCounts.map((count, countIndex) =>
                countIndex === index ? Math.max(nextCount, 0) : count,
              ),
            )
          }
        />
      )}
      {mode === "buyback-reception" && (
        <BuyBackReceptionWorkspace
          state={buyBackReception}
          onChange={updateBuyBackReception}
          onOpenPrint={(target) => setDialog(target)}
        />
      )}
      <PaymentDialogs
        dialog={dialog}
        total={paymentTotal}
        payments={payments}
        selectedInstallment={selectedInstallment}
        onSelectedInstallmentChange={setSelectedInstallment}
        onClose={() => setDialog(null)}
        onDialog={setDialog}
        onCompletePayment={completePayment}
      />
      <BuyBackReceptionDialogs
        dialog={buyBackDialog}
        state={buyBackReception}
        onClose={() => setDialog(null)}
        onChange={updateBuyBackReception}
        onDialog={(nextDialog) => setDialog(nextDialog)}
      />
      <ReceiptOverlay
        open={showReceipt}
        onClose={() => {
          setShowReceipt(false);
          setMode("register-count");
        }}
      />
      {/* buy-back: consent form re-creation success banner (§5) */}
      {bannerVisible && (
        <SuccessBanner
          message={t("page.purchase.toast.recreateCompleted")}
          onClose={() => setBannerVisible(false)}
        />
      )}
    </Box>
  );
}

function SaleWorkspace({
  cartItems,
  visibleCartItems,
  scanValue,
  selectedCoupons,
  productDiscount,
  couponDiscount,
  consumptionTax,
  totalAfterDiscount,
  saleFilters,
  sortMode,
  displayMode,
  onCouponToggle,
  onSaleFiltersChange,
  onClearSaleFilters,
  onSortModeChange,
  onDisplayModeChange,
  onQuantityChange,
  onScan,
  onScanValueChange,
}: {
  cartItems: CartItem[];
  visibleCartItems: CartItem[];
  scanValue: string;
  selectedCoupons: CouponCode[];
  productDiscount: number;
  couponDiscount: number;
  consumptionTax: number;
  totalAfterDiscount: number;
  saleFilters: SaleFilterState;
  sortMode: SortMode;
  displayMode: DisplayMode;
  onCouponToggle: (coupon: CouponCode, on: boolean) => void;
  onSaleFiltersChange: (filters: SaleFilterState) => void;
  onClearSaleFilters: () => void;
  onSortModeChange: (mode: SortMode) => void;
  onDisplayModeChange: (mode: DisplayMode) => void;
  onQuantityChange: (code: string, nextQty: number) => void;
  onScan: () => void;
  onScanValueChange: (value: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) 292px",
        gap: 1,
      }}
    >
      <Box
        sx={{
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          gap: 0.75,
        }}
      >
        <SaleToolbar
          scanValue={scanValue}
          saleFilters={saleFilters}
          sortMode={sortMode}
          displayMode={displayMode}
          onSaleFiltersChange={onSaleFiltersChange}
          onClearSaleFilters={onClearSaleFilters}
          onSortModeChange={onSortModeChange}
          onDisplayModeChange={onDisplayModeChange}
          onScan={onScan}
          onScanValueChange={onScanValueChange}
        />
        <Paper
          variant="outlined"
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
            bgcolor: "white",
            borderColor: BORDER,
          }}
        >
          {cartItems.length === 0 ? (
            <EmptySaleCanvas />
          ) : visibleCartItems.length === 0 ? (
            <Box sx={{ height: "100%", display: "grid", placeItems: "center" }}>
              <Typography variant="body2" color="text.secondary">
                {t("page.front.filter.noResult")}
              </Typography>
            </Box>
          ) : (
            <SaleTable
              cartItems={visibleCartItems}
              displayMode={displayMode}
              onQuantityChange={onQuantityChange}
            />
          )}
        </Paper>
      </Box>
      {cartItems.length === 0 ? (
        <EmptyDetail />
      ) : (
        <SaleDetail
          cartItems={cartItems}
          selectedCoupons={selectedCoupons}
          productDiscount={productDiscount}
          couponDiscount={couponDiscount}
          consumptionTax={consumptionTax}
          totalAfterDiscount={totalAfterDiscount}
          onCouponToggle={onCouponToggle}
        />
      )}
    </Box>
  );
}

function SaleToolbar({
  scanValue,
  saleFilters,
  sortMode,
  displayMode,
  onSaleFiltersChange,
  onClearSaleFilters,
  onSortModeChange,
  onDisplayModeChange,
  onScan,
  onScanValueChange,
}: {
  scanValue: string;
  saleFilters: SaleFilterState;
  sortMode: SortMode;
  displayMode: DisplayMode;
  onSaleFiltersChange: (filters: SaleFilterState) => void;
  onClearSaleFilters: () => void;
  onSortModeChange: (mode: SortMode) => void;
  onDisplayModeChange: (mode: DisplayMode) => void;
  onScan: () => void;
  onScanValueChange: (value: string) => void;
}) {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [activeMenu, setActiveMenu] = useState<
    "attr" | "tax" | "priceBand" | "sort" | null
  >(null);

  const handleOpenMenu =
    (menu: "attr" | "tax" | "priceBand" | "sort") =>
    (event: MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
      setActiveMenu(menu);
    };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setActiveMenu(null);
  };

  const attrLabelMap: Record<SaleFilterState["attr"], string> = {
    all: t("page.front.filter.all"),
    S: "S",
    M: "M",
    L: "L",
    "-": "-",
  };
  const taxLabelMap: Record<SaleFilterState["tax"], string> = {
    all: t("page.front.filter.all"),
    税込: t("page.front.filter.taxIncluded"),
  };
  const priceLabelMap: Record<SaleFilterState["priceBand"], string> = {
    all: t("page.front.filter.all"),
    low: t("page.front.filter.lowPrice"),
    mid: t("page.front.filter.midPrice"),
    high: t("page.front.filter.highPrice"),
  };
  const sortLabelMap: Record<SortMode, string> = {
    newestDesc: t("page.front.filter.sort.newestDesc"),
    newestAsc: t("page.front.filter.sort.newestAsc"),
    nameAsc: t("page.front.filter.sort.nameAsc"),
    nameDesc: t("page.front.filter.sort.nameDesc"),
    amountDesc: t("page.front.filter.sort.amountDesc"),
    amountAsc: t("page.front.filter.sort.amountAsc"),
  };

  const filterChips = [
    {
      key: "attr" as const,
      label: `${t("page.front.filter.attr")}: ${attrLabelMap[saleFilters.attr]}`,
    },
    {
      key: "tax" as const,
      label: `${t("page.front.filter.tax")}: ${taxLabelMap[saleFilters.tax]}`,
    },
    {
      key: "priceBand" as const,
      label: `${t("page.front.filter.priceRange")}: ${priceLabelMap[saleFilters.priceBand]}`,
    },
  ];

  const menuItems = (() => {
    if (activeMenu === "attr") {
      return (["all", "S", "M", "L", "-"] as SaleFilterState["attr"][]).map(
        (value) => ({
          key: value,
          label: attrLabelMap[value],
          onSelect: () => onSaleFiltersChange({ ...saleFilters, attr: value }),
        }),
      );
    }
    if (activeMenu === "tax") {
      return (["all", "税込"] as SaleFilterState["tax"][]).map((value) => ({
        key: value,
        label: taxLabelMap[value],
        onSelect: () => onSaleFiltersChange({ ...saleFilters, tax: value }),
      }));
    }
    if (activeMenu === "priceBand") {
      return (
        ["all", "low", "mid", "high"] as SaleFilterState["priceBand"][]
      ).map((value) => ({
        key: value,
        label: priceLabelMap[value],
        onSelect: () =>
          onSaleFiltersChange({ ...saleFilters, priceBand: value }),
      }));
    }
    if (activeMenu === "sort") {
      return (
        [
          "newestDesc",
          "newestAsc",
          "nameAsc",
          "nameDesc",
          "amountDesc",
          "amountAsc",
        ] as SortMode[]
      ).map((value) => ({
        key: value,
        label: sortLabelMap[value],
        onSelect: () => onSortModeChange(value),
      }));
    }
    return [];
  })();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.7 }}>
      <Box
        sx={{ height: 36, display: "flex", alignItems: "center", gap: 0.75 }}
      >
        <OutlinedInput
          size="small"
          value={scanValue}
          placeholder={t("header.search")}
          onChange={(event) => onScanValueChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") onScan();
          }}
          startAdornment={
            <InputAdornment position="start">
              <SearchIcon sx={{ fontSize: 18, color: "text.secondary" }} />
            </InputAdornment>
          }
          endAdornment={
            <InputAdornment position="end" sx={{ mr: -0.75 }}>
              <Box
                sx={{
                  height: 24,
                  borderLeft: "1px solid",
                  borderColor: "#d7dde5",
                  mx: 0.75,
                }}
              />
              <IconButton
                size="small"
                onClick={onScan}
                sx={{ borderRadius: 0.75, color: "text.secondary" }}
              >
                <QrCodeScannerIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </InputAdornment>
          }
          sx={{
            width: 470,
            height: 34,
            bgcolor: "white",
            fontSize: 12,
            "& input": { py: 0.8 },
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#d5dbe5" },
          }}
        />
      </Box>

      <Box
        sx={{ height: 28, display: "flex", alignItems: "center", gap: 0.75 }}
      >
        <Button
          size="small"
          variant="outlined"
          startIcon={<TuneIcon sx={{ fontSize: 16 }} />}
          onClick={onClearSaleFilters}
          sx={{
            height: 27,
            minWidth: 98,
            textTransform: "none",
            fontSize: 11,
            borderColor: "#d4dfec",
            color: "primary.main",
            fontWeight: 700,
          }}
        >
          {t("page.front.filter.conditionSearch")}
        </Button>
        {filterChips.map((filterChip) => (
          <Chip
            key={filterChip.key}
            label={filterChip.label}
            size="small"
            variant="outlined"
            onClick={handleOpenMenu(filterChip.key)}
            onDelete={handleOpenMenu(filterChip.key)}
            deleteIcon={<ArrowDropDownIcon />}
            sx={{
              height: 26,
              fontSize: 11,
              borderColor: "#d5dbe5",
              bgcolor: "white",
              "& .MuiChip-deleteIcon": {
                color: "text.secondary",
                fontSize: 17,
                mr: 0.35,
              },
            }}
          />
        ))}
        <Box sx={{ flex: 1 }} />
        <Button
          size="small"
          onClick={() =>
            onDisplayModeChange(
              displayMode === "detailed" ? "compact" : "detailed",
            )
          }
          startIcon={<VisibilityIcon sx={{ fontSize: 15 }} />}
          sx={{
            minWidth: 96,
            height: 26,
            color: "text.secondary",
            textTransform: "none",
            fontSize: 11,
          }}
        >
          {displayMode === "detailed"
            ? t("page.front.filter.displayDetailed")
            : t("page.front.filter.displayCompact")}
        </Button>
        <Button
          size="small"
          onClick={handleOpenMenu("sort")}
          startIcon={<SwapVertIcon sx={{ fontSize: 15 }} />}
          endIcon={<ArrowDropDownIcon sx={{ fontSize: 15 }} />}
          sx={{
            minWidth: 132,
            height: 26,
            color: "text.secondary",
            textTransform: "none",
            fontSize: 11,
          }}
        >
          {sortLabelMap[sortMode]}
        </Button>
      </Box>

      <Menu
        open={Boolean(anchorEl && activeMenu)}
        anchorEl={anchorEl}
        onClose={handleCloseMenu}
      >
        {menuItems.map((item) => (
          <MenuItem
            key={item.key}
            onClick={() => {
              item.onSelect();
              handleCloseMenu();
            }}
          >
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}

function EmptySaleCanvas() {
  const { t } = useTranslation();
  const items = [
    {
      icon: <SearchIcon />,
      title: t("page.front.empty.search"),
      text: t("page.front.empty.searchText"),
    },
    {
      icon: <QrCodeScannerIcon />,
      title: t("page.front.empty.scan"),
      text: t("page.front.empty.scanText"),
    },
    {
      icon: <ListAltIcon />,
      title: t("page.front.empty.list"),
      text: t("page.front.empty.listText"),
    },
  ];

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 9,
        color: "#8a98a8",
      }}
    >
      {items.map((item) => (
        <Box key={item.title} sx={{ textAlign: "center", minWidth: 98 }}>
          <Box sx={{ "& svg": { fontSize: 42, color: "#9ba9b8" } }}>
            {item.icon}
          </Box>
          <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
            {item.title}
          </Typography>
          <Typography variant="caption" sx={{ fontSize: 10 }}>
            {item.text}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

function SaleTable({
  cartItems,
  displayMode,
  onQuantityChange,
}: {
  cartItems: CartItem[];
  displayMode: DisplayMode;
  onQuantityChange: (code: string, nextQty: number) => void;
}) {
  const { t } = useTranslation();
  const detailed = displayMode === "detailed";
  const columns = detailed
    ? ["no", "deal", "code", "name", "attr", "qty", "unit", "amount", "note"]
    : ["no", "name", "qty", "amount"];

  return (
    <Table
      size="small"
      stickyHeader
      sx={{
        tableLayout: "fixed",
        "& th": {
          bgcolor: HEADER_BG,
          fontWeight: 700,
          fontSize: 11,
          borderColor: BORDER,
          py: 0.7,
        },
        "& td": {
          fontSize: 11,
          py: 0.55,
          borderColor: BORDER,
          verticalAlign: "top",
        },
      }}
    >
      <TableHead>
        <TableRow>
          {columns.map((column) => (
            <TableCell
              key={column}
              align={
                ["qty", "unit", "amount"].includes(column) ? "right" : "left"
              }
              sx={
                column === "no"
                  ? { width: 44 }
                  : column === "deal"
                    ? { width: 56 }
                    : column === "code"
                      ? { width: 84 }
                      : column === "attr"
                        ? { width: 48 }
                        : undefined
              }
            >
              {t(`page.front.table.${column}`)}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {cartItems.map((item, index) => (
          <TableRow key={item.code}>
            <TableCell sx={{ color: "text.secondary" }}>
              {String(index + 1).padStart(3, "0")}
            </TableCell>
            {detailed && <TableCell>XXXX</TableCell>}
            {detailed && (
              <TableCell sx={{ whiteSpace: "pre-line", fontFamily: "monospace" }}>
                {item.code}
              </TableCell>
            )}
            <TableCell sx={{ minWidth: 160 }}>
              <Typography sx={{ fontSize: 10, color: "text.secondary" }}>
                {item.maker}
              </Typography>
              <Typography sx={{ fontSize: 11, fontWeight: 700, lineHeight: 1.3 }}>
                {item.name}
              </Typography>
              <Typography sx={{ fontSize: 10, color: "text.secondary" }}>
                {item.comment}
              </Typography>
            </TableCell>
            {detailed && (
              <TableCell sx={{ fontWeight: 700 }}>{item.attr}</TableCell>
            )}
            <TableCell align="right">
              <QuantityButtons
                value={item.qty}
                onChange={(nextQty) => onQuantityChange(item.code, nextQty)}
              />
            </TableCell>
            {detailed && (
              <TableCell align="right">{formatYen(item.unitPrice)}</TableCell>
            )}
            <TableCell align="right">
              <Typography sx={{ fontSize: 11, fontWeight: 800 }}>
                {formatYen(item.unitPrice * item.qty)}
              </Typography>
              {item.priceBonus > 0 && (
                <Typography sx={{ fontSize: 10, color: BLUE }}>
                  {t("page.front.priceBonus")} +{formatYen(item.priceBonus)}
                </Typography>
              )}
              {item.priceDiscount > 0 && (
                <Typography sx={{ fontSize: 10, color: "error.main" }}>
                  {item.discountPercent > 0 && `${item.discountPercent}% `}
                  {t("page.front.priceDiscount")} -{formatYen(item.priceDiscount)}
                </Typography>
              )}
            </TableCell>
            {detailed && <TableCell>{item.note}</TableCell>}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function QuantityButtons({
  value,
  onChange,
}: {
  value: number;
  onChange: (nextValue: number) => void;
}) {
  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
      <IconButton
        size="small"
        onClick={() => onChange(value - 1)}
        sx={{
          border: "1px solid",
          borderColor: BORDER,
          borderRadius: 0.5,
          width: 22,
          height: 22,
        }}
      >
        <RemoveIcon sx={{ fontSize: 14 }} />
      </IconButton>
      <Typography
        variant="caption"
        sx={{ minWidth: 22, textAlign: "center", fontWeight: 700 }}
      >
        {value}
      </Typography>
      <IconButton
        size="small"
        onClick={() => onChange(value + 1)}
        sx={{
          border: "1px solid",
          borderColor: BORDER,
          borderRadius: 0.5,
          width: 22,
          height: 22,
        }}
      >
        <AddIcon sx={{ fontSize: 14 }} />
      </IconButton>
    </Box>
  );
}

function EmptyDetail() {
  const { t } = useTranslation();

  return (
    <SidePanel title={t("page.front.breakdownDetail")}>
      <Typography variant="caption">{t("page.front.serialNo")}</Typography>
      <Divider sx={{ my: 1 }} />
      <Box sx={{ flex: 1 }} />
      <SummaryLine label={t("page.front.qtyCount")} value="0点" />
      <SummaryLine label={t("page.front.subtotal")} value="¥0" />
      <SummaryLine label={t("page.front.tax")} value="¥0" />
    </SidePanel>
  );
}

function SaleDetail({
  cartItems,
  selectedCoupons,
  productDiscount,
  couponDiscount,
  consumptionTax,
  totalAfterDiscount,
  onCouponToggle,
}: {
  cartItems: CartItem[];
  selectedCoupons: CouponCode[];
  productDiscount: number;
  couponDiscount: number;
  consumptionTax: number;
  totalAfterDiscount: number;
  onCouponToggle: (coupon: CouponCode, on: boolean) => void;
}) {
  const { t } = useTranslation();
  const subtotal = getCartTotal(cartItems);
  const qtyCount = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const couponRows: { code: CouponCode; label: string; sub: string }[] = [
    {
      code: "couponB",
      label: "【自動】RBOOK1冊無料",
      sub: "becon(全泊) [所持] 新(ｹﾞ ｵﾌﾟﾘ)",
    },
    { code: "couponC", label: t("page.front.coupon20"), sub: "" },
    { code: "couponD", label: t("page.front.coupon20"), sub: "" },
  ];

  return (
    <SidePanel
      title={
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {t("page.front.breakdownDetail")}{" "}
          <Chip
            label={t("page.front.productIn")}
            color="primary"
            size="small"
            sx={{ height: 18, fontSize: 9 }}
          />
        </Box>
      }
    >
      <Typography variant="caption" sx={{ fontWeight: 700 }}>
        {t("page.front.couponInfo")}
      </Typography>
      <Box
        sx={{
          mt: 0.7,
          display: "flex",
          flexDirection: "column",
          gap: 0.7,
          maxHeight: 168,
          overflowY: "auto",
        }}
      >
        {couponRows.map((row) => {
          const on = selectedCoupons.includes(row.code);
          const amount = getCouponDiscount(row.code, subtotal);
          return (
            <Box
              key={row.code}
              sx={{
                px: 0.75,
                py: 0.5,
                border: "1px solid",
                borderColor: on ? BLUE : BORDER,
                bgcolor: on ? SOFT_BLUE : "white",
                borderRadius: 1,
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <Switch
                size="small"
                checked={on}
                onChange={(e) => onCouponToggle(row.code, e.target.checked)}
              />
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  sx={{ fontSize: 11, fontWeight: 700, lineHeight: 1.3 }}
                  noWrap
                >
                  {row.label}
                </Typography>
                {(row.sub || on) && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 0.5,
                    }}
                  >
                    <Typography
                      sx={{ fontSize: 9, color: "text.secondary" }}
                      noWrap
                    >
                      {row.sub}
                    </Typography>
                    {on && amount > 0 && (
                      <Typography
                        sx={{ fontSize: 10, color: "error.main", whiteSpace: "nowrap" }}
                      >
                        -{formatYen(amount)}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
      <Box sx={{ flex: 1 }} />
      <SummaryLine label={t("page.front.qtyCount")} value={`${qtyCount}点`} />
      <SummaryLine
        label={t("page.front.subtotal")}
        value={formatYen(subtotal)}
      />
      {productDiscount > 0 && (
        <SummaryLine
          label={t("page.front.discountTotal")}
          value={`-${formatYen(productDiscount)}`}
          danger
        />
      )}
      {couponDiscount > 0 && (
        <SummaryLine
          label={t("page.front.couponTotal")}
          value={`-${formatYen(couponDiscount)}`}
          danger
        />
      )}
      <SummaryLine
        label={t("page.front.tax")}
        value={formatYen(consumptionTax)}
      />
      <Divider sx={{ my: 1 }} />
      <SummaryLine
        label={t("page.front.totalAmount")}
        value={formatYen(totalAfterDiscount)}
        blue
        large
      />
    </SidePanel>
  );
}

function PaymentWorkspace({
  cartItems,
  payments,
  total,
  balance,
  settled,
  installment,
  onOpenDialog,
  onCashPayment,
}: {
  cartItems: CartItem[];
  payments: PaymentState;
  total: number;
  balance: number;
  settled: boolean;
  installment: string;
  onOpenDialog: (dialog: DialogMode) => void;
  onCashPayment: (amount: number) => void;
}) {
  const { t } = useTranslation();
  const [cashAmount, setCashAmount] = useState(
    balance > 0 ? String(balance) : "",
  );
  useEffect(() => {
    setCashAmount(balance > 0 ? String(balance) : "");
  }, [balance]);

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) 292px",
        gap: 1,
      }}
    >
      <Box
        sx={{
          minHeight: 0,
          display: "grid",
          gridTemplateRows: "minmax(0, 1fr) 188px",
          gap: 1,
        }}
      >
        <Paper
          variant="outlined"
          sx={{ overflow: "hidden", borderColor: BORDER }}
        >
          <Table
            size="small"
            sx={{
              "& th": { bgcolor: HEADER_BG, fontSize: 11 },
              "& td": { fontSize: 12 },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell>{t("page.front.table.name")}</TableCell>
                <TableCell align="right">
                  {t("page.front.totalAmount")}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cartItems.map((item) => (
                <TableRow key={item.code}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell align="right">
                    {formatYen(item.unitPrice * item.qty)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
          <BillPanel cartItems={cartItems} total={total} />
          <PaymentBreakdown payments={payments} balance={balance} />
        </Box>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <PayCard title={t("page.front.creditSettlement")}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 1,
              alignItems: "stretch",
            }}
          >
            <PayButton
              icon={<CreditCardIcon />}
              label={t("page.front.credit")}
              disabled={settled}
              onClick={() => onOpenDialog("otherSettlement")}
            />
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 0.5,
              }}
            >
              <SummaryLine
                label={t("page.front.cardNumber")}
                value={settled ? "1234567890123456789" : "-"}
              />
              <SummaryLine
                label={t("page.front.paymentCount")}
                value={settled ? installment : "-"}
              />
            </Box>
          </Box>
        </PayCard>
        <PayCard title={t("page.front.cashlessSettlement")}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}
            >
              <PayButton
                icon={<QrCode2Icon />}
                label={t("page.front.barcodePay")}
                disabled={settled}
                onClick={() => onOpenDialog("otherSettlement")}
              />
              <PayButton
                icon={<ContactlessIcon />}
                label={t("page.front.eMoney")}
                disabled={settled}
                onClick={() => onOpenDialog("otherSettlement")}
              />
            </Box>
            <Button
              variant="contained"
              fullWidth
              disabled={settled}
              onClick={() => onOpenDialog("otherSettlement")}
              sx={{ minHeight: 44, fontSize: 12 }}
            >
              {t("page.front.otherPay")}
            </Button>
          </Box>
        </PayCard>
        <PayCard title={t("page.front.cashSettlement")}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <TextField
              size="small"
              placeholder={t("page.front.amountInput")}
              value={cashAmount}
              disabled={settled}
              onChange={(event) =>
                setCashAmount(normalizeAmountInput(event.target.value))
              }
              onKeyDown={(event) => {
                if (event.key === "Enter" && cashAmount) {
                  onCashPayment(Number(cashAmount));
                  setCashAmount("");
                }
              }}
              fullWidth
            />
            <SummaryLine
              label={t("page.front.estimateTotal")}
              value={formatYen(total)}
              blue
            />
          </Box>
        </PayCard>
      </Box>
    </Box>
  );
}

function BillPanel({
  cartItems,
  total,
}: {
  cartItems: CartItem[];
  total: number;
}) {
  const { t } = useTranslation();
  const qtyCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  return (
    <Paper variant="outlined" sx={{ p: 1.4, borderColor: BORDER }}>
      <Typography sx={{ fontWeight: 700, fontSize: 13 }}>
        {t("page.front.billingInfo")}
      </Typography>
      <SummaryLine label={t("page.front.qtyCount")} value={`${qtyCount}点`} />
      <SummaryLine label={t("page.front.discount")} value="¥0" />
      <SummaryLine label={t("page.front.subtotal")} value={formatYen(total)} />
      <SummaryLine label={t("page.front.tax")} value="税込" />
      <Divider sx={{ my: 0.8 }} />
      <SummaryLine
        label={t("page.front.totalAmount")}
        value={formatYen(total)}
        blue
      />
    </Paper>
  );
}

function PaymentBreakdown({
  payments,
  balance,
}: {
  payments: PaymentState;
  balance: number;
}) {
  const { t } = useTranslation();

  return (
    <Paper variant="outlined" sx={{ p: 1.4, borderColor: BORDER }}>
      <Typography sx={{ fontWeight: 700, fontSize: 13 }}>
        {t("page.front.paymentBreakdown")}
      </Typography>
      <SummaryLine
        label={t("page.front.cash")}
        value={formatYen(payments.cash)}
      />
      <SummaryLine
        label={t("page.front.credit")}
        value={formatYen(payments.credit)}
      />
      <SummaryLine
        label={t("page.front.barcodePay")}
        value={formatYen(payments.barcode)}
      />
      <SummaryLine
        label={t("page.front.eMoney")}
        value={formatYen(payments.emoney)}
      />
      <Divider sx={{ my: 0.8 }} />
      <SummaryLine
        label={t("page.front.balance")}
        value={formatYen(balance)}
        danger={balance > 0}
        blue={balance === 0}
      />
    </Paper>
  );
}

function PaymentDialogs({
  dialog,
  total,
  payments,
  selectedInstallment,
  onSelectedInstallmentChange,
  onClose,
  onDialog,
  onCompletePayment,
}: {
  dialog: DialogMode;
  total: number;
  payments: PaymentState;
  selectedInstallment: string;
  onSelectedInstallmentChange: (value: string) => void;
  onClose: () => void;
  onDialog: (dialog: DialogMode) => void;
  onCompletePayment: (method: PayMethod, amount?: number) => void;
}) {
  const { t } = useTranslation();
  const [selectedCard, setSelectedCard] = useState("VISA");
  const [selectedCreditCancelMode, setSelectedCreditCancelMode] = useState<
    "returnOnly" | "resale"
  >("returnOnly");
  const [cancelReason, setCancelReason] = useState("");
  const [cancelReasonDetail, setCancelReasonDetail] = useState("");
  const [cardAmount, setCardAmount] = useState("");
  const [barcodeAmount, setBarcodeAmount] = useState("");
  const [selectedOther, setSelectedOther] = useState(0);
  const displayCardAmount = cardAmount || String(total);
  const displayBarcodeAmount = barcodeAmount || String(total);
  const cardBrands = [
    "VISA",
    "Master",
    "JCB",
    "AMEX",
    "Diners",
    "UnionPay",
    "Debit",
    "Discover",
  ];
  const installmentOptions = ["1回", "3回", "5回", "12回", "リボ払い"];
  const paidWithoutCredit = payments.cash + payments.barcode + payments.emoney;
  const payableAfterOtherPayments = Math.max(total - paidWithoutCredit, 0);
  const refundableCreditAmount = Math.max(
    payments.credit - payableAfterOtherPayments,
    0,
  );
  const cancelReasonOptions = [
    t("page.front.dialog.cancelReasonItemDefect"),
    t("page.front.dialog.cancelReasonCustomerOrderMismatch"),
    t("page.front.dialog.cancelReasonSpecDifference"),
    t("page.front.dialog.cancelReasonSizeMismatch"),
    t("page.front.dialog.cancelReasonWrongOrder"),
    t("page.front.dialog.cancelReasonCustomerRequest"),
    t("page.front.dialog.cancelReasonPartialReturn"),
    t("page.front.dialog.cancelReasonResaleProcess"),
    t("page.front.dialog.cancelReasonPaymentError"),
    t("page.front.dialog.cancelReasonOther"),
  ];

  if (dialog === "otherSettlement")
    return (
      <CommonDialog
        title={t("page.front.otherSettlementTitle")}
        onClose={onClose}
        onConfirm={() => onDialog("cardAmount")}
        confirm={t("page.front.done")}
      >
        <Typography variant="body2">
          {t("page.front.selectMethod")}
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 1,
            mt: 2,
          }}
        >
          {Array.from({ length: 10 }).map((_, index) => (
            <Button
              key={index}
              onClick={() => setSelectedOther(index)}
              variant={selectedOther === index ? "contained" : "outlined"}
            >
              {t("page.front.sample")}
            </Button>
          ))}
        </Box>
      </CommonDialog>
    );
  if (dialog === "cardSelect")
    return (
      <CommonDialog
        title={t("page.front.dialog.cardTitle")}
        onClose={onClose}
        onConfirm={() => onDialog("cardAmount")}
        confirm={t("page.front.done")}
      >
        <Typography variant="body2">
          {t("page.front.dialog.selectCard")}
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 1,
            mt: 2,
          }}
        >
          {cardBrands.map((label) => (
            <Button
              key={label}
              onClick={() => setSelectedCard(label)}
              variant={selectedCard === label ? "contained" : "outlined"}
            >
              {label}
            </Button>
          ))}
        </Box>
      </CommonDialog>
    );
  if (dialog === "cardAmount")
    return (
      <CommonDialog
        title={t("page.front.dialog.cardTitle")}
        onClose={onClose}
        onConfirm={() => onDialog("paymentComplete")}
        confirm={t("page.front.confirm")}
      >
        <SummaryLine
          label={t("page.front.totalAmount")}
          value={formatYen(total)}
          blue
          large
        />
        <TextField
          sx={{ mt: 2 }}
          size="small"
          fullWidth
          label={t("page.front.dialog.cardAmount")}
          value={displayCardAmount}
          onChange={(event) =>
            setCardAmount(normalizeAmountInput(event.target.value))
          }
        />
      </CommonDialog>
    );
  if (dialog === "paymentComplete")
    return (
      <CommonDialog
        icon={<CheckIcon sx={{ fontSize: 56 }} />}
        title={t("page.front.dialog.terminalComplete")}
        onClose={onClose}
        onConfirm={() => onDialog("installment")}
        confirm={t("page.front.retry")}
      >
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
          {["icWith", "icWithout", "unionPay", "cancelDeal"].map((key) => (
            <Card
              key={key}
              variant="outlined"
              sx={{ p: 2, bgcolor: "#f1f3f5" }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: 13 }}>
                {t(`page.front.dialog.${key}`)}
              </Typography>
              <Typography variant="caption" sx={{ display: "block", mt: 0.5 }}>
                {t(`page.front.dialog.${key}Desc`)}
              </Typography>
            </Card>
          ))}
        </Box>
      </CommonDialog>
    );
  if (dialog === "installment")
    return (
      <CommonDialog
        title={t("page.front.dialog.installmentTitle")}
        onClose={onClose}
        onConfirm={() => onDialog("cardProcessing")}
        confirm={t("page.front.done")}
      >
        <Typography variant="body2">
          {t("page.front.dialog.selectInstallment")}
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 1,
            mt: 2,
          }}
        >
          {installmentOptions.map((label) => (
            <Button
              key={label}
              onClick={() => onSelectedInstallmentChange(label)}
              variant={selectedInstallment === label ? "contained" : "outlined"}
            >
              {label}
            </Button>
          ))}
        </Box>
      </CommonDialog>
    );
  if (dialog === "cardProcessing")
    return (
      <CommonDialog
        icon={<InfoOutlinedIcon sx={{ fontSize: 56 }} />}
        title={t("page.front.dialog.cardProcessing")}
        onClose={onClose}
        onConfirm={() => {
          onCompletePayment("credit", Number(displayCardAmount));
          setCardAmount("");
          onClose();
        }}
        confirm={t("page.front.retry")}
      >
        <Typography align="center" sx={{ fontWeight: 700 }}>
          {t("page.front.dialog.terminalInput")}
        </Typography>
        <Typography
          variant="caption"
          align="center"
          sx={{ display: "block", mt: 1, whiteSpace: "pre-line", color: "text.secondary" }}
        >
          {t("page.front.dialog.terminalInputDetail")}
        </Typography>
      </CommonDialog>
    );
  if (dialog === "barcodeAmount")
    return (
      <CommonDialog
        title={t("page.front.dialog.barcodeTitle")}
        onClose={onClose}
        onConfirm={() => {
          onCompletePayment("barcode", Number(displayBarcodeAmount));
          setBarcodeAmount("");
          onDialog("barcodeScan");
        }}
        confirm={t("page.front.confirm")}
      >
        <SummaryLine
          label={t("page.front.totalAmount")}
          value={formatYen(total)}
          blue
          large
        />
        <TextField
          sx={{ mt: 2 }}
          size="small"
          fullWidth
          label={t("page.front.dialog.barcodeAmount")}
          value={displayBarcodeAmount}
          onChange={(event) =>
            setBarcodeAmount(normalizeAmountInput(event.target.value))
          }
        />
      </CommonDialog>
    );
  if (dialog === "barcodeScan")
    return (
      <CommonDialog
        icon={<InfoOutlinedIcon sx={{ fontSize: 56 }} />}
        title={t("page.front.dialog.scanCustomerBarcode")}
        onClose={onClose}
        onConfirm={onClose}
        confirm={t("page.front.done")}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1.25,
            py: 1,
          }}
        >
          <TemporaryQrCode />
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            TEMP-QR-0001
          </Typography>
        </Box>
      </CommonDialog>
    );
  if (dialog === "creditCancelMode") {
    return (
      <Dialog open maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: "center", fontWeight: 800, pb: 0.5 }}>
          <InfoOutlinedIcon sx={{ fontSize: 44, mb: 0.4 }} />
          <Box sx={{ fontSize: 18 }}>
            {t("page.front.dialog.creditCancelModeTitle")}
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 1.2, pb: 1.6 }}>
          <Typography
            align="center"
            variant="body2"
            sx={{ mb: 1.8, lineHeight: 1.35 }}
          >
            {t("page.front.dialog.creditCancelModeGuide")}
          </Typography>
          <Box
            sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.1 }}
          >
            <Button
              variant="outlined"
              onClick={() => {
                setSelectedCreditCancelMode("returnOnly");
                onDialog("creditCancelConfirm");
              }}
              sx={{
                minHeight: 132,
                borderWidth: selectedCreditCancelMode === "returnOnly" ? 2 : 1,
                borderColor:
                  selectedCreditCancelMode === "returnOnly" ? BLUE : "#b9d2f6",
                bgcolor: "white",
                color: "#2b313c",
                display: "flex",
                flexDirection: "column",
                gap: 0.7,
                "&:hover": { borderColor: BLUE, bgcolor: "#f9fbff" },
              }}
            >
              <AutorenewIcon sx={{ fontSize: 44, color: "#1675e0" }} />
              <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
                {t("page.front.dialog.returnOnly")}
              </Typography>
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setSelectedCreditCancelMode("resale");
                onDialog("creditCancelConfirm");
              }}
              sx={{
                minHeight: 132,
                borderWidth: selectedCreditCancelMode === "resale" ? 2 : 1,
                borderColor:
                  selectedCreditCancelMode === "resale" ? BLUE : "#b9d2f6",
                bgcolor: "white",
                color: "#2b313c",
                display: "flex",
                flexDirection: "column",
                gap: 0.7,
                "&:hover": { borderColor: BLUE, bgcolor: "#f9fbff" },
              }}
            >
              <ShoppingCartCheckoutIcon
                sx={{ fontSize: 44, color: "#1675e0" }}
              />
              <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
                {t("page.front.dialog.resale")}
              </Typography>
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", p: 1.2, pt: 0.5 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{ minWidth: 120, height: 34, fontSize: 12 }}
          >
            {t("page.front.cancel")}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
  if (dialog === "creditCancelConfirm") {
    return (
      <Dialog open maxWidth="xs" fullWidth>
        <DialogTitle sx={{ textAlign: "center", fontWeight: 800 }}>
          <InfoOutlinedIcon sx={{ fontSize: 48, mb: 0.5 }} />
          <Box>{t("page.front.dialog.creditCancelConfirmTitle")}</Box>
        </DialogTitle>
        <DialogContent dividers>
          <Typography align="center" variant="body2">
            {t("page.front.dialog.creditCancelConfirmMessage")}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", p: 2 }}>
          <Button variant="outlined" onClick={onClose} sx={{ minWidth: 120 }}>
            {t("page.front.dialog.no")}
          </Button>
          <Button
            variant="contained"
            onClick={() => onDialog("creditCancelReason")}
            sx={{ minWidth: 120 }}
          >
            {t("page.front.dialog.yes")}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
  if (dialog === "creditCancelReason") {
    return (
      <Dialog open maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {t("page.front.dialog.creditCancelReasonTitle")}
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {t("page.front.dialog.creditCancelReasonGuide")}
          </Typography>
          <TextField
            select
            fullWidth
            size="small"
            value={cancelReason}
            onChange={(event) => setCancelReason(event.target.value)}
            sx={{ mt: 1.2 }}
          >
            <MenuItem value="">
              {t("page.front.dialog.selectPlaceholder")}
            </MenuItem>
            {cancelReasonOptions.map((reason) => (
              <MenuItem key={reason} value={reason}>
                {reason}
              </MenuItem>
            ))}
          </TextField>
          <Typography
            variant="caption"
            sx={{ mt: 1.4, display: "block", color: "text.secondary" }}
          >
            {t("page.front.dialog.creditCancelDetailLabel")}
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={cancelReasonDetail}
            onChange={(event) => setCancelReasonDetail(event.target.value)}
            placeholder={t("page.front.dialog.creditCancelDetailPlaceholder")}
            sx={{ mt: 0.7 }}
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: "flex-end", p: 2 }}>
          <Button variant="outlined" onClick={onClose} sx={{ minWidth: 120 }}>
            {t("page.front.cancel")}
          </Button>
          <Button
            variant="contained"
            disabled={!cancelReason}
            onClick={() => {
              if (selectedCreditCancelMode === "returnOnly") {
                onDialog(
                  refundableCreditAmount > 0
                    ? "creditCancelCompleteRefund"
                    : "creditCancelCompleteNoRefund",
                );
                return;
              }
              onDialog("creditCancelCompleteNoRefund");
            }}
            sx={{ minWidth: 120 }}
          >
            {t("page.front.done")}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
  if (dialog === "creditCancelCompleteNoRefund") {
    return (
      <Dialog open maxWidth="xs" fullWidth>
        <DialogTitle sx={{ textAlign: "center", fontWeight: 800 }}>
          <InfoOutlinedIcon sx={{ fontSize: 48, mb: 0.5 }} />
          <Box>{t("page.front.dialog.creditCancelCompleted")}</Box>
        </DialogTitle>
        <DialogContent dividers>
          <Typography align="center" variant="body2">
            {t("page.front.dialog.noRefundMessage")}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", p: 2 }}>
          <Button variant="contained" onClick={onClose} sx={{ minWidth: 120 }}>
            {t("page.front.done")}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
  if (dialog === "creditCancelCompleteRefund") {
    return (
      <Dialog open maxWidth="xs" fullWidth>
        <DialogTitle sx={{ textAlign: "center", fontWeight: 800 }}>
          <InfoOutlinedIcon sx={{ fontSize: 48, mb: 0.5 }} />
          <Box>{t("page.front.dialog.creditCancelCompleted")}</Box>
        </DialogTitle>
        <DialogContent dividers>
          <Typography align="center" variant="body2">
            {t("page.front.dialog.refundMessage")}
          </Typography>
          <Typography
            align="center"
            sx={{ mt: 0.8, color: "error.main", fontSize: 32, fontWeight: 800 }}
          >
            {formatYen(refundableCreditAmount)}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", p: 2 }}>
          <Button variant="contained" onClick={onClose} sx={{ minWidth: 120 }}>
            {t("page.front.done")}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
  return null;
}

function TemporaryQrCode() {
  const modules = 21;
  const cell = 8;
  const size = modules * cell;

  const isFinderArea = (
    x: number,
    y: number,
    originX: number,
    originY: number,
  ) => x >= originX && x < originX + 7 && y >= originY && y < originY + 7;
  const isFinder = (x: number, y: number) => {
    const inTopLeft = isFinderArea(x, y, 0, 0);
    const inTopRight = isFinderArea(x, y, modules - 7, 0);
    const inBottomLeft = isFinderArea(x, y, 0, modules - 7);
    if (!inTopLeft && !inTopRight && !inBottomLeft) return false;

    const localX = inTopRight ? x - (modules - 7) : x;
    const localY = inBottomLeft ? y - (modules - 7) : y;
    const outer = localX === 0 || localX === 6 || localY === 0 || localY === 6;
    const core = localX >= 2 && localX <= 4 && localY >= 2 && localY <= 4;
    return outer || core;
  };

  const filledCells: Array<{ x: number; y: number }> = [];
  for (let y = 0; y < modules; y += 1) {
    for (let x = 0; x < modules; x += 1) {
      if (isFinder(x, y)) {
        filledCells.push({ x, y });
        continue;
      }
      const patternA = (x * 3 + y * 5 + x * y) % 7 === 0;
      const patternB = (x + y * 2) % 5 === 0;
      if (patternA || patternB) {
        filledCells.push({ x, y });
      }
    }
  }

  return (
    <Box
      sx={{
        p: 1,
        border: "1px solid",
        borderColor: BORDER,
        borderRadius: 1,
        bgcolor: "white",
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label="Temporary QR code"
      >
        <rect width={size} height={size} fill="#fff" />
        {filledCells.map((cellPoint) => (
          <rect
            key={`${cellPoint.x}-${cellPoint.y}`}
            x={cellPoint.x * cell}
            y={cellPoint.y * cell}
            width={cell}
            height={cell}
            fill="#111"
          />
        ))}
      </svg>
    </Box>
  );
}

function RegisterCount({
  confirmed,
  counts,
  adjustment,
  onAdjustmentChange,
  onCountChange,
}: {
  confirmed: boolean;
  counts: number[];
  adjustment: string;
  onAdjustmentChange: (value: string) => void;
  onCountChange: (index: number, nextCount: number) => void;
}) {
  const { t } = useTranslation();
  const prevCashReserve = previousCashReserveAmount;
  const totalByCounts = counts.reduce(
    (sum, count, index) => sum + count * denominationValues[index],
    0,
  );
  const adjustmentAmount =
    adjustment === "" || adjustment === "-" ? 0 : Number(adjustment);
  const adjustedTotal = totalByCounts + adjustmentAmount;
  const transferAmount = prevCashReserve;

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) 292px",
        gap: 1,
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          p: 0.75,
          position: "relative",
          bgcolor: confirmed ? "#fff2f4" : "white",
          overflow: "auto",
          borderColor: confirmed ? "#ffc9d1" : BORDER,
        }}
      >
        <Table
          size="small"
          sx={{
            tableLayout: "fixed",
            "& th": {
              bgcolor: "#eef1f5",
              color: "#4f5b6b",
              fontSize: 10.5,
              fontWeight: 700,
              py: 0.65,
              borderColor: BORDER,
            },
            "& td": { fontSize: 12, py: 0.4, borderColor: BORDER },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 86 }}>
                {t("page.front.denomination")}
              </TableCell>
              <TableCell sx={{ width: 270 }}>{t("page.front.count")}</TableCell>
              <TableCell align="right" sx={{ width: 126 }}>
                {t("page.front.amount")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {denominations.map((denomination, index) => (
              <RegisterDenominationRow
                key={denomination}
                denomination={denomination}
                index={index}
                count={counts[index]}
                onCountChange={onCountChange}
              />
            ))}
          </TableBody>
        </Table>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "44px 1fr",
            alignItems: "center",
            gap: 0.7,
            mt: 0.65,
            px: 0.25,
          }}
        >
          <Typography
            variant="caption"
            sx={{ fontWeight: 700, textAlign: "center", color: "#2c3340" }}
          >
            {t("page.front.other")}
          </Typography>
          <TextField
            size="small"
            value={adjustment}
            onChange={(event) => onAdjustmentChange(event.target.value)}
            placeholder={t("page.front.adjustmentPlaceholder")}
            fullWidth
            sx={{
              bgcolor: "white",
              "& .MuiOutlinedInput-root": { height: 30, borderRadius: 1 },
              "& .MuiInputBase-input": { py: 0.7, px: 1.1, fontSize: 11.5 },
            }}
          />
        </Box>
      </Paper>
      <RegisterDetailPanel
        confirmed={confirmed}
        total={adjustedTotal}
        prevReserve={prevCashReserve}
        transferAmount={transferAmount}
      />
    </Box>
  );
}

function RegisterDenominationRow({
  denomination,
  index,
  count,
  onCountChange,
}: {
  denomination: string;
  index: number;
  count: number;
  onCountChange: (index: number, nextCount: number) => void;
}) {
  return (
    <TableRow>
      <TableCell sx={{ width: 90, fontSize: 11.5, color: "#1f2430" }}>
        {denomination}
      </TableCell>
      <TableCell>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              border: "1px solid",
              borderColor: "#d6dbe3",
              borderRadius: 0.8,
              bgcolor: "#f2f4f7",
              height: 24,
            }}
          >
            <IconButton
              size="small"
              onClick={() => onCountChange(index, count - 1)}
              sx={{
                borderRadius: 0.5,
                width: 24,
                height: 22,
                color: "#2b7cff",
              }}
            >
              <RemoveIcon sx={{ fontSize: 13 }} />
            </IconButton>
            <TextField
              size="small"
              value={count || ""}
              onChange={(event) =>
                onCountChange(
                  index,
                  normalizeRegisterCountInput(event.target.value),
                )
              }
              sx={{
                width: 36,
                "& .MuiOutlinedInput-root": {
                  height: 22,
                  bgcolor: "white",
                  "& fieldset": { border: "none" },
                },
                "& input": {
                  textAlign: "center",
                  p: 0,
                  fontSize: 11.5,
                  color: "#5a6270",
                },
              }}
            />
            <IconButton
              size="small"
              onClick={() => onCountChange(index, count + 1)}
              sx={{
                borderRadius: 0.5,
                width: 24,
                height: 22,
                color: "#2b7cff",
              }}
            >
              <AddIcon sx={{ fontSize: 13 }} />
            </IconButton>
          </Box>
          <Typography
            variant="caption"
            sx={{ color: "#d4d9e2", fontWeight: 700, letterSpacing: 0.2 }}
          >
            {"›".repeat(34)}
          </Typography>
        </Box>
      </TableCell>
      <TableCell
        align="right"
        sx={{ color: count > 0 ? BLUE : "#8f98a7", fontWeight: 800, pr: 1.5 }}
      >
        {formatYen(count * denominationValues[index])}
      </TableCell>
    </TableRow>
  );
}

function RegisterDetailPanel({
  confirmed,
  total,
  prevReserve,
  transferAmount,
}: {
  confirmed: boolean;
  total: number;
  prevReserve: number;
  transferAmount: number;
}) {
  const { t } = useTranslation();

  return (
    <SidePanel title={t("page.front.breakdownDetail")}>
      {confirmed && (
        <>
          <PayCard title={t("page.front.safeCash")}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr auto 1fr",
                alignItems: "center",
                gap: 0.8,
              }}
            >
              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {t("page.front.openingBefore")}
                </Typography>
                <Typography
                  sx={{
                    border: "1px solid",
                    borderColor: BORDER,
                    borderRadius: 1,
                    px: 1,
                    py: 0.7,
                    fontWeight: 700,
                    color: "#9aa4b3",
                  }}
                >
                  {formatYen(prevReserve)}
                </Typography>
              </Box>
              <Typography sx={{ color: BLUE, fontSize: 24, lineHeight: 1 }}>
                »
              </Typography>
              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {t("page.front.openingAfter")}
                </Typography>
                <Typography
                  sx={{
                    border: "1px solid",
                    borderColor: BLUE,
                    borderRadius: 1,
                    px: 1,
                    py: 0.7,
                    fontWeight: 800,
                    color: BLUE,
                  }}
                >
                  {formatFlowAmount(transferAmount)}
                </Typography>
              </Box>
            </Box>
          </PayCard>
          <PayCard title={t("page.front.registerCash")}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr auto 1fr",
                alignItems: "center",
                gap: 0.8,
              }}
            >
              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {t("page.front.openingBefore")}
                </Typography>
                <Typography
                  sx={{
                    border: "1px solid",
                    borderColor: BORDER,
                    borderRadius: 1,
                    px: 1,
                    py: 0.7,
                    fontWeight: 700,
                    color: "#9aa4b3",
                  }}
                >
                  {formatYen(0)}
                </Typography>
              </Box>
              <Typography
                sx={{ color: "error.main", fontSize: 24, lineHeight: 1 }}
              >
                »
              </Typography>
              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {t("page.front.openingAfter")}
                </Typography>
                <Typography
                  sx={{
                    border: "1px solid",
                    borderColor: "error.main",
                    borderRadius: 1,
                    px: 1,
                    py: 0.7,
                    fontWeight: 800,
                    color: "error.main",
                  }}
                >
                  {formatFlowAmount(-transferAmount)}
                </Typography>
              </Box>
            </Box>
          </PayCard>
        </>
      )}
      <Box sx={{ flex: 1 }} />
      <SummaryLine
        label={t("page.front.totalAmount")}
        value={formatYen(total)}
        blue
        large
      />
    </SidePanel>
  );
}

function ReceiptOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  if (!open) return null;
  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        bgcolor: "rgba(0,0,0,0.55)",
        zIndex: 2000,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{ position: "absolute", top: 24, right: 24, color: "white" }}
      >
        <CloseIcon />
      </IconButton>
      <Paper sx={{ width: 420, height: 620, p: 4, bgcolor: "white" }}>
        <Typography variant="caption">
          {t("page.front.receiptTitle")}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
          {t("page.front.receiptBody")}
        </Typography>
      </Paper>
      <Button
        onClick={onClose}
        variant="contained"
        sx={{
          position: "absolute",
          right: 24,
          bottom: 24,
          borderRadius: "50%",
          minWidth: 56,
          height: 56,
        }}
      >
        <LocalAtmIcon />
      </Button>
    </Box>
  );
}

function CommonDialog({
  title,
  icon,
  children,
  onClose,
  onConfirm,
  confirm,
}: {
  title: string;
  icon?: ReactNode;
  children?: ReactNode;
  onClose: () => void;
  onConfirm: () => void;
  confirm: string;
}) {
  const { t } = useTranslation();

  return (
    <Dialog open maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{ textAlign: icon ? "center" : "left", fontWeight: 800 }}
      >
        {icon}
        <Box component="span" sx={{ display: "block" }}>
          {title}
        </Box>
      </DialogTitle>
      <DialogContent dividers>{children}</DialogContent>
      <DialogActions sx={{ justifyContent: "center", gap: 1, p: 2 }}>
        <Button variant="outlined" onClick={onClose} sx={{ minWidth: 150 }}>
          {t("page.front.cancel")}
        </Button>
        <Button variant="contained" onClick={onConfirm} sx={{ minWidth: 150 }}>
          {confirm}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function SidePanel({
  title,
  children,
}: {
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        minWidth: 0,
        p: 1.2,
        display: "flex",
        flexDirection: "column",
        bgcolor: "white",
        borderColor: BORDER,
      }}
    >
      <Typography sx={{ fontWeight: 700, mb: 0.8, fontSize: 13 }}>
        {title}
      </Typography>
      <Divider sx={{ mb: 1 }} />
      {children}
    </Paper>
  );
}

function SummaryLine({
  label,
  value,
  blue,
  danger,
  large,
}: {
  label: string;
  value: string;
  blue?: boolean;
  danger?: boolean;
  large?: boolean;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        py: 0.4,
      }}
    >
      <Typography
        variant="caption"
        sx={{
          fontWeight: large ? 700 : 500,
          color: danger ? "error.main" : "text.primary",
        }}
      >
        {label}
      </Typography>
      <Typography
        variant={large ? "h6" : "caption"}
        sx={{
          color: blue ? BLUE : danger ? "error.main" : "text.primary",
          fontWeight: 800,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function PayCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Paper
      variant="outlined"
      sx={{ p: 1.2, bgcolor: "white", borderColor: BORDER }}
    >
      <Typography sx={{ fontWeight: 700, mb: 1, fontSize: 13 }}>
        {title}
      </Typography>
      {children}
    </Paper>
  );
}

function PayButton({
  icon,
  label,
  onClick,
  minHeight = 78,
  disabled,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  minHeight?: number;
  disabled?: boolean;
}) {
  return (
    <Button
      onClick={onClick}
      variant="contained"
      fullWidth
      disabled={disabled}
      sx={{ minHeight, flexDirection: "column", gap: 0.45, fontSize: 12 }}
    >
      {icon}
      {label}
    </Button>
  );
}
