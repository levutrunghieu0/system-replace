import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import type {
  BuybackScreen,
  EstimateState,
  EstimateItem,
  CouponInfo,
  IdDocumentType,
  PaymentMethod,
  PaymentRecord,
  PersonalInfo,
  PriceChangeLogEntry,
  SettlementError,
  SettlementStatus,
} from '../types'
import {
  DEMO_ITEMS,
  DEFAULT_PERSONAL_INFO,
  DEMO_LOW_REGISTER_BALANCE,
  DEMO_RECEPTION_NO,
  DEMO_REGISTER_BALANCE,
  DEMO_REGISTER_ID,
  DEMO_STAFF_ID,
  OVERLAY_SCREENS,
} from '../types'
import { computeEstimateTotals } from '../utils/estimateTotals'

type BuybackContextValue = {
  isOpen: boolean
  screen: BuybackScreen
  mainScreen: BuybackScreen
  estimateState: EstimateState
  items: EstimateItem[]
  staffCodeScanned: boolean
  coupon: CouponInfo
  reviseMode: boolean
  priceChangeLog: PriceChangeLogEntry[]
  selectedIdType: IdDocumentType | null
  personalInfo: PersonalInfo
  signatureData: string | null
  paymentMethod: PaymentMethod | null
  settlementStatus: SettlementStatus
  settlementError: SettlementError | null
  registerBalance: number
  paymentRecord: PaymentRecord | null
  allRejectNotice: boolean

  openBuyback: () => void
  closeBuyback: () => void
  goTo: (screen: BuybackScreen) => void
  simulateScan: () => void
  simulateError: () => void
  setStaffCodeScanned: () => void
  enterReviseMode: () => void
  exitReviseMode: () => void
  toggleItemReturned: (id: string) => void
  updateItemPrice: (id: string, price: number) => void
  updateItemQuantity: (id: string, delta: number) => void
  registerAllReject: () => void
  dismissAllRejectNotice: () => void
  setIdType: (type: IdDocumentType) => void
  updatePersonalInfo: (patch: Partial<PersonalInfo>) => void
  setSignature: (data: string) => void
  clearSignature: () => void
  setPaymentMethod: (method: PaymentMethod) => void
  executeSettlement: () => void
  clearSettlementError: () => void
  demoSetLowBalance: () => void
}

const defaultCoupon: CouponInfo = { status: 'idle', name: '', rate: 0 }

const SETTLEMENT_PROCESSING_MS = 2200

const BuybackContext = createContext<BuybackContextValue | null>(null)

export function BuybackProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [screen, setScreen] = useState<BuybackScreen>('estimate')
  const [mainScreen, setMainScreen] = useState<BuybackScreen>('estimate')
  const [estimateState, setEstimateState] = useState<EstimateState>('scan')
  const [items, setItems] = useState<EstimateItem[]>([])
  const [staffCodeScanned, setStaffCodeScannedState] = useState(false)
  const [coupon, setCoupon] = useState<CouponInfo>(defaultCoupon)
  const [reviseMode, setReviseMode] = useState(false)
  const [priceChangeLog, setPriceChangeLog] = useState<PriceChangeLogEntry[]>([])
  const [selectedIdType, setSelectedIdType] = useState<IdDocumentType | null>(null)
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({ ...DEFAULT_PERSONAL_INFO })
  const [signatureData, setSignatureData] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethodState] = useState<PaymentMethod | null>(null)
  const [settlementStatus, setSettlementStatus] = useState<SettlementStatus>('awaiting')
  const [settlementError, setSettlementError] = useState<SettlementError | null>(null)
  const [registerBalance, setRegisterBalance] = useState(DEMO_REGISTER_BALANCE)
  const [paymentRecord, setPaymentRecord] = useState<PaymentRecord | null>(null)
  const [allRejectNotice, setAllRejectNotice] = useState(false)

  const resetTransaction = useCallback(() => {
    setScreen('estimate')
    setMainScreen('estimate')
    setEstimateState('scan')
    setItems([])
    setStaffCodeScannedState(false)
    setCoupon(defaultCoupon)
    setReviseMode(false)
    setPriceChangeLog([])
    setSelectedIdType(null)
    setSignatureData(null)
    setPaymentMethodState(null)
    setSettlementStatus('awaiting')
    setSettlementError(null)
    setRegisterBalance(DEMO_REGISTER_BALANCE)
    setPaymentRecord(null)
  }, [])

  const openBuyback = useCallback(() => {
    resetTransaction()
    setPersonalInfo({ ...DEFAULT_PERSONAL_INFO })
    setAllRejectNotice(false)
    setIsOpen(true)
  }, [resetTransaction])

  const closeBuyback = useCallback(() => {
    setIsOpen(false)
    resetTransaction()
  }, [resetTransaction])

  const goTo = useCallback((s: BuybackScreen) => {
    setScreen(s)
    if (!OVERLAY_SCREENS.includes(s)) {
      setMainScreen(s)
    }
  }, [])

  const simulateScan = useCallback(() => {
    setEstimateState('loading')
    setTimeout(() => {
      setItems(DEMO_ITEMS)
      setEstimateState('list')
      setCoupon({ status: 'loading', name: '', rate: 0 })
      setTimeout(() => {
        setCoupon({ status: 'loaded', name: '買取20%UP', rate: 0.2 })
      }, 2000)
    }, 1500)
  }, [])

  const simulateError = useCallback(() => {
    setEstimateState('error')
  }, [])

  const setStaffCodeScanned = useCallback(() => {
    setStaffCodeScannedState(true)
  }, [])

  // E-28 Rule 1: prices are locked on the presentation screen. Revisions go
  // through an explicit "back to assessment" mode where every change is logged.
  const enterReviseMode = useCallback(() => {
    setReviseMode(true)
  }, [])

  const exitReviseMode = useCallback(() => {
    setReviseMode(false)
  }, [])

  // E-28 step 2/3: per-item accept/return decision with real-time recalc.
  const toggleItemReturned = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, returned: !item.returned } : item
      )
    )
  }, [])

  const updateItemPrice = useCallback(
    (id: string, price: number) => {
      setItems((prev) =>
        prev.map((item) => {
          if (item.id !== id || item.estimatedPrice === price) return item
          if (reviseMode) {
            setPriceChangeLog((log) => [
              ...log,
              { itemId: id, from: item.estimatedPrice, to: price, changedAt: new Date() },
            ])
          }
          return { ...item, estimatedPrice: price }
        })
      )
    },
    [reviseMode]
  )

  const updateItemQuantity = useCallback((id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    )
  }, [])

  // E-28 case 2: customer rejects everything — transaction ends and the data
  // is handed over to the failed-purchase search (E-52).
  const registerAllReject = useCallback(() => {
    setIsOpen(false)
    resetTransaction()
    setAllRejectNotice(true)
  }, [resetTransaction])

  const dismissAllRejectNotice = useCallback(() => {
    setAllRejectNotice(false)
  }, [])

  const setIdType = useCallback((type: IdDocumentType) => {
    setSelectedIdType(type)
  }, [])

  const updatePersonalInfo = useCallback((patch: Partial<PersonalInfo>) => {
    setPersonalInfo((prev) => ({ ...prev, ...patch }))
  }, [])

  const setSignature = useCallback((data: string) => {
    setSignatureData(data)
  }, [])

  const clearSignature = useCallback(() => {
    setSignatureData(null)
  }, [])

  const setPaymentMethod = useCallback((method: PaymentMethod) => {
    setPaymentMethodState(method)
  }, [])

  // E-35 精算実行 — enforces Rules 1-4 of the settlement spec.
  const executeSettlement = useCallback(() => {
    if (settlementStatus === 'processing') return
    // Rule 2: block duplicate payouts once settled.
    if (settlementStatus === 'completed') {
      setSettlementError('duplicate')
      return
    }
    // Rule 1: a signed consent form is a legal precondition for payout.
    if (!signatureData) {
      setSettlementError('consent-required')
      return
    }
    const { total } = computeEstimateTotals(items, coupon)
    // Rule 3: cash payouts require sufficient register balance.
    if (paymentMethod === 'cash' && registerBalance < total) {
      setSettlementError('insufficient-balance')
      return
    }
    setSettlementStatus('processing')
    // Simulates the cash drawer opening and the receipt printer producing
    // the customer & store copies before the transaction is finalized.
    setTimeout(() => {
      if (paymentMethod === 'cash') {
        setRegisterBalance((balance) => balance - total)
      }
      // Rule 4: financial journal entry, timestamped to the second.
      setPaymentRecord({
        transactionId: `TX-${Date.now()}`,
        receptionNo: DEMO_RECEPTION_NO,
        amount: total,
        staffId: DEMO_STAFF_ID,
        registerId: DEMO_REGISTER_ID,
        paidAt: new Date(),
      })
      setSettlementStatus('completed')
    }, SETTLEMENT_PROCESSING_MS)
  }, [settlementStatus, signatureData, items, coupon, paymentMethod, registerBalance])

  const clearSettlementError = useCallback(() => {
    setSettlementError(null)
  }, [])

  const demoSetLowBalance = useCallback(() => {
    setRegisterBalance(DEMO_LOW_REGISTER_BALANCE)
  }, [])

  return (
    <BuybackContext.Provider
      value={{
        isOpen,
        screen,
        mainScreen,
        estimateState,
        items,
        staffCodeScanned,
        coupon,
        reviseMode,
        priceChangeLog,
        selectedIdType,
        personalInfo,
        signatureData,
        paymentMethod,
        settlementStatus,
        settlementError,
        registerBalance,
        paymentRecord,
        allRejectNotice,
        openBuyback,
        closeBuyback,
        goTo,
        simulateScan,
        simulateError,
        setStaffCodeScanned,
        enterReviseMode,
        exitReviseMode,
        toggleItemReturned,
        updateItemPrice,
        updateItemQuantity,
        registerAllReject,
        dismissAllRejectNotice,
        setIdType,
        updatePersonalInfo,
        setSignature,
        clearSignature,
        setPaymentMethod,
        executeSettlement,
        clearSettlementError,
        demoSetLowBalance,
      }}
    >
      {children}
    </BuybackContext.Provider>
  )
}

export function useBuyback(): BuybackContextValue {
  const ctx = useContext(BuybackContext)
  if (!ctx) throw new Error('useBuyback must be inside BuybackProvider')
  return ctx
}
