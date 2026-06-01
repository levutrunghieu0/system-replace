import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import type { ColumnDef, RowSelectionState } from '@tanstack/react-table'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import OutlinedInput from '@mui/material/OutlinedInput'
import Paper from '@mui/material/Paper'
import Snackbar from '@mui/material/Snackbar'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import ClearIcon from '@mui/icons-material/Clear'
import EditIcon from '@mui/icons-material/Edit'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import ImageIcon from '@mui/icons-material/Image'
import { useTranslation } from 'react-i18next'
import { AppTable } from '../components/table'
import { AppModal } from '../components/common/AppModal'
import { useLayoutConfig } from '../hooks/useLayoutConfig'

export const Route = createFileRoute('/inventory/correction')({
  component: CorrectionPage,
})

interface ProductRow {
  id: number
  rowNo: number
  gender: string
  brand: string
  productName: string
  size: string
  type: 'リユース' | 'バルク' | 'ノーブランド'
  codes: string[]
  stock: number
  originalPrice: number
  initialSalePrice: number
  lastPriceUpdate: string
  salePrice: number
  lastArrival: string
  ecStatus: 'listed' | 'notListed' | 'ended'
}

const MOCK_DATA: Record<string, ProductRow[]> = {
  '100-10': [
    { id: 1, rowNo: 1, gender: 'メンズ', brand: 'ナイキ', productName: 'Nike Zoom Vomero 5', size: 'メンズ/25cm', type: 'リユース', codes: ['12345', '67890', '12345'], stock: 1, originalPrice: 2500, initialSalePrice: 4000, lastPriceUpdate: '2026/1/23', salePrice: 10000000, lastArrival: '2026/1/25', ecStatus: 'listed' },
    { id: 2, rowNo: 2, gender: 'レディース', brand: 'ナイキ', productName: 'Air Force 1 ロートップ', size: 'レディース/23cm', type: 'リユース', codes: ['23456', '78901', '23456'], stock: 2, originalPrice: 5800, initialSalePrice: 8000, lastPriceUpdate: '2026/2/10', salePrice: 12000, lastArrival: '2026/2/01', ecStatus: 'notListed' },
    { id: 3, rowNo: 3, gender: 'メンズ', brand: 'アディダス', productName: 'Superstar', size: 'メンズ/27cm', type: 'リユース', codes: ['34567', '89012', '34567'], stock: 0, originalPrice: 3200, initialSalePrice: 4500, lastPriceUpdate: '2026/1/15', salePrice: 5500, lastArrival: '2026/1/10', ecStatus: 'ended' },
  ],
  '002-03': [
    { id: 4, rowNo: 1, gender: 'メンズ', brand: 'ユニクロ', productName: 'スラックス　ブラック', size: 'L/76cm', type: 'バルク', codes: ['54321', '10987', '54321'], stock: 2, originalPrice: 2800, initialSalePrice: 3500, lastPriceUpdate: '2026/3/01', salePrice: 3500, lastArrival: '2026/3/10', ecStatus: 'notListed' },
  ],
}

type DialogState =
  | { kind: 'none' }
  | { kind: 'correct'; row: ProductRow }
  | { kind: 'delete';  row: ProductRow }
  | { kind: 'add' }

function ecLabel(s: ProductRow['ecStatus']) {
  if (s === 'listed')    return { label: '掌載中',   dot: '#4caf50' }
  if (s === 'notListed') return { label: '未掌載',   dot: '#9e9e9e' }
  return                        { label: '掌載終了', dot: '#f44336' }
}

function CorrectionPage() {
  const { t } = useTranslation()
  const [scanInput,    setScanInput]    = useState('')
  const [currentShelf, setCurrentShelf] = useState<string | null>(null)
  const [rows,         setRows]         = useState<ProductRow[]>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [dialogState,  setDialogState]  = useState<DialogState>({ kind: 'none' })
  const [newQty,       setNewQty]       = useState('')
  const [addCode,      setAddCode]      = useState('')
  const [addQty,       setAddQty]       = useState('1')
  const [toast,        setToast]        = useState({ open: false, message: '' })

  useLayoutConfig({
    title: t('page.tanazaoroshi.correction.title'),
  })

  const handleSearch = () => {
    const val = scanInput.trim()
    if (!val) return
    if (MOCK_DATA[val]) {
      setCurrentShelf(val)
      setRows(MOCK_DATA[val])
    } else {
      const entry = Object.entries(MOCK_DATA).find(([, ps]) => ps.some((p) => p.codes.includes(val)))
      if (entry) { setCurrentShelf(entry[0]); setRows(entry[1]) }
      else       { setCurrentShelf(val);       setRows([]) }
    }
    setScanInput('')
    setRowSelection({})
  }

  const handleSaveCorrect = () => {
    if (dialogState.kind !== 'correct') return
    const qty = parseInt(newQty, 10)
    if (isNaN(qty) || qty < 0) return
    setRows((prev) => prev.map((r) => r.id === dialogState.row.id ? { ...r, stock: qty } : r))
    setDialogState({ kind: 'none' })
    setToast({ open: true, message: t('page.tanazaoroshi.correction.toast.saved') })
  }

  const handleDelete = () => {
    if (dialogState.kind !== 'delete') return
    setRows((prev) => prev.filter((r) => r.id !== dialogState.row.id))
    setRowSelection({})
    setDialogState({ kind: 'none' })
    setToast({ open: true, message: '削除しました。' })
  }

  const handleAddProduct = () => {
    const code = addCode.trim()
    const qty = parseInt(addQty, 10)
    if (!code || isNaN(qty) || qty < 0) return
    const newRow: ProductRow = {
      id: Date.now(),
      rowNo: rows.length + 1,
      gender: 'ー',
      brand: 'ー',
      productName: code,
      size: 'ー',
      type: 'リユース',
      codes: [code],
      stock: qty,
      originalPrice: 0,
      initialSalePrice: 0,
      lastPriceUpdate: 'ー',
      salePrice: 0,
      lastArrival: 'ー',
      ecStatus: 'notListed',
    }
    setRows((prev) => [...prev, newRow])
    setAddCode('')
    setAddQty('1')
    setDialogState({ kind: 'none' })
    setToast({ open: true, message: '商品を追加しました。' })
  }

  const someSelected = Object.values(rowSelection).some(Boolean)

  const columns = useMemo<ColumnDef<ProductRow>[]>(() => [
    {
      id: 'rowNo',
      header: '#',
      size: 40,
      enableSorting: false,
      cell: ({ row }) => (
        <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>
          {String(row.original.rowNo).padStart(3, '0')}
        </Typography>
      ),
      meta: { headerSx: { textAlign: 'center', width: 40 }, cellSx: { textAlign: 'center' } },
    },
    {
      id: 'productName',
      header: '商品名',
      enableSorting: false,
      cell: ({ row }) => {
        const r = row.original
        return (
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <Box sx={{ width: 40, height: 40, border: '1px solid', borderColor: 'divider', borderRadius: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ImageIcon sx={{ fontSize: 20, color: 'text.disabled' }} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', gap: 0.5, mb: 0.25, flexWrap: 'wrap' }}>
                <Chip label={r.gender} size="small" sx={{ fontSize: '0.68rem', height: 18 }} />
                <Chip label={r.brand} size="small" variant="outlined" sx={{ fontSize: '0.68rem', height: 18 }} />
              </Box>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, lineHeight: 1.3 }}>{r.productName}</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{r.size}</Typography>
            </Box>
          </Box>
        )
      },
      meta: { cellSx: { minWidth: 220, whiteSpace: 'nowrap' as const } },
    },
    {
      id: 'type',
      header: 'タイプ',
      enableSorting: false,
      cell: ({ row }) => (
        <Chip label={row.original.type} size="small"
          color={row.original.type === 'リユース' ? 'warning' : row.original.type === 'バルク' ? 'info' : 'default'}
          sx={{ fontSize: '0.72rem', height: 22 }}
        />
      ),
    },
    {
      id: 'codes',
      header: 'コード',
      enableSorting: false,
      cell: ({ row }) => (
        <Box sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
          {row.original.codes.map((c, i) => <Box key={i}>{c}</Box>)}
        </Box>
      ),
      meta: { cellSx: { whiteSpace: 'nowrap' as const } },
    },
    {
      id: 'stock',
      header: '在庫',
      enableSorting: false,
      cell: ({ row }) => (
        <Typography sx={{ fontSize: '0.82rem', fontWeight: 700 }}>{row.original.stock}</Typography>
      ),
      meta: { headerSx: { textAlign: 'right' }, cellSx: { textAlign: 'right' } },
    },
    {
      id: 'price',
      header: '価格情報',
      enableSorting: false,
      cell: ({ row }) => {
        const r = row.original
        return (
          <Box sx={{ fontSize: '0.75rem', color: 'text.secondary', minWidth: 160 }}>
            <Box>原　価：￥{r.originalPrice.toLocaleString()}</Box>
            <Box>初期売価：￥{r.initialSalePrice.toLocaleString()}</Box>
            <Box sx={{ fontSize: '0.70rem', mt: 0.25 }}>最終更新日 {r.lastPriceUpdate}</Box>
          </Box>
        )
      },
      meta: { cellSx: { minWidth: 160 as const } },
    },
    {
      id: 'salePrice',
      header: '売価',
      enableSorting: false,
      cell: ({ row }) => {
        const [editing, setEditing] = useState(false)
        const [value, setValue] = useState(row.original.salePrice.toString())
        const handleSave = () => {
          const num = parseInt(value, 10)
          if (!isNaN(num) && num >= 0 && num !== row.original.salePrice) {
            setRows((prev) => prev.map((r) => r.id === row.original.id ? { ...r, salePrice: num } : r))
            setToast({ open: true, message: '売価を更新しました。' })
          }
          setEditing(false)
        }
        return editing ? (
          <TextField
            size="small"
            type="number"
            value={value}
            autoFocus
            onChange={e => setValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
            slotProps={{ htmlInput: { style: { textAlign: 'right', width: 80 } } }}
          />
        ) : (
          <Box
            sx={{ border: '1px solid', borderColor: 'primary.main', borderRadius: 0.5, px: 1, py: 0.25, display: 'inline-block', minWidth: 90, cursor: 'pointer' }}
            onClick={() => setEditing(true)}
          >
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: 'primary.main', textAlign: 'right' }}>
              ￥{row.original.salePrice.toLocaleString()}
            </Typography>
          </Box>
        )
      },
      meta: { headerSx: { textAlign: 'right' }, cellSx: { textAlign: 'right' } },
    },
    {
      id: 'lastArrival',
      header: '最終仕入日',
      enableSorting: false,
      cell: ({ row }) => <Typography sx={{ fontSize: '0.82rem' }}>{row.original.lastArrival}</Typography>,
      meta: { cellSx: { whiteSpace: 'nowrap' as const } },
    },
    {
      id: 'ecStatus',
      header: 'EC掃載',
      enableSorting: false,
      cell: ({ row }) => {
        const ec = ecLabel(row.original.ecStatus)
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: ec.dot, flexShrink: 0 }} />
            <Typography sx={{ fontSize: '0.78rem' }}>{ec.label}</Typography>
          </Box>
        )
      },
      meta: { cellSx: { whiteSpace: 'nowrap' as const } },
    },
    {
      id: 'actions',
      header: '操作',
      size: 80,
      enableSorting: false,
      cell: ({ row }) => (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Tooltip title={t('page.tanazaoroshi.correction.action.edit')}>
            <IconButton size="small" onClick={() => { setDialogState({ kind: 'correct', row: row.original }); setNewQty(String(row.original.stock)) }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('page.tanazaoroshi.correction.action.delete')}>
            <IconButton size="small" color="error" onClick={() => setDialogState({ kind: 'delete', row: row.original })}>
              <DeleteOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
      meta: { headerSx: { textAlign: 'center' }, cellSx: { textAlign: 'center', whiteSpace: 'nowrap' as const } },
    },
  ], [t, setDialogState, setNewQty])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, height: '100%' }}>
      {/* Scan input */}
      <Paper variant="outlined" sx={{ p: 1.5 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          <OutlinedInput
            size="small"
            value={scanInput}
            onChange={(e) => setScanInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={t('page.tanazaoroshi.correction.scanPlaceholder')}
            startAdornment={<InputAdornment position="start"><QrCodeScannerIcon fontSize="small" sx={{ color: 'text.secondary' }} /></InputAdornment>}
            endAdornment={scanInput ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setScanInput('')}><ClearIcon fontSize="small" /></IconButton>
              </InputAdornment>
            ) : null}
            sx={{ width: 320 }}
          />
          <Button variant="contained"  onClick={handleSearch} disabled={!scanInput.trim()}>検索</Button>
          {currentShelf && (
            <Chip label={`${t('page.tanazaoroshi.correction.shelfLabel')}：${currentShelf}`} size="small" color="primary" variant="outlined" />
          )}
          {currentShelf && (
            <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', ml: 'auto' }}>
              スキャン担当者：<strong>田中</strong>
            </Typography>
          )}
        </Box>
      </Paper>

      {/* Rich product table */}
      <AppTable<ProductRow>
        data={rows}
        columns={columns}
        getRowId={(row) => String(row.id)}
        rowSelection
        state={{ rowSelection }}
        onRowSelectionChange={setRowSelection}
        stickyHeader
        containerMaxHeight={480}
        dense
        
        emptyMessage={currentShelf ? t('page.tanazaoroshi.correction.noData') : (
          <Box sx={{ textAlign: 'center', color: 'text.disabled', pt: 4 }}>
            <QrCodeScannerIcon sx={{ fontSize: 48, mb: 1 }} />
            <Typography sx={{ fontSize: '1rem', color: 'text.disabled', fontWeight: 400 }}>
              タグのバーコードをスキャン<br />または商品コードを直接入力してください
            </Typography>
          </Box>
        )}
        tableSx={{ minWidth: 1100 }}
      />

      <Paper variant="outlined" sx={{ p: 1, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        <Button size="small" variant="outlined" disabled={!someSelected}
          onClick={() => { const sel = rows.find(r => rowSelection[String(r.id)]); if (sel) { setDialogState({ kind: 'correct', row: sel }); setNewQty(String(sel.stock)) } }}>
          訂正
        </Button>
        <Button size="small" variant="outlined" color="error" disabled={!someSelected}
          onClick={() => { setRows(prev => prev.filter(r => !rowSelection[String(r.id)])); setRowSelection({}) }}>
          行削除
        </Button>
        <Button size="small" variant="outlined" startIcon={<AddCircleOutlinedIcon fontSize="small" />}
          onClick={() => setDialogState({ kind: 'add' })}>
          商品追加
        </Button>
        <Button size="small" variant="contained" color="success" startIcon={<PlayArrowIcon fontSize="small" />}
          disabled={rows.length === 0}
          onClick={() => setToast({ open: true, message: t('page.tanazaoroshi.correction.toast.saved') })}>
          実行
        </Button>
      </Paper>

      {/* Correct quantity dialog */}
      <AppModal
        open={dialogState.kind === 'correct'}
        onClose={() => setDialogState({ kind: 'none' })}
        title={t('page.tanazaoroshi.correction.dialog.title')}
        actions={[
          { label: t('page.tanazaoroshi.correction.dialog.cancel'), onClick: () => setDialogState({ kind: 'none' }), color: 'inherit' },
          { label: t('page.tanazaoroshi.correction.dialog.save'), onClick: handleSaveCorrect, variant: 'contained' },
        ]}
      >
        {dialogState.kind === 'correct' && (
          <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary', mb: 1.5 }}>{dialogState.row.productName}（{dialogState.row.size}）</Typography>
        )}
        <TextField label={t('page.tanazaoroshi.correction.dialog.quantity')} size="small" type="number" value={newQty}
          onChange={(e) => setNewQty(e.target.value)} autoFocus fullWidth onKeyDown={(e) => e.key === 'Enter' && handleSaveCorrect()} />
      </AppModal>

      {/* Delete dialog */}
      <AppModal
        open={dialogState.kind === 'delete'}
        onClose={() => setDialogState({ kind: 'none' })}
        title={t('page.tanazaoroshi.correction.dialog.deleteTitle')}
        actions={[
          { label: t('page.tanazaoroshi.correction.dialog.cancel'), onClick: () => setDialogState({ kind: 'none' }), color: 'inherit' },
          { label: t('page.tanazaoroshi.correction.dialog.delete'), onClick: handleDelete, variant: 'contained', color: 'error' },
        ]}
      >
        <Typography sx={{ fontSize: '0.9rem' }}>{t('page.tanazaoroshi.correction.dialog.deleteConfirm')}</Typography>
        {dialogState.kind === 'delete' && (
          <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary', mt: 0.5 }}>
            {dialogState.row.productName}（{dialogState.row.size}）
          </Typography>
        )}
      </AppModal>

      {/* Add product dialog */}
      <AppModal
        open={dialogState.kind === 'add'}
        onClose={() => setDialogState({ kind: 'none' })}
        title="商品追加"
        actions={[
          { label: 'キャンセル', onClick: () => setDialogState({ kind: 'none' }), color: 'inherit' },
          { label: '追加', onClick: handleAddProduct, variant: 'contained', disabled: !addCode.trim() },
        ]}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <TextField size="small" label="商品コード" autoFocus value={addCode} onChange={(e) => setAddCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddProduct()}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><QrCodeScannerIcon fontSize="small" /></InputAdornment> } }} />
          <TextField size="small" label="棚卸数" type="number" value={addQty} onChange={(e) => setAddQty(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddProduct()} />
        </Box>
      </AppModal>

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast((p) => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <Alert severity="success" variant="filled" sx={{ fontSize: '0.85rem' }}>{toast.message}</Alert>
      </Snackbar>
    </Box>
  )
}
