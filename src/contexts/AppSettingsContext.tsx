import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { StoreUserRole } from '../features/buy-back/types'

const EMPLOYEE_AUTH_KEY = 'app_employee_auth_enabled'
const USER_ROLE_KEY = 'app_user_role'

const VALID_ROLES: StoreUserRole[] = ['staff', 'shiftManager', 'storeManager']

interface AppSettingsContextValue {
  employeeAuthEnabled: boolean
  setEmployeeAuthEnabled: (v: boolean) => void
  /** Role of the logged-in store user; gates manager-only screens (e.g. E-52). */
  userRole: StoreUserRole
  setUserRole: (role: StoreUserRole) => void
}

const AppSettingsContext = createContext<AppSettingsContextValue>({
  employeeAuthEnabled: false,
  setEmployeeAuthEnabled: () => {},
  userRole: 'shiftManager',
  setUserRole: () => {},
})

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [employeeAuthEnabled, setEmployeeAuthEnabledState] = useState(
    () => localStorage.getItem(EMPLOYEE_AUTH_KEY) === 'true'
  )
  const [userRole, setUserRoleState] = useState<StoreUserRole>(() => {
    const stored = localStorage.getItem(USER_ROLE_KEY) as StoreUserRole | null
    return stored && VALID_ROLES.includes(stored) ? stored : 'shiftManager'
  })

  const setEmployeeAuthEnabled = (v: boolean) => {
    localStorage.setItem(EMPLOYEE_AUTH_KEY, String(v))
    setEmployeeAuthEnabledState(v)
  }

  const setUserRole = (role: StoreUserRole) => {
    localStorage.setItem(USER_ROLE_KEY, role)
    setUserRoleState(role)
  }

  return (
    <AppSettingsContext.Provider
      value={{ employeeAuthEnabled, setEmployeeAuthEnabled, userRole, setUserRole }}
    >
      {children}
    </AppSettingsContext.Provider>
  )
}

export function useAppSettings() {
  return useContext(AppSettingsContext)
}
