import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import type {
  WizardScreen,
  ReceptionForm,
  StaffConfirmForm,
  BagHandling,
} from '../types'
import { DEVICE_CATEGORIES } from '../types'

type ReceptionContextValue = {
  screen: WizardScreen
  prevScreen: WizardScreen | null
  form: ReceptionForm
  staffForm: StaffConfirmForm
  deviceCheckTarget: string | null
  isWizardOpen: boolean
  openWizard: () => void
  closeWizard: () => void
  goTo: (screen: WizardScreen) => void
  goBack: () => void
  updateForm: (patch: Partial<ReceptionForm>) => void
  updateStaffForm: (patch: Partial<StaffConfirmForm>) => void
  setBagHandling: (v: BagHandling) => void
  setDeviceCheckDone: (category: string, count: number) => void
  openDeviceCheck: (category: string) => void
  resetAll: () => void
}

const defaultForm: ReceptionForm = {
  birthDate: { year: '', month: '', day: '', era: 'western' },
  phone: '',
  noPhone: false,
  itemCategories: ['ない'],
  coupons: ['ない'],
  smsCapable: null,
}

const defaultStaffForm: StaffConfirmForm = {
  bagHandling: 'return',
  branchCount: 1,
  deviceChecks: Object.fromEntries(DEVICE_CATEGORIES.map((c) => [c, { done: false, count: 0 }])),
}

const ReceptionContext = createContext<ReceptionContextValue | null>(null)

export function ReceptionProvider({ children }: { children: ReactNode }) {
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [screen, setScreen] = useState<WizardScreen>('top')
  const [prevScreen, setPrevScreen] = useState<WizardScreen | null>(null)
  const [form, setForm] = useState<ReceptionForm>(defaultForm)
  const [staffForm, setStaffForm] = useState<StaffConfirmForm>(defaultStaffForm)
  const [deviceCheckTarget, setDeviceCheckTarget] = useState<string | null>(null)

  const openWizard = useCallback(() => {
    setScreen('handoff-to-customer')
    setIsWizardOpen(true)
  }, [])

  const closeWizard = useCallback(() => {
    setIsWizardOpen(false)
    setScreen('top')
    setPrevScreen(null)
    setForm(defaultForm)
    setStaffForm(defaultStaffForm)
    setDeviceCheckTarget(null)
  }, [])

  const goTo = useCallback((next: WizardScreen) => {
    setScreen((current) => {
      setPrevScreen(current)
      return next
    })
  }, [])

  const goBack = useCallback(() => {
    if (prevScreen) {
      setScreen(prevScreen)
      setPrevScreen(null)
    }
  }, [prevScreen])

  const updateForm = useCallback((patch: Partial<ReceptionForm>) => {
    setForm((f) => ({ ...f, ...patch }))
  }, [])

  const updateStaffForm = useCallback((patch: Partial<StaffConfirmForm>) => {
    setStaffForm((f) => ({ ...f, ...patch }))
  }, [])

  const setBagHandling = useCallback((v: BagHandling) => {
    setStaffForm((f) => ({ ...f, bagHandling: v }))
  }, [])

  const setDeviceCheckDone = useCallback((category: string, count: number) => {
    setStaffForm((f) => ({
      ...f,
      deviceChecks: {
        ...f.deviceChecks,
        [category]: { done: true, count },
      },
    }))
  }, [])

  const openDeviceCheck = useCallback((category: string) => {
    setDeviceCheckTarget(category)
    setScreen('device-check')
  }, [])

  const resetAll = useCallback(() => {
    setForm(defaultForm)
    setStaffForm(defaultStaffForm)
    setDeviceCheckTarget(null)
  }, [])

  return (
    <ReceptionContext.Provider
      value={{
        screen,
        prevScreen,
        form,
        staffForm,
        deviceCheckTarget,
        isWizardOpen,
        openWizard,
        closeWizard,
        goTo,
        goBack,
        updateForm,
        updateStaffForm,
        setBagHandling,
        setDeviceCheckDone,
        openDeviceCheck,
        resetAll,
      }}
    >
      {children}
    </ReceptionContext.Provider>
  )
}

export function useReception(): ReceptionContextValue {
  const ctx = useContext(ReceptionContext)
  if (!ctx) throw new Error('useReception must be inside ReceptionProvider')
  return ctx
}
