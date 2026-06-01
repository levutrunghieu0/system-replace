import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'

interface AppTableSelectionActionsProps {
  selectedCount: number
  children?: ReactNode
}

export function AppTableSelectionActions({ selectedCount, children }: AppTableSelectionActionsProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Chip
        label={`${selectedCount} selected`}
        color="primary"
        size="small"
        sx={{ fontWeight: 600 }}
      />
      {children}
    </Box>
  )
}
