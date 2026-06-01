import { createFileRoute, Outlet, useRouterState } from '@tanstack/react-router'
import { useState } from 'react'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import OutlinedInput from '@mui/material/OutlinedInput'
import InputAdornment from '@mui/material/InputAdornment'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import PrintIcon from '@mui/icons-material/Print'
import TuneIcon from '@mui/icons-material/Tune'
import SearchIcon from '@mui/icons-material/Search'
import ViewWeekIcon from '@mui/icons-material/ViewWeek'
import VisibilityIcon from '@mui/icons-material/Visibility'
import SwapVertIcon from '@mui/icons-material/SwapVert'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import { useTranslation } from 'react-i18next'
import { useLayoutConfig } from '../hooks/useLayoutConfig'

export const Route = createFileRoute('/warehouse')({
  component: WarehouseLayoutRoute,
})

/**
 * Layout wrapper: renders child routes (csv-purchase, csv-purchase-correction)
 * via <Outlet /> when the path is a child, otherwise shows the list page.
 */
function WarehouseLayoutRoute() {
  const { location } = useRouterState()
  const isExactWarehouse = location.pathname === '/warehouse' || location.pathname === '/warehouse/'

  if (!isExactWarehouse) {
    return <Outlet />
  }

  return <WarehouseListPage />
}

// ─── Types ────────────────────────────────────────────────────────────────────

type EntryType = 'inbound' | 'outbound'
type EntryStatus = 'pending' | 'completed'

interface WarehouseEntry {
  id: number
  slipNumber: string | null
  type: EntryType
  scheduledDate: string
  totalAmount: number
  totalQuantity: number
  supplierName: string
  isRegular: boolean
  supplierCode: string
  deliveryNoteNumber: string | null
  status: EntryStatus
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockData: WarehouseEntry[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  slipNumber: i < 3 ? null : '123456',
  type: 'inbound',
  scheduledDate: '2026/02/25',
  totalAmount: 14000,
  totalQuantity: 6,
  supplierName: '関東営業所',
  isRegular: false,
  supplierCode: '00651',
  deliveryNoteNumber: i < 3 ? null : '123456',
  status: i < 3 ? 'pending' : 'completed',
}))

// ─── Sub-components ───────────────────────────────────────────────────────────

function TypeChip({ type }: { type: EntryType }) {
  const { t } = useTranslation()
  return (
    <Chip
      label={t(`page.warehouse.list.type.${type}` as Parameters<typeof t>[0])}
      size="small"
      sx={{
        bgcolor: type === 'inbound' ? '#ede7f6' : '#e3f2fd',
        color: type === 'inbound' ? '#7b1fa2' : '#1565c0',
        fontWeight: 600,
        fontSize: '0.72rem',
        height: 22,
        borderRadius: '4px',
      }}
    />
  )
}

function StatusChip({ status }: { status: EntryStatus }) {
  const { t } = useTranslation()
  const label = t(`page.warehouse.list.status.${status}` as Parameters<typeof t>[0])

  if (status === 'pending') {
    return (
      <Chip
        label={label}
        size="small"
        sx={{
          bgcolor: '#fff3e0',
          color: '#e65100',
          fontWeight: 600,
          fontSize: '0.72rem',
          height: 22,
          borderRadius: '4px',
          '&::before': { content: '"●"', mr: 0.4, fontSize: '0.55rem' },
        }}
        icon={
          <Box
            component="span"
            sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#e65100', ml: '6px !important', flexShrink: 0 }}
          />
        }
      />
    )
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: 'grey.400', flexShrink: 0 }} />
      <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>{label}</Typography>
    </Box>
  )
}

// ─── Filter bar ───────────────────────────────────────────────────────────────

function FilterBar() {
  const { t } = useTranslation()
  const [activeType, setActiveType] = useState<string | null>('inbound')

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        py: 1,
        flexWrap: 'wrap',
      }}
    >
      {/* 条件検索 */}
      <Button
        variant="contained"
        size="small"
        startIcon={<TuneIcon fontSize="small" />}
        sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.8rem', height: 32 }}
      >
        {t('page.warehouse.list.filter.condition')}
      </Button>

      {/* Active type chip */}
      {activeType && (
        <Chip
          label={t(`page.warehouse.list.type.${activeType}` as Parameters<typeof t>[0])}
          size="small"
          color="primary"
          onDelete={() => setActiveType(null)}
          sx={{ fontWeight: 600, fontSize: '0.78rem', height: 28 }}
        />
      )}

      {/* Dropdown filter chips */}
      {(
        [
          { key: 'status', label: t('page.warehouse.list.filter.status') },
          { key: 'supplier', label: t('page.warehouse.list.filter.supplier') },
          { key: 'regular', label: t('page.warehouse.list.filter.regular') },
        ] as const
      ).map((f) => (
        <Chip
          key={f.key}
          label={f.label}
          size="small"
          variant="outlined"
          deleteIcon={<ArrowDropDownIcon />}
          onDelete={() => {}}
          sx={{
            fontSize: '0.78rem',
            height: 28,
            '& .MuiChip-deleteIcon': { color: 'text.secondary', fontSize: '1rem' },
          }}
        />
      ))}

      {/* Date filter chip */}
      <Chip
        label={t('page.warehouse.list.filter.scheduledDate')}
        size="small"
        variant="outlined"
        icon={<CalendarMonthIcon sx={{ fontSize: '0.95rem !important' }} />}
        sx={{ fontSize: '0.78rem', height: 28 }}
      />

      {/* Spacer */}
      <Box sx={{ flex: 1 }} />

      {/* Display + Sort */}
      <Button
        size="small"
        startIcon={<VisibilityIcon fontSize="small" />}
        sx={{ textTransform: 'none', color: 'text.secondary', fontSize: '0.78rem' }}
      >
        {t('page.warehouse.list.filter.display')}
      </Button>

      <Button
        size="small"
        startIcon={<SwapVertIcon fontSize="small" />}
        endIcon={<ArrowDropDownIcon fontSize="small" />}
        sx={{ textTransform: 'none', color: 'text.secondary', fontSize: '0.78rem' }}
      >
        {t('page.warehouse.list.filter.newOrder')}
      </Button>
    </Box>
  )
}

// ─── Table ────────────────────────────────────────────────────────────────────

const headerCellSx = {
  fontSize: '0.78rem',
  fontWeight: 600,
  color: 'text.secondary',
  py: 1,
  px: 1.5,
  whiteSpace: 'nowrap',
  bgcolor: 'background.paper',
  borderBottom: '2px solid',
  borderColor: 'divider',
}

const bodyCellSx = {
  fontSize: '0.82rem',
  py: 0.75,
  px: 1.5,
  whiteSpace: 'nowrap',
  borderBottom: '1px solid',
  borderColor: 'divider',
}

function WarehouseTable({ data }: { data: WarehouseEntry[] }) {
  const { t } = useTranslation()

  return (
    <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            {[
              'no', 'slipNumber', 'type', 'scheduledDate',
              'totalAmount', 'totalQuantity', 'supplierName',
              'isRegular', 'supplierCode', 'deliveryNote', 'status',
            ].map((col) => (
              <TableCell key={col} sx={headerCellSx}>
                {t(`page.warehouse.list.col.${col}` as Parameters<typeof t>[0])}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow
              key={row.id}
              hover
              sx={{ '&:last-child td': { border: 0 }, cursor: 'pointer' }}
            >
              <TableCell sx={{ ...bodyCellSx, color: 'text.secondary' }}>{row.id}</TableCell>
              <TableCell sx={bodyCellSx}>{row.slipNumber ?? 'ー'}</TableCell>
              <TableCell sx={bodyCellSx}>
                <TypeChip type={row.type} />
              </TableCell>
              <TableCell sx={bodyCellSx}>{row.scheduledDate}</TableCell>
              <TableCell sx={{ ...bodyCellSx, textAlign: 'right' }}>
                ¥{row.totalAmount.toLocaleString()}
              </TableCell>
              <TableCell sx={{ ...bodyCellSx, textAlign: 'right' }}>{row.totalQuantity}</TableCell>
              <TableCell sx={bodyCellSx}>{row.supplierName}</TableCell>
              <TableCell sx={bodyCellSx}>{row.isRegular ? '●' : ''}</TableCell>
              <TableCell sx={bodyCellSx}>{row.supplierCode}</TableCell>
              <TableCell sx={bodyCellSx}>{row.deliveryNoteNumber ?? 'ー'}</TableCell>
              <TableCell sx={bodyCellSx}>
                <StatusChip status={row.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function WarehouseListPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')

  useLayoutConfig({
    title: t('page.warehouse.list.title'),
    actions: [
      {
        key: 'reportDefect',
        labelKey: 'page.warehouse.list.action.reportDefect',
        position: 'left',
        variant: 'outlined',
        color: 'inherit',
        onClick: () => {},
      },
      {
        key: 'function',
        labelKey: 'page.warehouse.list.action.function',
        position: 'left',
        variant: 'outlined',
        color: 'inherit',
        onClick: () => {},
      },
      {
        key: 'shipment',
        labelKey: 'page.warehouse.list.action.shipment',
        position: 'right',
        variant: 'outlined',
        color: 'inherit',
        onClick: () => {},
      },
      {
        key: 'print',
        labelKey: 'page.warehouse.list.action.print',
        position: 'right',
        variant: 'contained',
        color: 'primary',
        startIcon: <PrintIcon fontSize="small" />,
        onClick: () => {},
      },
    ],
  })

  const filtered = mockData.filter(
    (row) =>
      !search ||
      row.slipNumber?.includes(search) ||
      row.supplierName.includes(search) ||
      row.supplierCode.includes(search),
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: '100%' }}>
      {/* Page-level search */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <OutlinedInput
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('page.warehouse.list.search')}
          startAdornment={
            <InputAdornment position="start">
              <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            </InputAdornment>
          }
          endAdornment={
            <InputAdornment position="end">
              <Tooltip title="Barcode scan" arrow>
                <IconButton size="small" edge="end" sx={{ color: 'text.secondary' }}>
                  <ViewWeekIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          }
          sx={{
            width: 200,
            height: 36,
            fontSize: '0.875rem',
            bgcolor: 'background.paper',
            '& fieldset': { borderColor: 'divider' },
            '&:hover fieldset': { borderColor: 'text.secondary' },
          }}
        />
      </Box>

      {/* Filter bar */}
      <FilterBar />

      {/* Table */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <WarehouseTable data={filtered} />
      </Box>
    </Box>
  )
}
