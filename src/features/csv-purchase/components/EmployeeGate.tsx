import { useState, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import ViewWeekIcon from '@mui/icons-material/ViewWeek'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { useTranslation } from 'react-i18next'
import { csvPurchaseApi } from '../api/csvPurchaseApi'
import type { Employee } from '../types'

const DEMO_EMPLOYEE: Employee = { code: 'DEMO', name: 'デモモード' }

interface EmployeeGateProps {
  children?: (employee: Employee, onLogout: () => void) => ReactNode
  demoStorageKey?: string
  onAuthenticated?: (employee: Employee) => void
}

export function EmployeeGate({ children, demoStorageKey, onAuthenticated }: EmployeeGateProps) {
  const { t } = useTranslation()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [demoMode, setDemoMode] = useState(() =>
    demoStorageKey ? localStorage.getItem(demoStorageKey) === 'true' : false
  )

  useEffect(() => {
    if (demoMode) {
      setEmployee(DEMO_EMPLOYEE)
      return
    }
    const saved = sessionStorage.getItem('tantousha')
    if (saved) {
      try {
        setEmployee(JSON.parse(saved))
      } catch (e) {
        sessionStorage.removeItem('tantousha')
      }
    }
  }, [demoMode])

  const handleLogin = async (inputCode: string) => {
    if (!inputCode.trim()) return
    setLoading(true)
    setError(null)
    try {
      const emp = await csvPurchaseApi.verifyEmployee(inputCode.trim())
      sessionStorage.setItem('tantousha', JSON.stringify(emp))
      setEmployee(emp)
    } catch (e: unknown) {
      if (e instanceof Error) {
        if (e.message.includes('が見つかりません')) {
          setError(t('page.warehouse.csvPurchase.employeeGate.employeeNotFound'))
        } else {
          setError(e.message)
        }
      } else {
        setError(t('page.warehouse.csvPurchase.employeeGate.error'))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('tantousha')
    setEmployee(null)
    setCode('')
    setError(null)
  }

  const simulateScan = () => {
    // Fill in default code 123456 from the wireframe
    setCode('123456')
    handleLogin('123456')
  }

  const handleToggleDemo = (_: React.ChangeEvent<HTMLInputElement>, enabled: boolean) => {
    if (!demoStorageKey) return
    localStorage.setItem(demoStorageKey, String(enabled))
    setDemoMode(enabled)
    if (!enabled) {
      sessionStorage.removeItem('tantousha')
      setEmployee(null)
      setCode('')
      setError(null)
    }
  }

  const onAuthenticatedRef = useRef(onAuthenticated)
  onAuthenticatedRef.current = onAuthenticated

  useEffect(() => {
    if (employee && onAuthenticatedRef.current) {
      onAuthenticatedRef.current(employee)
    }
  }, [employee])

  if (employee) {
    if (onAuthenticated) return null
    return children ? <>{children(employee, handleLogout)}</> : null
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        p: 2,
        bgcolor: 'background.default',
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 420, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', borderRadius: 3 }}>
        <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
              {t('page.warehouse.csvPurchase.employeeGate.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('page.warehouse.csvPurchase.employeeGate.subtitle')}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ py: 0.25, fontSize: '0.8rem' }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label={t('page.warehouse.csvPurchase.employeeGate.label')}
            placeholder={t('page.warehouse.csvPurchase.employeeGate.placeholder')}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleLogin(code)
            }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title={t('page.warehouse.csvPurchase.employeeGate.scanLabel')} arrow>
                      <IconButton onClick={simulateScan} disabled={loading} size="small" edge="end">
                        <ViewWeekIcon />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Box sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
            <Button
              variant="outlined"
              color="inherit"
              fullWidth
              disabled={loading}
              onClick={simulateScan}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              {t('page.warehouse.csvPurchase.employeeGate.scanLabel')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading || !code.trim()}
              onClick={() => handleLogin(code)}
              sx={{ textTransform: 'none', fontWeight: 700 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : t('page.warehouse.csvPurchase.employeeGate.authLabel')}
            </Button>
          </Box>

          {demoStorageKey && (
            <Box sx={{ pt: 1.5, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'flex-end' }}>
              <FormControlLabel
                control={<Switch checked={demoMode} onChange={handleToggleDemo} size="small" color="warning" />}
                label={<Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>デモモード</Typography>}
                labelPlacement="start"
                sx={{ mr: 0 }}
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}
