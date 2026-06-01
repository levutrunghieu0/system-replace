import { createContext, useContext, useState, type ReactNode } from 'react'
import type { SxProps, Theme } from '@mui/material'

export interface ActionButton {
  key: string
  labelKey: string
  disabled?: boolean
  variant?: 'contained' | 'outlined' | 'text'
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' | 'inherit'
  position?: 'left' | 'right'
  startIcon?: ReactNode
  sx?: SxProps<Theme>
  onClick: () => void
}

export interface LayoutContextValue {
  screenTitle: string
  setScreenTitle: (title: string) => void
  showBackButton: boolean
  setShowBackButton: (show: boolean) => void
  actions: ActionButton[]
  setActions: (actions: ActionButton[]) => void
  /** When true, SecondaryNav is hidden to expand the work area. */
  forceHideSecondaryNav: boolean
  setForceHideSecondaryNav: (hide: boolean) => void
  /** If provided, the header back button calls this instead of router.history.back(). */
  onBack: (() => void) | undefined
  setOnBack: (fn: (() => void) | undefined) => void
}

export const LayoutContext = createContext<LayoutContextValue | null>(null)

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [screenTitle, setScreenTitle] = useState('')
  const [showBackButton, setShowBackButton] = useState(false)
  const [actions, setActions] = useState<ActionButton[]>([])
  const [forceHideSecondaryNav, setForceHideSecondaryNav] = useState(false)
  const [onBack, setOnBack] = useState<(() => void) | undefined>(undefined)

  return (
    <LayoutContext.Provider
      value={{
        screenTitle, setScreenTitle,
        showBackButton, setShowBackButton,
        actions, setActions,
        forceHideSecondaryNav, setForceHideSecondaryNav,
        onBack, setOnBack,
      }}
    >
      {children}
    </LayoutContext.Provider>
  )
}

export function useLayoutContext() {
  const ctx = useContext(LayoutContext)
  if (!ctx) throw new Error('useLayoutContext must be used inside LayoutProvider')
  return ctx
}
