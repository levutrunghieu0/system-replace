import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { theme } from '../theme'
import { queryClient } from '../lib/queryClient'
import App from './App'

export default function AppProviders() {
  return (
    <>
      {/* Inject script trước React hydrate để tránh flash-of-wrong-theme khi reload */}
      <InitColorSchemeScript
        attribute="data-mui-color-scheme"
        modeStorageKey="mui-mode"
        defaultMode="light"
      />
      <ThemeProvider theme={theme} defaultMode="light">
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          <App />
          {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
      </ThemeProvider>
    </>
  )
}
