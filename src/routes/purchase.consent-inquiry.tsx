import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useRef, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import OutlinedInput from '@mui/material/OutlinedInput'
import Paper from '@mui/material/Paper'
import Snackbar from '@mui/material/Snackbar'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import AddCommentOutlinedIcon from '@mui/icons-material/AddCommentOutlined'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ClearIcon from '@mui/icons-material/Clear'
import ImageSearchOutlinedIcon from '@mui/icons-material/ImageSearchOutlined'
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined'
import NoteAddOutlinedIcon from '@mui/icons-material/NoteAddOutlined'
import PlagiarismOutlinedIcon from '@mui/icons-material/PlagiarismOutlined'
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined'
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import SearchIcon from '@mui/icons-material/Search'
import ZoomInIcon from '@mui/icons-material/ZoomIn'
import ZoomOutIcon from '@mui/icons-material/ZoomOut'
import { useTranslation } from 'react-i18next'
import { AppTable } from '../components/table'
import { AppModal } from '../components/common/AppModal'
import { useLayoutConfig } from '../hooks/useLayoutConfig'

export const Route = createFileRoute('/purchase/consent-inquiry')({
  component: ConsentInquiryPage,
})

// ── Types ─────────────────────────────────────────────────────────────────────

type ViewStep =
  | 'mode'
  | 'search'
  | 'detail'
  | 'comments'
  | 'customer'
  // E-47: 書面承諾書のデータ登録
  | 'registerList'
  | 'registerScan'

type SearchField = 'purchaseDate' | 'slipNumber' | 'documentNo'

type SlipType = '通常' | '赤伝' | '取消'

interface StoreComment {
  id: number
  createdAt: string // 作成日時（登録時に確定。pending 中は空）
  staffName: string
  text: string
  pending?: boolean // 入力中（未確定）
}

interface CustomerInfo {
  nameKanji: string
  nameKana: string
  birthDate: string // yyyy-MM-dd
  phone: string
  postalCode: string
  address: string
  occupation: string
  occupationOther: string
  nameKanji2: string
  postalCode2: string
  address2: string
  idDocType: string
  idDocNumber: string
}

interface ConsentDoc {
  id: number
  transactionDate: string // 取引日 yyyy/MM/dd
  slipNumber: string // 伝票番号
  documentNo: string // 書面発行No.
  registerNo: string // レジ番号
  staffName: string // 担当者
  slipType: SlipType // 伝票区分
  linkedSlip: string // 顧客情報紐づけ元伝票
  hasSignature: boolean // 署名データ有無
  noSignatureReason: string // 署名データ無理由
  createdAt: string // 帳票作成日時
  storeCode: string
  storeName: string
  itemSummary: string
  totalAmount: number
  customer: CustomerInfo
  customerRegistered: boolean // 顧客情報登録済（登録後は修正不可）
  sellerType: '' | '個人' | '法人'
  invoiceRegistrationNo: string // 適格請求書発行事業者登録番号
  corporateName: string // 売手事業者の名称
  comments: StoreComment[]
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const STAFF_MASTER: Record<string, string> = {
  '9999999': 'けんしゅうせい',
  '1234567': 'たなか',
  '2345678': 'やまざき',
  '3456789': 'わたなべ',
}

const EMPTY_CUSTOMER: CustomerInfo = {
  nameKanji: '', nameKana: '', birthDate: '', phone: '',
  postalCode: '', address: '', occupation: '', occupationOther: '',
  nameKanji2: '', postalCode2: '', address2: '', idDocType: '', idDocNumber: '',
}

const OCCUPATIONS = ['会社員', '公務員', '自営業', '学生', 'パート・アルバイト', '無職', 'その他']
const ID_DOC_TYPES = ['運転免許証', 'マイナンバーカード', 'パスポート', '健康保険証', '在留カード']

let docSeq = 0
function makeDoc(partial: Partial<ConsentDoc>): ConsentDoc {
  docSeq += 1
  return {
    id: docSeq,
    transactionDate: '2026/06/09',
    slipNumber: String(30780 + docSeq).padStart(10, '0'),
    documentNo: '',
    registerNo: '21',
    staffName: 'たなか',
    slipType: '通常',
    linkedSlip: '',
    hasSignature: true,
    noSignatureReason: '',
    createdAt: '2026/06/09 11:13:37',
    storeCode: '50241',
    storeName: '名古屋ﾌﾞｯｸｾﾝﾀｰ',
    itemSummary: '衣類18点',
    totalAmount: 7230,
    customer: {
      nameKanji: 'テスト 太郎', nameKana: 'テスト タロウ', birthDate: '1985-07-07',
      phone: '09000000000', postalCode: '460-0014', address: '愛知県名古屋市中区富士見町',
      occupation: '会社員', occupationOther: '', nameKanji2: '', postalCode2: '',
      address2: '', idDocType: '運転免許証', idDocNumber: '012345678901',
    },
    customerRegistered: false,
    sellerType: '',
    invoiceRegistrationNo: '',
    corporateName: '',
    comments: [],
    ...partial,
  }
}

const MOCK_DOCS: ConsentDoc[] = [
  makeDoc({ transactionDate: '2026/06/09', staffName: 'わたなべ', createdAt: '2026/06/09 10:13:25' }),
  makeDoc({ transactionDate: '2026/06/09', staffName: 'けんしゅうせい', itemSummary: 'ゲームソフト5点', totalAmount: 3400 }),
  makeDoc({ transactionDate: '2026/06/08', staffName: 'かわしま', slipType: '取消', itemSummary: 'スマホ1点', totalAmount: 21000, createdAt: '2026/06/08 15:02:11' }),
  makeDoc({ transactionDate: '2026/06/08', staffName: 'まきの', slipType: '赤伝', linkedSlip: '0000030781', createdAt: '2026/06/08 16:44:03' }),
  makeDoc({
    transactionDate: '2026/06/07', staffName: 'たなか', hasSignature: false,
    noSignatureReason: '書面承諾', documentNo: '89', itemSummary: 'バッグ2点', totalAmount: 45200,
    createdAt: '2026/06/07 11:13:37',
    comments: [{ id: 1, createdAt: '2026/06/07 11:20:45', staffName: 'たなか', text: '現住所が遠方ですが、出張の為、当店を利用。' }],
  }),
  makeDoc({ transactionDate: '2026/06/07', staffName: 'しまだ', itemSummary: '家電3点', totalAmount: 12800, createdAt: '2026/06/07 13:55:20' }),
  makeDoc({
    transactionDate: '2026/06/06', staffName: 'やまざき', hasSignature: false,
    noSignatureReason: 'システム障害', documentNo: '90', createdAt: '2026/06/06 09:30:00',
    customerRegistered: true, sellerType: '個人',
  }),
  makeDoc({ transactionDate: '2026/06/05', staffName: 'いしい', itemSummary: 'CD/DVD12点', totalAmount: 2350, createdAt: '2026/06/05 17:21:48' }),
  makeDoc({
    transactionDate: '2026/06/05', staffName: 'けんしゅうせい', createdAt: '2026/06/05 10:05:33',
    customerRegistered: true, sellerType: '法人',
    invoiceRegistrationNo: 'T7180001074052', corporateName: '株式会社ゲオホールディングス',
    customer: { ...EMPTY_CUSTOMER, nameKanji: '株式会社ゲオホールディングス', phone: '0500000000', address: '愛知県名古屋市中区富士見町8-8' },
  }),
  makeDoc({ transactionDate: '2026/06/04', staffName: 'まきの', itemSummary: '腕時計1点', totalAmount: 98000, createdAt: '2026/06/04 14:12:09' }),
  makeDoc({ transactionDate: '2026/06/03', staffName: 'わたなべ', itemSummary: 'トレカ44点', totalAmount: 5660, createdAt: '2026/06/03 12:40:15' }),
  makeDoc({ transactionDate: '2026/06/01', staffName: 'いしい', slipType: '取消', createdAt: '2026/06/01 18:03:51' }),
  // E-47 対象：書面発行済み・買取承諾書未登録の伝票
  makeDoc({
    transactionDate: '2026/06/08', staffName: 'ひらむき', hasSignature: false,
    noSignatureReason: '書面承諾', documentNo: '91', itemSummary: 'フィギュア6点', totalAmount: 9800,
    createdAt: '2026/06/08 11:15:58', customer: { ...EMPTY_CUSTOMER },
  }),
  makeDoc({
    transactionDate: '2026/06/09', staffName: 'かのう', hasSignature: false,
    noSignatureReason: '書面承諾', documentNo: '92', itemSummary: '工具8点', totalAmount: 15400,
    createdAt: '2026/06/09 16:48:20', customer: { ...EMPTY_CUSTOMER },
  }),
]

// ── Helpers ───────────────────────────────────────────────────────────────────

/** 「環境依存文字」の代替として禁則文字のみチェック */
const FORBIDDEN_CHARS_RE = /['",%]/

const SLIP_TYPE_KEYS: Record<SlipType, string> = {
  通常: 'normal',
  赤伝: 'red',
  取消: 'cancel',
}

const SELLER_TYPE_KEYS: Record<'個人' | '法人', string> = {
  個人: 'individual',
  法人: 'corporate',
}

function toWareki(isoDate: string): string {
  if (!isoDate) return ''
  const year = Number(isoDate.slice(0, 4))
  if (!year) return ''
  if (year >= 2019) return `令和${year - 2018}年`
  if (year >= 1989) return `平成${year - 1988}年`
  if (year >= 1926) return `昭和${year - 1925}年`
  return ''
}

function nowStamp(): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

const INVOICE_NO_RE = /^T\d{13}$/

// ── Page ──────────────────────────────────────────────────────────────────────

function ConsentInquiryPage() {
  const { t } = useTranslation()

  const [docs, setDocs] = useState<ConsentDoc[]>(MOCK_DOCS)

  // E-46-01-02: 担当者コードスキャン
  const [staffCode, setStaffCode] = useState('')
  const [staffInput, setStaffInput] = useState('')
  const staffName = STAFF_MASTER[staffCode] ?? ''

  const [step, setStep] = useState<ViewStep>('mode')

  // E-46-01-04: 検索理由
  const [reasonDialogOpen, setReasonDialogOpen] = useState(false)
  const [searchReason, setSearchReason] = useState('')

  // E-46-01-06〜08: 検索条件
  const [searchField, setSearchField] = useState<SearchField>('purchaseDate')
  const [dateFrom, setDateFrom] = useState('2026-06-03')
  const [dateTo, setDateTo] = useState('2026-06-10')
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState<ConsentDoc[] | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  // E-46-01-09〜10: 照会（詳細）
  const [detailIndex, setDetailIndex] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [detailTab, setDetailTab] = useState(0)
  const [imageDialogOpen, setImageDialogOpen] = useState(false)

  // E-46-02-01〜05: 店舗コメント登録
  const [pendingComments, setPendingComments] = useState<StoreComment[]>([])
  const [commentInputOpen, setCommentInputOpen] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [commentConfirmOpen, setCommentConfirmOpen] = useState(false)
  const [commentAbortConfirmOpen, setCommentAbortConfirmOpen] = useState(false)

  // E-46-02-06〜14: 顧客情報修正追加
  const [customerForm, setCustomerForm] = useState<CustomerInfo>(EMPTY_CUSTOMER)
  const [sellerSelectOpen, setSellerSelectOpen] = useState(false)
  const [individualConfirmOpen, setIndividualConfirmOpen] = useState(false)
  const [corporateInputOpen, setCorporateInputOpen] = useState(false)
  const [corporateForm, setCorporateForm] = useState({ registrationNo: '', name: '' })
  const [corporateConfirmOpen, setCorporateConfirmOpen] = useState(false)

  // E-46-02-15〜17: 印刷
  const [printDialogOpen, setPrintDialogOpen] = useState(false)
  const [printReason, setPrintReason] = useState('')

  // E-47: 書面承諾書のデータ登録
  const [registerMode, setRegisterMode] = useState(false)
  const [registerDocId, setRegisterDocId] = useState<number | null>(null)
  const [selectedRegisterId, setSelectedRegisterId] = useState<number | null>(null)
  const [registerScanInput, setRegisterScanInput] = useState('')

  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'warning' }>({
    open: false, message: '', severity: 'success',
  })

  const reasonInputRef = useRef<HTMLInputElement>(null)

  useLayoutConfig({ title: t('page.consentInquiry.title') })

  const showToast = (message: string, severity: 'success' | 'warning' = 'success') =>
    setToast({ open: true, message, severity })

  // E-47-01-03: 書面発行済み・買取承諾書未登録の伝票のみ表示
  const registerList = useMemo(
    () => docs.filter((d) => d.documentNo !== '' && !d.customerRegistered),
    [docs],
  )

  const currentDoc: ConsentDoc | null = (() => {
    if (step === 'detail' || step === 'comments') return (results ?? [])[detailIndex] ?? null
    if (step === 'registerScan') return docs.find((d) => d.id === registerDocId) ?? null
    if (step === 'customer') {
      return registerMode
        ? docs.find((d) => d.id === registerDocId) ?? null
        : (results ?? [])[detailIndex] ?? null
    }
    return null
  })()

  // ── Handlers: 担当者スキャン / モード選択 ────────────────────────────────────

  const handleStaffScan = () => {
    const code = staffInput.trim()
    if (!code) return
    if (!STAFF_MASTER[code]) {
      showToast(t('page.consentInquiry.staff.notFound'), 'warning')
      return
    }
    setStaffCode(code)
    setStaffInput('')
  }

  // E-46-01-03:「照会」押下 → 検索理由入力
  const handleSelectInquiry = () => {
    if (!staffCode) {
      showToast(t('page.consentInquiry.staff.required'), 'warning')
      return
    }
    setSearchReason('')
    setReasonDialogOpen(true)
    setTimeout(() => reasonInputRef.current?.focus(), 100)
  }

  // E-46-01-05: 検索理由「確定」
  const handleReasonConfirm = () => {
    if (!searchReason.trim()) return
    setReasonDialogOpen(false)
    setResults(null)
    setSelectedId(null)
    setStep('search')
  }

  // ── Handlers: 書面承諾書のデータ登録（E-47）─────────────────────────────────

  // E-47-01-03:「登録」押下 → 未登録伝票一覧
  const handleSelectRegister = () => {
    if (!staffCode) {
      showToast(t('page.consentInquiry.staff.required'), 'warning')
      return
    }
    setSelectedRegisterId(null)
    setStep('registerList')
  }

  // E-47-01-04〜05: 伝票を選択して「登録」押下 → バーコードスキャン
  const handleRegisterProceed = () => {
    if (selectedRegisterId === null) return
    setRegisterDocId(selectedRegisterId)
    setRegisterScanInput('')
    setStep('registerScan')
  }

  // E-47-01-06: 買取承諾書(書面) / タグ・シール発行レシート のバーコードをスキャン
  const handleRegisterScan = () => {
    const input = registerScanInput.trim()
    if (!input || !currentDoc) return
    const matches =
      input === currentDoc.slipNumber ||
      input === currentDoc.slipNumber.replace(/^0+/, '') ||
      input === currentDoc.documentNo
    if (!matches) {
      showToast(t('page.consentInquiry.register.scanMismatch', { slip: currentDoc.slipNumber }), 'warning')
      return
    }
    // 照合OK → 入力項目画面へ（E-47-01-07）
    setCustomerForm({ ...currentDoc.customer })
    setPendingComments([])
    setRegisterMode(true)
    setRegisterScanInput('')
    setStep('customer')
    showToast(t('page.consentInquiry.register.scanMatched'))
  }

  // ── Handlers: 検索 ──────────────────────────────────────────────────────────

  const runSearch = (all = false) => {
    let found: ConsentDoc[]
    if (all) {
      found = docs
    } else if (searchField === 'purchaseDate') {
      if (!dateFrom || !dateTo) {
        showToast(t('page.consentInquiry.search.conditionRequired'), 'warning')
        return
      }
      const from = dateFrom.replaceAll('-', '/')
      const to = dateTo.replaceAll('-', '/')
      found = docs.filter((d) => d.transactionDate >= from && d.transactionDate <= to)
    } else {
      const kw = keyword.trim()
      if (!kw) {
        showToast(t('page.consentInquiry.search.conditionRequired'), 'warning')
        return
      }
      found = searchField === 'slipNumber'
        ? docs.filter((d) => d.slipNumber.includes(kw))
        : docs.filter((d) => d.documentNo !== '' && d.documentNo.includes(kw))
    }
    setResults(found)
    setSelectedId(null)
    if (found.length === 0) showToast(t('page.consentInquiry.search.noHit'), 'warning')
  }

  // E-46-01-10:「照会」押下 → 詳細表示
  const handleOpenDetail = (doc?: ConsentDoc) => {
    const list = results ?? []
    const target = doc ?? list.find((d) => d.id === selectedId)
    if (!target) return
    setDetailIndex(list.findIndex((d) => d.id === target.id))
    setZoom(1)
    setDetailTab(0)
    setStep('detail')
  }

  const moveDetail = (delta: number) => {
    const list = results ?? []
    const next = detailIndex + delta
    if (next < 0 || next >= list.length) return
    setDetailIndex(next)
    setZoom(1)
    setDetailTab(0)
  }

  // ── Handlers: 店舗コメント登録（E-46-02-01〜05）──────────────────────────────

  const handleCommentInputConfirm = () => {
    const text = commentText.trim()
    if (!text) return
    if (FORBIDDEN_CHARS_RE.test(text)) {
      showToast(t('page.consentInquiry.comments.forbiddenChars'), 'warning')
      return
    }
    setPendingComments((prev) => [
      ...prev,
      { id: Date.now(), createdAt: '', staffName, text, pending: true },
    ])
    setCommentText('')
    setCommentInputOpen(false)
  }

  // E-46-02-05: 画面の「確定」→ 登録
  const handleCommentsRegister = () => {
    if (!currentDoc) return
    const stamp = nowStamp()
    const registered = pendingComments.map((c) => ({ ...c, createdAt: stamp, pending: false }))
    setDocs((prev) => prev.map((d) =>
      d.id === currentDoc.id ? { ...d, comments: [...d.comments, ...registered] } : d,
    ))
    setResults((prev) => prev?.map((d) =>
      d.id === currentDoc.id ? { ...d, comments: [...d.comments, ...registered] } : d,
    ) ?? prev)
    setPendingComments([])
    setCommentConfirmOpen(false)
    setStep('detail')
    showToast(t('page.consentInquiry.comments.registered', { n: registered.length }))
  }

  const handleCommentsAbort = () => {
    if (pendingComments.length > 0) setCommentAbortConfirmOpen(true)
    else setStep('detail')
  }

  // ── Handlers: 顧客情報修正追加（E-46-02-06〜14）──────────────────────────────

  const handleOpenCustomer = () => {
    if (!currentDoc) return
    if (currentDoc.customerRegistered) {
      showToast(t('page.consentInquiry.customer.locked'), 'warning')
      return
    }
    setCustomerForm({ ...currentDoc.customer })
    setRegisterMode(false)
    setStep('customer')
  }

  /** 郵便番号から住所検索（モック） */
  const handlePostalLookup = (which: 1 | 2) => {
    const code = which === 1 ? customerForm.postalCode : customerForm.postalCode2
    if (!/^\d{3}-?\d{4}$/.test(code.trim())) {
      showToast(t('page.consentInquiry.customer.postalInvalid'), 'warning')
      return
    }
    const address = '愛知県名古屋市中区富士見町'
    setCustomerForm((prev) =>
      which === 1 ? { ...prev, address } : { ...prev, address2: address },
    )
    showToast(t('page.consentInquiry.customer.postalFound', { which }))
  }

  const customerFormValid =
    customerForm.nameKanji.trim() !== '' &&
    customerForm.nameKana.trim() !== '' &&
    customerForm.birthDate !== '' &&
    customerForm.address.trim() !== '' &&
    customerForm.idDocType !== ''

  const registerCustomer = (
    sellerType: '個人' | '法人',
    corporate?: { registrationNo: string; name: string },
  ) => {
    if (!currentDoc) return
    // E-47: 補足事項コメントも併せて登録（E-47-01-11〜14）
    const stamp = nowStamp()
    const newComments = registerMode
      ? pendingComments.map((c) => ({ ...c, createdAt: stamp, pending: false }))
      : []
    const update = (d: ConsentDoc): ConsentDoc =>
      d.id === currentDoc.id
        ? {
            ...d,
            customer: { ...customerForm },
            customerRegistered: true,
            sellerType,
            invoiceRegistrationNo: corporate?.registrationNo ?? '',
            corporateName: corporate?.name ?? '',
            comments: [...d.comments, ...newComments],
          }
        : d
    setDocs((prev) => prev.map(update))
    setResults((prev) => prev?.map(update) ?? prev)
    setIndividualConfirmOpen(false)
    setCorporateConfirmOpen(false)
    setSellerSelectOpen(false)
    setPendingComments([])
    const typeLabel = t(`page.consentInquiry.sellerType.${SELLER_TYPE_KEYS[sellerType]}`)
    if (registerMode) {
      setRegisterMode(false)
      setStep('registerList')
      showToast(t('page.consentInquiry.register.registered', { type: typeLabel }))
    } else {
      setStep('detail')
      showToast(t('page.consentInquiry.customer.registered', { type: typeLabel }))
    }
  }

  // E-46-02-12〜13: 法人情報入力 → 確認
  const handleCorporateNext = () => {
    if (!INVOICE_NO_RE.test(corporateForm.registrationNo.trim())) {
      showToast(t('page.consentInquiry.corporate.registrationNoInvalid'), 'warning')
      return
    }
    if (!corporateForm.name.trim()) {
      showToast(t('page.consentInquiry.corporate.nameRequired'), 'warning')
      return
    }
    setCorporateInputOpen(false)
    setCorporateConfirmOpen(true)
  }

  // ── Handlers: 印刷（E-46-02-15〜17）──────────────────────────────────────────

  const handlePrintConfirm = () => {
    if (!printReason.trim()) return
    setPrintDialogOpen(false)
    setPrintReason('')
    showToast(t('page.consentInquiry.print.done'))
  }

  // ── 検索結果テーブル列 ───────────────────────────────────────────────────────

  const columns = useMemo<ColumnDef<ConsentDoc>[]>(() => [
    {
      id: 'transactionDate', header: t('page.consentInquiry.col.transactionDate'), size: 100, enableSorting: true,
      accessorKey: 'transactionDate',
      cell: ({ row }) => (
        <Typography sx={{ fontSize: '0.82rem', whiteSpace: 'nowrap' }}>{row.original.transactionDate}</Typography>
      ),
    },
    {
      id: 'slipNumber', header: t('page.consentInquiry.col.slipNumber'), size: 110, enableSorting: false,
      cell: ({ row }) => (
        <Typography sx={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{row.original.slipNumber}</Typography>
      ),
      meta: { cellSx: { whiteSpace: 'nowrap' as const } },
    },
    {
      id: 'documentNo', header: t('page.consentInquiry.col.documentNo'), size: 100, enableSorting: false,
      cell: ({ row }) => (
        <Typography sx={{ fontFamily: 'monospace', fontSize: '0.82rem', textAlign: 'center' }}>
          {row.original.documentNo || 'ー'}
        </Typography>
      ),
      meta: { headerSx: { textAlign: 'center' }, cellSx: { textAlign: 'center' } },
    },
    {
      id: 'registerNo', header: t('page.consentInquiry.col.registerNo'), size: 80, enableSorting: false,
      cell: ({ row }) => (
        <Typography sx={{ fontSize: '0.82rem', textAlign: 'center' }}>{row.original.registerNo}</Typography>
      ),
      meta: { headerSx: { textAlign: 'center' }, cellSx: { textAlign: 'center' } },
    },
    {
      id: 'staffName', header: t('page.consentInquiry.col.staffName'), size: 120, enableSorting: false,
      cell: ({ row }) => (
        <Typography sx={{ fontSize: '0.82rem' }}>{row.original.staffName}</Typography>
      ),
    },
    {
      id: 'slipType', header: t('page.consentInquiry.col.slipType'), size: 90, enableSorting: false,
      cell: ({ row }) => (
        <Chip
          label={t(`page.consentInquiry.slipType.${SLIP_TYPE_KEYS[row.original.slipType]}`)}
          size="small"
          color={row.original.slipType === '通常' ? 'default' : row.original.slipType === '赤伝' ? 'error' : 'warning'}
          variant="outlined"
          sx={{ fontSize: '0.72rem', height: 22 }}
        />
      ),
      meta: { headerSx: { textAlign: 'center' }, cellSx: { textAlign: 'center' } },
    },
    {
      id: 'linkedSlip', header: t('page.consentInquiry.col.linkedSlip'), size: 150, enableSorting: false,
      cell: ({ row }) => (
        <Typography sx={{ fontFamily: 'monospace', fontSize: '0.82rem', textAlign: 'center' }}>
          {row.original.linkedSlip || 'ー'}
        </Typography>
      ),
      meta: { headerSx: { textAlign: 'center' }, cellSx: { textAlign: 'center' } },
    },
    {
      id: 'hasSignature', header: t('page.consentInquiry.col.hasSignature'), size: 110, enableSorting: false,
      cell: ({ row }) => (
        <Chip
          label={row.original.hasSignature
            ? t('page.consentInquiry.signature.yes')
            : t('page.consentInquiry.signature.no')}
          size="small"
          color={row.original.hasSignature ? 'success' : 'default'}
          variant={row.original.hasSignature ? 'filled' : 'outlined'}
          sx={{ fontSize: '0.72rem', height: 22 }}
        />
      ),
      meta: { headerSx: { textAlign: 'center' }, cellSx: { textAlign: 'center' } },
    },
    {
      id: 'noSignatureReason', header: t('page.consentInquiry.col.noSignatureReason'), size: 130, enableSorting: false,
      cell: ({ row }) => (
        <Typography sx={{ fontSize: '0.82rem' }}>{row.original.noSignatureReason || 'ー'}</Typography>
      ),
    },
  ], [t])

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, height: '100%' }}>

      {/* ════ STEP: モード選択（E-46-01-01〜03）═══════════════════════════════ */}
      {step === 'mode' && (
        <>
          {/* 担当者コードスキャン（E-46-01-02） */}
          {staffCode ? (
            <Paper variant="outlined" sx={{ p: 1.25, display: 'flex', alignItems: 'center', gap: 1 }}>
              <BadgeOutlinedIcon sx={{ color: 'primary.main' }} />
              <Typography sx={{ fontSize: '0.85rem' }}>
                {t('page.consentInquiry.staff.label')}: <strong>{staffName}</strong>（{staffCode}）
              </Typography>
              <Button size="small" sx={{ ml: 'auto' }} onClick={() => setStaffCode('')}>
                {t('page.consentInquiry.staff.change')}
              </Button>
            </Paper>
          ) : (
            <Alert
              severity="warning"
              icon={<QrCodeScannerIcon />}
              sx={{ alignItems: 'center', '& .MuiAlert-message': { flex: 1 } }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography sx={{ fontSize: '0.85rem', flex: '0 0 auto' }}>
                  {t('page.consentInquiry.staff.scanPrompt')}
                </Typography>
                <OutlinedInput
                  size="small"
                  autoFocus
                  value={staffInput}
                  onChange={(e) => setStaffInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleStaffScan()}
                  placeholder={t('page.consentInquiry.staff.placeholder')}
                  sx={{ width: 260, height: 34, fontSize: '0.85rem', bgcolor: 'background.paper' }}
                />
                <Button size="small" variant="contained" onClick={handleStaffScan} disabled={!staffInput.trim()}>
                  {t('page.consentInquiry.staff.authenticate')}
                </Button>
              </Box>
            </Alert>
          )}

          {/* 照会 / 登録 選択（E-46-01-03） */}
          <Box
            sx={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 4, flexWrap: 'wrap',
            }}
          >
            <ModeCard
              label={t('page.consentInquiry.mode.inquiry')}
              description={t('page.consentInquiry.mode.inquiryDesc')}
              icon={<PlagiarismOutlinedIcon sx={{ fontSize: 42 }} />}
              onClick={handleSelectInquiry}
            />
            <ModeCard
              label={t('page.consentInquiry.mode.register')}
              description={t('page.consentInquiry.mode.registerDesc')}
              icon={<NoteAddOutlinedIcon sx={{ fontSize: 42 }} />}
              onClick={handleSelectRegister}
            />
          </Box>
        </>
      )}

      {/* ════ STEP: 検索（E-46-01-06〜09）═════════════════════════════════════ */}
      {step === 'search' && (
        <>
          {/* 検索条件バー */}
          <Paper variant="outlined" sx={{ p: 1.5 }}>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField
                select size="small" label={t('page.consentInquiry.search.field')} value={searchField}
                onChange={(e) => setSearchField(e.target.value as SearchField)}
                sx={{ width: 160 }}
              >
                <MenuItem value="purchaseDate">{t('page.consentInquiry.search.fieldPurchaseDate')}</MenuItem>
                <MenuItem value="slipNumber">{t('page.consentInquiry.search.fieldSlipNumber')}</MenuItem>
                <MenuItem value="documentNo">{t('page.consentInquiry.search.fieldDocumentNo')}</MenuItem>
              </TextField>

              {searchField === 'purchaseDate' ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField
                    size="small" type="date" label={t('page.consentInquiry.search.from')} value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={{ width: 170 }}
                  />
                  <Typography sx={{ color: 'text.secondary' }}>〜</Typography>
                  <TextField
                    size="small" type="date" label={t('page.consentInquiry.search.to')} value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={{ width: 170 }}
                  />
                </Box>
              ) : (
                <OutlinedInput
                  size="small"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && runSearch()}
                  placeholder={searchField === 'slipNumber'
                    ? t('page.consentInquiry.search.keywordSlipPlaceholder')
                    : t('page.consentInquiry.search.keywordDocPlaceholder')}
                  startAdornment={
                    <InputAdornment position="start">
                      <QrCodeScannerIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  }
                  endAdornment={keyword ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setKeyword('')}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null}
                  sx={{ width: 300 }}
                />
              )}

              <Button variant="contained" startIcon={<SearchIcon />} onClick={() => runSearch()}>
                {t('page.consentInquiry.search.run')}
              </Button>
              <Button variant="outlined" onClick={() => runSearch(true)}>
                {t('page.consentInquiry.search.runAll')}
              </Button>

              <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  size="small" variant="outlined" icon={<BadgeOutlinedIcon />}
                  label={`${t('page.consentInquiry.staff.label')}: ${staffName}`}
                />
                <Chip
                  size="small" variant="outlined" color="info"
                  label={t('page.consentInquiry.searchReason.chip', { reason: searchReason })}
                  sx={{ maxWidth: 280 }}
                />
              </Box>
            </Box>
          </Paper>

          {/* 検索結果一覧（E-46-01-09） */}
          <AppTable<ConsentDoc>
            data={results ?? []}
            columns={columns}
            getRowId={(row) => String(row.id)}
            sorting
            stickyHeader
            containerMaxHeight="calc(100vh - 320px)"
            dense
            onRowClick={(row) => setSelectedId(row.id)}
            getRowSx={(row) => ({
              cursor: 'pointer',
              ...(row.id === selectedId && {
                bgcolor: '#e8f1fd',
                '&:hover': { bgcolor: '#dcebfc' },
              }),
            })}
            emptyMessage={
              <Box sx={{ textAlign: 'center', color: 'text.disabled', pt: 3 }}>
                <SearchIcon sx={{ fontSize: 40, mb: 0.5 }} />
                <Typography sx={{ fontSize: '0.9rem', color: 'text.disabled' }}>
                  {results === null
                    ? t('page.consentInquiry.search.promptSearch')
                    : t('page.consentInquiry.search.empty')}
                </Typography>
              </Box>
            }
            tableSx={{ minWidth: 980 }}
          />

          {/* アクションバー */}
          <Paper variant="outlined" sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button size="small" color="inherit" startIcon={<ArrowBackIcon />} onClick={() => setStep('mode')}>
              {t('page.consentInquiry.common.back')}
            </Button>
            {results !== null && (
              <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', ml: 1 }}>
                {t('page.consentInquiry.search.resultCount', { n: results.length })}
                {selectedId === null && results.length > 0 &&
                  ` ー ${t('page.consentInquiry.search.selectPrompt')}`}
              </Typography>
            )}
            <Button
              size="small" variant="contained" sx={{ ml: 'auto' }}
              startIcon={<PlagiarismOutlinedIcon />}
              disabled={selectedId === null}
              onClick={() => handleOpenDetail()}
            >
              {t('page.consentInquiry.mode.inquiry')}
            </Button>
          </Paper>
        </>
      )}

      {/* ════ STEP: 登録対象一覧（E-47-01-03〜05）═════════════════════════════ */}
      {step === 'registerList' && (
        <>
          <Alert severity="info" sx={{ '& .MuiAlert-message': { fontSize: '0.8rem' } }}>
            {t('page.consentInquiry.register.listBanner')}
          </Alert>

          <AppTable<ConsentDoc>
            data={registerList}
            columns={columns}
            getRowId={(row) => String(row.id)}
            sorting
            stickyHeader
            containerMaxHeight="calc(100vh - 320px)"
            dense
            onRowClick={(row) => setSelectedRegisterId(row.id)}
            getRowSx={(row) => ({
              cursor: 'pointer',
              ...(row.id === selectedRegisterId && {
                bgcolor: '#e8f1fd',
                '&:hover': { bgcolor: '#dcebfc' },
              }),
            })}
            emptyMessage={
              <Box sx={{ textAlign: 'center', color: 'text.disabled', pt: 3 }}>
                <NoteAddOutlinedIcon sx={{ fontSize: 40, mb: 0.5 }} />
                <Typography sx={{ fontSize: '0.9rem', color: 'text.disabled' }}>
                  {t('page.consentInquiry.register.empty')}
                </Typography>
              </Box>
            }
            tableSx={{ minWidth: 980 }}
          />

          <Paper variant="outlined" sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button size="small" color="inherit" startIcon={<ArrowBackIcon />} onClick={() => setStep('mode')}>
              {t('page.consentInquiry.common.back')}
            </Button>
            <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', ml: 1 }}>
              {t('page.consentInquiry.search.resultCount', { n: registerList.length })}
              {selectedRegisterId === null && registerList.length > 0 &&
                ` ー ${t('page.consentInquiry.register.selectPrompt')}`}
            </Typography>
            <Button
              size="small" variant="contained" sx={{ ml: 'auto' }}
              startIcon={<NoteAddOutlinedIcon />}
              disabled={selectedRegisterId === null}
              onClick={handleRegisterProceed}
            >
              {t('page.consentInquiry.mode.register')}
            </Button>
          </Paper>
        </>
      )}

      {/* ════ STEP: 伝票バーコードスキャン（E-47-01-06）═══════════════════════ */}
      {step === 'registerScan' && currentDoc && (
        <>
          <Paper variant="outlined" sx={{ p: 1.25, display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
            <Box>
              <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                {t('page.consentInquiry.detail.slipNumber')}
              </Typography>
              <Typography sx={{ fontFamily: 'monospace', fontSize: '0.95rem', fontWeight: 700 }}>
                {currentDoc.slipNumber}
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box>
              <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                {t('page.consentInquiry.col.documentNo')}
              </Typography>
              <Typography sx={{ fontFamily: 'monospace', fontSize: '0.95rem', fontWeight: 700 }}>
                {currentDoc.documentNo}
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box>
              <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                {t('page.consentInquiry.col.staffName')} / {t('page.consentInquiry.col.transactionDate')}
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                {currentDoc.staffName} / {currentDoc.transactionDate}
              </Typography>
            </Box>
          </Paper>

          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Paper variant="outlined" sx={{ p: 4, maxWidth: 560, width: '100%', textAlign: 'center' }}>
              <QrCodeScannerIcon sx={{ fontSize: 56, color: 'primary.main', mb: 1 }} />
              <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, mb: 1 }}>
                {t('page.consentInquiry.register.scanTitle')}
              </Typography>
              <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary', mb: 2.5 }}>
                {t('page.consentInquiry.register.scanPrompt')}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <OutlinedInput
                  size="small"
                  autoFocus
                  fullWidth
                  value={registerScanInput}
                  onChange={(e) => setRegisterScanInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRegisterScan()}
                  placeholder={t('page.consentInquiry.register.scanPlaceholder')}
                  startAdornment={
                    <InputAdornment position="start">
                      <QrCodeScannerIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  }
                />
                <Button variant="contained" onClick={handleRegisterScan} disabled={!registerScanInput.trim()}>
                  {t('page.consentInquiry.common.confirm')}
                </Button>
              </Box>
            </Paper>
          </Box>

          <Paper variant="outlined" sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button size="small" color="inherit" startIcon={<ArrowBackIcon />} onClick={() => setStep('registerList')}>
              {t('page.consentInquiry.common.back')}
            </Button>
          </Paper>
        </>
      )}

      {/* ════ STEP: 詳細（買取承諾書確認 E-46-01-10〜11）═══════════════════════ */}
      {step === 'detail' && currentDoc && (
        <>
          {/* ヘッダー情報 */}
          <Paper variant="outlined" sx={{ p: 1.25, display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
            <Box>
              <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                {t('page.consentInquiry.detail.slipNumber')}
              </Typography>
              <Typography sx={{ fontFamily: 'monospace', fontSize: '0.95rem', fontWeight: 700 }}>
                {currentDoc.slipNumber}
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box>
              <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                {t('page.consentInquiry.detail.document')}
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                {t('page.consentInquiry.detail.documentName', { date: currentDoc.createdAt })}
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box>
              <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                {t('page.consentInquiry.detail.typeAndSignature')}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Chip label={t(`page.consentInquiry.slipType.${SLIP_TYPE_KEYS[currentDoc.slipType]}`)}
                  size="small" variant="outlined"
                  color={currentDoc.slipType === '通常' ? 'default' : currentDoc.slipType === '赤伝' ? 'error' : 'warning'}
                  sx={{ fontSize: '0.72rem', height: 22 }} />
                <Chip label={currentDoc.hasSignature
                    ? t('page.consentInquiry.signature.with')
                    : t('page.consentInquiry.signature.without', { reason: currentDoc.noSignatureReason })}
                  size="small" color={currentDoc.hasSignature ? 'success' : 'default'}
                  variant={currentDoc.hasSignature ? 'filled' : 'outlined'}
                  sx={{ fontSize: '0.72rem', height: 22 }} />
                {currentDoc.customerRegistered && currentDoc.sellerType !== '' && (
                  <Chip
                    label={t('page.consentInquiry.detail.customerRegistered', {
                      type: t(`page.consentInquiry.sellerType.${SELLER_TYPE_KEYS[currentDoc.sellerType]}`),
                    })}
                    size="small" color="info" sx={{ fontSize: '0.72rem', height: 22 }} />
                )}
              </Box>
            </Box>
            <Typography sx={{ ml: 'auto', fontSize: '0.78rem', color: 'text.secondary' }}>
              {t('page.consentInquiry.detail.counter', { current: detailIndex + 1, total: (results ?? []).length })}
            </Typography>
          </Paper>

          {/* タブ：帳票 / 店舗コメント */}
          <Paper variant="outlined" sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Tabs value={detailTab} onChange={(_, v) => setDetailTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', minHeight: 40 }}>
              <Tab label={t('page.consentInquiry.detail.tabDocument')} sx={{ minHeight: 40, textTransform: 'none' }} />
              <Tab
                label={t('page.consentInquiry.detail.tabComments', { n: currentDoc.comments.length })}
                sx={{ minHeight: 40, textTransform: 'none' }}
              />
            </Tabs>

            {detailTab === 0 ? (
              <Box sx={{ flex: 1, overflow: 'auto', bgcolor: 'grey.200', p: 2, display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>
                  <ConsentDocumentPreview doc={currentDoc} />
                </Box>
              </Box>
            ) : (
              <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                {currentDoc.comments.length === 0 ? (
                  <Typography sx={{ fontSize: '0.85rem', color: 'text.disabled', textAlign: 'center', pt: 4 }}>
                    {t('page.consentInquiry.detail.noComments')}
                  </Typography>
                ) : (
                  currentDoc.comments.map((c) => (
                    <Paper key={c.id} variant="outlined" sx={{ p: 1.25, mb: 1 }}>
                      <Box sx={{ display: 'flex', gap: 1.5, mb: 0.5 }}>
                        <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{c.createdAt}</Typography>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>{c.staffName}</Typography>
                      </Box>
                      <Typography sx={{ fontSize: '0.85rem' }}>{c.text}</Typography>
                    </Paper>
                  ))
                )}
              </Box>
            )}
          </Paper>

          {/* 機能ボタン */}
          <Paper variant="outlined" sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <Button size="small" variant="outlined" startIcon={<PrintOutlinedIcon />}
              onClick={() => { setPrintReason(''); setPrintDialogOpen(true) }}>
              {t('page.consentInquiry.detail.print')}
            </Button>
            <Button size="small" variant="outlined" startIcon={<ImageSearchOutlinedIcon />}
              onClick={() => setImageDialogOpen(true)}>
              {t('page.consentInquiry.detail.imageInquiry')}
            </Button>
            <Button size="small" variant="outlined" startIcon={<AddCommentOutlinedIcon />}
              onClick={() => { setPendingComments([]); setStep('comments') }}>
              {t('page.consentInquiry.detail.commentRegister')}
            </Button>
            <Button size="small" variant="outlined" startIcon={<ManageAccountsOutlinedIcon />}
              disabled={currentDoc.customerRegistered}
              onClick={handleOpenCustomer}>
              {t('page.consentInquiry.detail.customerEdit')}
            </Button>

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

            <IconButton size="small" onClick={() => setZoom((z) => Math.max(0.6, Math.round((z - 0.2) * 10) / 10))} disabled={zoom <= 0.6}>
              <ZoomOutIcon fontSize="small" />
            </IconButton>
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', width: 42, textAlign: 'center' }}>
              {Math.round(zoom * 100)}%
            </Typography>
            <IconButton size="small" onClick={() => setZoom((z) => Math.min(1.6, Math.round((z + 0.2) * 10) / 10))} disabled={zoom >= 1.6}>
              <ZoomInIcon fontSize="small" />
            </IconButton>

            <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
              <Button size="small" variant="outlined" startIcon={<ChevronLeftIcon />}
                disabled={detailIndex <= 0} onClick={() => moveDetail(-1)}>
                {t('page.consentInquiry.detail.prevSlip')}
              </Button>
              <Button size="small" variant="outlined" endIcon={<ChevronRightIcon />}
                disabled={detailIndex >= (results ?? []).length - 1} onClick={() => moveDetail(1)}>
                {t('page.consentInquiry.detail.nextSlip')}
              </Button>
              <Button size="small" color="inherit" variant="outlined" onClick={() => setStep('search')}>
                {t('page.consentInquiry.common.abort')}
              </Button>
            </Box>
          </Paper>
        </>
      )}

      {/* ════ STEP: 店舗コメント登録（E-46-02-01〜05）═════════════════════════ */}
      {step === 'comments' && currentDoc && (
        <>
          <Alert severity="warning" sx={{ '& .MuiAlert-message': { fontSize: '0.8rem' } }}>
            {t('page.consentInquiry.comments.warning1')}<br />
            {t('page.consentInquiry.comments.warning2')}<br />
            {t('page.consentInquiry.comments.warning3')}
          </Alert>

          <Paper variant="outlined" sx={{ p: 1.25, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography sx={{ fontSize: '0.85rem' }}>
              {t('page.consentInquiry.detail.slipNumber')}: <strong style={{ fontFamily: 'monospace' }}>{currentDoc.slipNumber}</strong>
            </Typography>
            <Typography sx={{ fontSize: '0.85rem' }}>
              {t('page.consentInquiry.staff.label')}: <strong>{staffName}</strong>
            </Typography>
          </Paper>

          {/* コメント一覧（登録済 + 入力中） */}
          <Paper variant="outlined" sx={{ flex: 1, overflow: 'auto' }}>
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
              <Box component="thead" sx={{ position: 'sticky', top: 0, bgcolor: 'grey.100', zIndex: 1 }}>
                <Box component="tr">
                  {[
                    t('page.consentInquiry.comments.colCreatedAt'),
                    t('page.consentInquiry.comments.colStaff'),
                    t('page.consentInquiry.comments.colComment'),
                  ].map((h, i) => (
                    <Box key={h} component="th" sx={{
                      textAlign: 'left', p: 1, fontSize: '0.78rem', fontWeight: 600,
                      borderBottom: '1px solid', borderColor: 'divider',
                      width: i === 0 ? 180 : i === 1 ? 140 : 'auto',
                    }}>
                      {h}
                    </Box>
                  ))}
                </Box>
              </Box>
              <Box component="tbody">
                {[...currentDoc.comments, ...pendingComments].map((c) => (
                  <Box component="tr" key={c.id} sx={{ bgcolor: c.pending ? '#fffde7' : undefined }}>
                    <Box component="td" sx={{ p: 1, fontSize: '0.82rem', borderBottom: '1px solid', borderColor: 'divider', color: c.pending ? 'warning.dark' : 'text.primary' }}>
                      {c.pending ? t('page.consentInquiry.comments.pendingMark') : c.createdAt}
                    </Box>
                    <Box component="td" sx={{ p: 1, fontSize: '0.82rem', borderBottom: '1px solid', borderColor: 'divider' }}>
                      {c.staffName}
                    </Box>
                    <Box component="td" sx={{ p: 1, fontSize: '0.82rem', borderBottom: '1px solid', borderColor: 'divider' }}>
                      {c.text}
                    </Box>
                  </Box>
                ))}
                {currentDoc.comments.length + pendingComments.length === 0 && (
                  <Box component="tr">
                    <Box component="td" colSpan={3} sx={{ p: 3, textAlign: 'center', fontSize: '0.85rem', color: 'text.disabled' }}>
                      {t('page.consentInquiry.comments.empty')}
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          </Paper>

          <Paper variant="outlined" sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button size="small" variant="outlined" startIcon={<AddCommentOutlinedIcon />}
              onClick={() => { setCommentText(''); setCommentInputOpen(true) }}>
              {t('page.consentInquiry.comments.add')}
            </Button>
            {pendingComments.length > 0 && (
              <Typography sx={{ fontSize: '0.78rem', color: 'warning.dark' }}>
                {t('page.consentInquiry.comments.pendingNotice', { n: pendingComments.length })}
              </Typography>
            )}
            <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
              <Button size="small" color="inherit" variant="outlined" onClick={handleCommentsAbort}>
                {t('page.consentInquiry.common.abort')}
              </Button>
              <Button size="small" variant="contained" disabled={pendingComments.length === 0}
                onClick={() => setCommentConfirmOpen(true)}>
                {t('page.consentInquiry.common.confirm')}
              </Button>
            </Box>
          </Paper>
        </>
      )}

      {/* ════ STEP: 顧客情報修正追加（E-46-02-06〜08）═════════════════════════ */}
      {step === 'customer' && currentDoc && (
        <>
          <Paper variant="outlined" sx={{ p: 1.25, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography sx={{ fontSize: '0.85rem' }}>
              {t('page.consentInquiry.detail.slipNumber')}: <strong style={{ fontFamily: 'monospace' }}>{currentDoc.slipNumber}</strong>
            </Typography>
            <Typography sx={{ fontSize: '0.85rem' }}>
              {t('page.consentInquiry.customer.headerDocument', { date: currentDoc.createdAt })}
            </Typography>
            <Typography sx={{ ml: 'auto', fontSize: '0.78rem', color: 'text.secondary' }}>
              {t('page.consentInquiry.customer.headerPrompt')}
            </Typography>
          </Paper>

          <Box sx={{ flex: 1, display: 'flex', gap: 1.5, overflow: 'hidden' }}>
            {/* 左：帳票プレビュー */}
            <Box sx={{ flex: 1, overflow: 'auto', bgcolor: 'grey.200', p: 1.5, borderRadius: 1, display: { xs: 'none', md: 'block' } }}>
              <Box sx={{ transform: 'scale(0.8)', transformOrigin: 'top center' }}>
                <ConsentDocumentPreview doc={currentDoc} />
              </Box>
            </Box>

            {/* 右：入力項目（E-46-02-07） */}
            <Paper variant="outlined" sx={{ width: { xs: '100%', md: 460 }, overflow: 'auto', p: 2 }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, mb: 1.5 }}>
                {t('page.consentInquiry.customer.sectionTitle')}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <TextField size="small" label={t('page.consentInquiry.customer.nameKanji')} required value={customerForm.nameKanji}
                  onChange={(e) => setCustomerForm((p) => ({ ...p, nameKanji: e.target.value }))} />
                <TextField size="small" label={t('page.consentInquiry.customer.nameKana')} required value={customerForm.nameKana}
                  onChange={(e) => setCustomerForm((p) => ({ ...p, nameKana: e.target.value }))} />
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <TextField size="small" type="date" label={t('page.consentInquiry.customer.birthDate')} required value={customerForm.birthDate}
                    onChange={(e) => setCustomerForm((p) => ({ ...p, birthDate: e.target.value }))}
                    slotProps={{ inputLabel: { shrink: true } }} sx={{ flex: 1 }} />
                  <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', width: 80 }}>
                    {toWareki(customerForm.birthDate)}
                  </Typography>
                </Box>
                <TextField size="small" label={t('page.consentInquiry.customer.phone')} value={customerForm.phone}
                  onChange={(e) => setCustomerForm((p) => ({ ...p, phone: e.target.value }))} />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField size="small" label={t('page.consentInquiry.customer.postalCode')} value={customerForm.postalCode}
                    onChange={(e) => setCustomerForm((p) => ({ ...p, postalCode: e.target.value }))}
                    helperText={t('page.consentInquiry.customer.postalHelper1')} sx={{ flex: 1 }} />
                  <Button size="small" variant="outlined" onClick={() => handlePostalLookup(1)} sx={{ height: 40, whiteSpace: 'nowrap' }}>
                    {t('page.consentInquiry.customer.postalLookup1')}
                  </Button>
                </Box>
                <TextField size="small" label={t('page.consentInquiry.customer.address')} required value={customerForm.address}
                  onChange={(e) => setCustomerForm((p) => ({ ...p, address: e.target.value }))} />
                <TextField select size="small" label={t('page.consentInquiry.customer.occupation')} value={customerForm.occupation}
                  onChange={(e) => setCustomerForm((p) => ({ ...p, occupation: e.target.value }))}>
                  {OCCUPATIONS.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                </TextField>
                {customerForm.occupation === 'その他' && (
                  <TextField size="small" label={t('page.consentInquiry.customer.occupationOther')} value={customerForm.occupationOther}
                    onChange={(e) => setCustomerForm((p) => ({ ...p, occupationOther: e.target.value }))} />
                )}

                <Divider sx={{ my: 0.5 }}>
                  <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
                    {t('page.consentInquiry.customer.secondSection')}
                  </Typography>
                </Divider>

                <TextField size="small" label={t('page.consentInquiry.customer.nameKanji2')} value={customerForm.nameKanji2}
                  onChange={(e) => setCustomerForm((p) => ({ ...p, nameKanji2: e.target.value }))} />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField size="small" label={t('page.consentInquiry.customer.postalCode2')} value={customerForm.postalCode2}
                    onChange={(e) => setCustomerForm((p) => ({ ...p, postalCode2: e.target.value }))}
                    helperText={t('page.consentInquiry.customer.postalHelper2')} sx={{ flex: 1 }} />
                  <Button size="small" variant="outlined" onClick={() => handlePostalLookup(2)} sx={{ height: 40, whiteSpace: 'nowrap' }}>
                    {t('page.consentInquiry.customer.postalLookup2')}
                  </Button>
                </Box>
                <TextField size="small" label={t('page.consentInquiry.customer.address2')} value={customerForm.address2}
                  onChange={(e) => setCustomerForm((p) => ({ ...p, address2: e.target.value }))} />

                <Divider sx={{ my: 0.5 }}>
                  <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
                    {t('page.consentInquiry.customer.idSection')}
                  </Typography>
                </Divider>

                <TextField select size="small" label={t('page.consentInquiry.customer.idDocType')} required value={customerForm.idDocType}
                  onChange={(e) => setCustomerForm((p) => ({ ...p, idDocType: e.target.value }))}>
                  {ID_DOC_TYPES.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                </TextField>
                <TextField size="small" label={t('page.consentInquiry.customer.idDocNumber')} value={customerForm.idDocNumber}
                  onChange={(e) => setCustomerForm((p) => ({ ...p, idDocNumber: e.target.value }))} />
              </Box>
            </Paper>
          </Box>

          <Paper variant="outlined" sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* E-47-01-11〜14: 補足事項があればコメント追加（売手選択の確定時に併せて登録） */}
            {registerMode && (
              <>
                <Button size="small" variant="outlined" startIcon={<AddCommentOutlinedIcon />}
                  onClick={() => { setCommentText(''); setCommentInputOpen(true) }}>
                  {t('page.consentInquiry.comments.add')}
                </Button>
                {pendingComments.length > 0 && (
                  <Typography sx={{ fontSize: '0.78rem', color: 'warning.dark' }}>
                    {t('page.consentInquiry.register.pendingComments', { n: pendingComments.length })}
                  </Typography>
                )}
              </>
            )}
            <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
              {t('page.consentInquiry.customer.footerNote')}
            </Typography>
            <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
              <Button size="small" color="inherit" variant="outlined"
                onClick={() => {
                  setPendingComments([])
                  setRegisterMode(false)
                  setStep(registerMode ? 'registerList' : 'detail')
                }}>
                {t('page.consentInquiry.common.abort')}
              </Button>
              <Button size="small" variant="contained" disabled={!customerFormValid}
                onClick={() => setSellerSelectOpen(true)}>
                {t('page.consentInquiry.customer.sellerSelect')}
              </Button>
            </Box>
          </Paper>
        </>
      )}

      {/* ════ ダイアログ ══════════════════════════════════════════════════════ */}

      {/* 検索理由入力（E-46-01-04〜05） */}
      <AppModal
        open={reasonDialogOpen}
        onClose={() => setReasonDialogOpen(false)}
        title={t('page.consentInquiry.searchReason.title')}
        maxWidth="sm"
        actions={[
          { label: t('page.consentInquiry.common.abort'), onClick: () => setReasonDialogOpen(false), color: 'inherit' },
          { label: t('page.consentInquiry.common.confirm'), onClick: handleReasonConfirm, variant: 'contained', disabled: !searchReason.trim() },
        ]}
      >
        <Typography sx={{ fontSize: '0.85rem', mb: 1.5 }}>
          {t('page.consentInquiry.searchReason.prompt')}
        </Typography>
        <TextField
          inputRef={reasonInputRef}
          multiline minRows={4} fullWidth size="small"
          value={searchReason}
          onChange={(e) => setSearchReason(e.target.value)}
          placeholder={t('page.consentInquiry.searchReason.placeholder')}
        />
      </AppModal>

      {/* 画像照会（E-46-01-11） */}
      <AppModal
        open={imageDialogOpen}
        onClose={() => setImageDialogOpen(false)}
        title={t('page.consentInquiry.imageDialog.title')}
        maxWidth="md"
        actions={[{ label: t('page.consentInquiry.common.close'), onClick: () => setImageDialogOpen(false), color: 'inherit' }]}
      >
        {currentDoc && (
          <Box sx={{ bgcolor: 'grey.200', p: 2, display: 'flex', justifyContent: 'center', borderRadius: 1 }}>
            <ConsentDocumentPreview doc={currentDoc} showSignature />
          </Box>
        )}
      </AppModal>

      {/* コメント入力（E-46-02-03〜04） */}
      <AppModal
        open={commentInputOpen}
        onClose={() => setCommentInputOpen(false)}
        title={t('page.consentInquiry.comments.inputTitle')}
        maxWidth="sm"
        actions={[
          { label: t('page.consentInquiry.common.abort'), onClick: () => setCommentInputOpen(false), color: 'inherit' },
          { label: t('page.consentInquiry.common.confirm'), onClick: handleCommentInputConfirm, variant: 'contained', disabled: !commentText.trim() },
        ]}
      >
        <Typography sx={{ fontSize: '0.85rem', mb: 1.5 }}>
          {t('page.consentInquiry.comments.inputPrompt')}
        </Typography>
        <TextField
          multiline minRows={4} fullWidth size="small" autoFocus
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          error={FORBIDDEN_CHARS_RE.test(commentText)}
          helperText={FORBIDDEN_CHARS_RE.test(commentText)
            ? t('page.consentInquiry.comments.forbiddenChars')
            : t('page.consentInquiry.comments.noPersonalInfo')}
        />
      </AppModal>

      {/* コメント登録確認（E-46-02-05） */}
      <AppModal
        open={commentConfirmOpen}
        onClose={() => setCommentConfirmOpen(false)}
        title={t('page.consentInquiry.comments.confirmTitle')}
        actions={[
          { label: t('page.consentInquiry.common.no'), onClick: () => setCommentConfirmOpen(false), color: 'inherit' },
          { label: t('page.consentInquiry.common.yes'), onClick: handleCommentsRegister, variant: 'contained' },
        ]}
      >
        <Typography sx={{ fontSize: '0.9rem', mb: 1 }}>
          {t('page.consentInquiry.comments.confirmMessage', { n: pendingComments.length })}
        </Typography>
        <Typography sx={{ fontSize: '0.82rem', color: 'warning.dark' }}>
          {t('page.consentInquiry.comments.confirmWarning')}
        </Typography>
      </AppModal>

      {/* コメント中止確認 */}
      <AppModal
        open={commentAbortConfirmOpen}
        onClose={() => setCommentAbortConfirmOpen(false)}
        title={t('page.consentInquiry.comments.discardTitle')}
        actions={[
          { label: t('page.consentInquiry.common.no'), onClick: () => setCommentAbortConfirmOpen(false), color: 'inherit' },
          {
            label: t('page.consentInquiry.common.yes'),
            onClick: () => {
              setPendingComments([])
              setCommentAbortConfirmOpen(false)
              setStep('detail')
            },
            variant: 'contained', color: 'warning',
          },
        ]}
      >
        <Typography sx={{ fontSize: '0.9rem' }}>
          {t('page.consentInquiry.comments.discardMessage', { n: pendingComments.length })}
        </Typography>
      </AppModal>

      {/* 売手選択（E-46-02-08）※UI/UX申し送り：個人を通常ルートとする */}
      <AppModal
        open={sellerSelectOpen}
        onClose={() => setSellerSelectOpen(false)}
        title={t('page.consentInquiry.seller.title')}
        maxWidth="sm"
        actionsNode={
          <Button color="inherit" onClick={() => setSellerSelectOpen(false)}>
            {t('page.consentInquiry.common.abort')}
          </Button>
        }
      >
        <Typography sx={{ fontSize: '0.85rem', mb: 2 }}>
          {t('page.consentInquiry.seller.prompt')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* E-46-02-09: 個人（通常ルート） */}
          <Paper
            variant="outlined"
            onClick={() => { setSellerSelectOpen(false); setIndividualConfirmOpen(true) }}
            sx={{
              flex: 1, p: 2, textAlign: 'center', cursor: 'pointer',
              borderColor: 'primary.main', borderWidth: 2,
              '&:hover': { bgcolor: '#e8f1fd' },
            }}
          >
            <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: 'primary.main' }}>
              {t('page.consentInquiry.seller.individual')}
            </Typography>
            <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', mt: 0.5 }}>
              {t('page.consentInquiry.seller.individualHint')}
            </Typography>
          </Paper>
          {/* E-46-02-11: 法人（事業者） */}
          <Paper
            variant="outlined"
            onClick={() => {
              setSellerSelectOpen(false)
              setCorporateForm({ registrationNo: '', name: '' })
              setCorporateInputOpen(true)
            }}
            sx={{ flex: 1, p: 2, textAlign: 'center', cursor: 'pointer', '&:hover': { bgcolor: 'grey.50' } }}
          >
            <Typography sx={{ fontSize: '1rem', fontWeight: 700 }}>
              {t('page.consentInquiry.seller.corporate')}
            </Typography>
            <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', mt: 0.5 }}>
              {t('page.consentInquiry.seller.corporateHint')}
            </Typography>
          </Paper>
        </Box>
      </AppModal>

      {/* 個人：登録確認（E-46-02-10） */}
      <AppModal
        open={individualConfirmOpen}
        onClose={() => setIndividualConfirmOpen(false)}
        title={t('page.consentInquiry.individualConfirm.title')}
        actions={[
          { label: t('page.consentInquiry.common.no'), onClick: () => setIndividualConfirmOpen(false), color: 'inherit' },
          { label: t('page.consentInquiry.common.yes'), onClick: () => registerCustomer('個人'), variant: 'contained' },
        ]}
      >
        <Typography sx={{ fontSize: '0.9rem', mb: 1 }}>
          {t('page.consentInquiry.individualConfirm.message')}
        </Typography>
        <Typography sx={{ fontSize: '0.85rem', color: 'warning.dark' }}>
          {t('page.consentInquiry.individualConfirm.warning')}
        </Typography>
      </AppModal>

      {/* 法人：登録番号・名称入力（E-46-02-12〜13） */}
      <AppModal
        open={corporateInputOpen}
        onClose={() => setCorporateInputOpen(false)}
        title={t('page.consentInquiry.corporate.inputTitle')}
        maxWidth="sm"
        actions={[
          { label: t('page.consentInquiry.common.abort'), onClick: () => setCorporateInputOpen(false), color: 'inherit' },
          {
            label: t('page.consentInquiry.corporate.next'), onClick: handleCorporateNext, variant: 'contained',
            disabled: !corporateForm.registrationNo.trim() || !corporateForm.name.trim(),
          },
        ]}
      >
        <Typography sx={{ fontSize: '0.85rem', mb: 2 }}>
          {t('page.consentInquiry.corporate.inputPrompt')}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            size="small" fullWidth autoFocus
            label={t('page.consentInquiry.corporate.registrationNo')}
            placeholder="T7180001074052"
            value={corporateForm.registrationNo}
            onChange={(e) => setCorporateForm((p) => ({ ...p, registrationNo: e.target.value.toUpperCase() }))}
            error={corporateForm.registrationNo !== '' && !INVOICE_NO_RE.test(corporateForm.registrationNo.trim())}
            helperText={t('page.consentInquiry.corporate.registrationNoHelper')}
          />
          <TextField
            size="small" fullWidth
            label={t('page.consentInquiry.corporate.name')}
            placeholder={t('page.consentInquiry.corporate.namePlaceholder')}
            value={corporateForm.name}
            onChange={(e) => setCorporateForm((p) => ({ ...p, name: e.target.value }))}
          />
        </Box>
      </AppModal>

      {/* 法人：登録確認（E-46-02-14） */}
      <AppModal
        open={corporateConfirmOpen}
        onClose={() => setCorporateConfirmOpen(false)}
        title={t('page.consentInquiry.corporate.confirmTitle')}
        actions={[
          { label: t('page.consentInquiry.common.no'), onClick: () => { setCorporateConfirmOpen(false); setCorporateInputOpen(true) }, color: 'inherit' },
          {
            label: t('page.consentInquiry.common.yes'),
            onClick: () => registerCustomer('法人', {
              registrationNo: corporateForm.registrationNo.trim(),
              name: corporateForm.name.trim(),
            }),
            variant: 'contained',
          },
        ]}
      >
        <Box sx={{ mb: 1.5 }}>
          <Typography sx={{ fontSize: '0.85rem' }}>
            {t('page.consentInquiry.corporate.confirmRegistrationNo')}<strong>{corporateForm.registrationNo}</strong>
          </Typography>
          <Typography sx={{ fontSize: '0.85rem' }}>
            {t('page.consentInquiry.corporate.confirmName')}<strong>{corporateForm.name}</strong>
          </Typography>
        </Box>
        <Typography sx={{ fontSize: '0.85rem', mb: 1 }}>
          {t('page.consentInquiry.corporate.confirmMessage')}
        </Typography>
        <Typography sx={{ fontSize: '0.85rem', color: 'warning.dark' }}>
          {t('page.consentInquiry.individualConfirm.warning')}
        </Typography>
      </AppModal>

      {/* 印刷理由入力（E-46-02-15〜17） */}
      <AppModal
        open={printDialogOpen}
        onClose={() => setPrintDialogOpen(false)}
        title={t('page.consentInquiry.print.title')}
        maxWidth="sm"
        actions={[
          { label: t('page.consentInquiry.common.abort'), onClick: () => setPrintDialogOpen(false), color: 'inherit' },
          { label: t('page.consentInquiry.common.confirm'), onClick: handlePrintConfirm, variant: 'contained', disabled: !printReason.trim() },
        ]}
      >
        <Typography sx={{ fontSize: '0.85rem', mb: 1.5 }}>
          {t('page.consentInquiry.print.prompt')}
        </Typography>
        <TextField
          multiline minRows={4} fullWidth size="small" autoFocus
          value={printReason}
          onChange={(e) => setPrintReason(e.target.value)}
          placeholder={t('page.consentInquiry.print.placeholder')}
        />
        <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mt: 1 }}>
          {t('page.consentInquiry.print.note')}
        </Typography>
      </AppModal>

      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          severity={toast.severity}
          variant="filled"
          onClose={() => setToast((p) => ({ ...p, open: false }))}
          sx={{ fontSize: '0.85rem' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

// ── モード選択カード（照会 / 登録）───────────────────────────────────────────

interface ModeCardProps {
  label: string
  description: string
  icon: React.ReactNode
  onClick: () => void
}

function ModeCard({ label, description, icon, onClick }: ModeCardProps) {
  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        width: 300, height: 220, borderRadius: 3, cursor: 'pointer',
        border: '1px solid', borderColor: 'divider',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.5,
        transition: 'all .15s',
        '&:hover': { borderColor: 'primary.main', boxShadow: 3, transform: 'translateY(-2px)' },
      }}
    >
      <Box
        sx={{
          width: 84, height: 84, borderRadius: '50%', bgcolor: '#e8f1fd', color: 'primary.main',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {icon}
      </Box>
      <Typography sx={{ fontSize: '1.15rem', fontWeight: 700 }}>{label}</Typography>
      <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', px: 2, textAlign: 'center' }}>
        {description}
      </Typography>
    </Paper>
  )
}

// ── 買取承諾書プレビュー（古物台帳）──────────────────────────────────────────
// 実際に印刷される日本語の法定帳票を再現するため、帳票内の文言は日本語固定とする。

function ConsentDocumentPreview({ doc, showSignature = false }: { doc: ConsentDoc; showSignature?: boolean }) {
  const c = doc.customer
  return (
    <Paper elevation={3} sx={{ width: 620, p: 2.5, bgcolor: '#fff', flexShrink: 0 }}>
      {/* タイトル + バーコード + 右上ボックス */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
        <Box>
          <Typography sx={{ fontSize: '1.05rem', fontWeight: 700, letterSpacing: 2 }}>
            ※ 買取承諾書 ※
          </Typography>
          <Typography sx={{ fontSize: '0.85rem', letterSpacing: 4 }}>（古物台帳）</Typography>
          <Typography sx={{ fontSize: '0.8rem', mt: 0.5 }}>{doc.storeCode} {doc.storeName}</Typography>
        </Box>
        <Box>
          {/* バーコード（モック） */}
          <Box
            sx={{
              height: 36, width: 180, mb: 0.5,
              backgroundImage: 'repeating-linear-gradient(90deg, #000 0 2px, #fff 2px 4px, #000 4px 5px, #fff 5px 8px)',
            }}
          />
          <Typography sx={{ fontSize: '0.65rem', fontFamily: 'monospace', textAlign: 'center' }}>
            {doc.slipNumber}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 1.5 }}>
        {/* 本文（約款） */}
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: '0.68rem', lineHeight: 1.7 }}>
            私は、以下の記載内容を確認し、商品売却を承諾します。<br />
            ■売買代金、品物について<br />
            ・提示された見積書の内容を理解し、提示の金額での売却を承諾します。<br />
            ■売却する品物について<br />
            ・私の所有物であり第三者から売却に異議を申し立てられることはありません。<br />
            ・いかなる場合でも売却成立後に取消・返却請求は行いません。<br />
            ・個人情報を含む各種データについては自己責任のもとで消去しています。<br />
            ・売却した商品内のデータを消去する事について承諾し、データ消去作業、
            システム初期化等によるデータ消失について責を問いません。<br />
            ■情報の開示について<br />
            ・古物営業法等、法令に基づき要請があった場合、本取引についての情報が
            警察、裁判所等に提供される事を承諾します。<br />
            ■インボイス制度について<br />
            ・インボイス制度における、適格請求書発行事業者ではありません。<br />
            ※本承諾書は古物営業法に基づいてお客様にご記入いただくものであり、
            ご記入いただいた個人情報は、弊社プライバシーポリシーに従い、適切に管理します。
          </Typography>
        </Box>

        {/* 右側ボックス */}
        <Box sx={{ width: 190, flexShrink: 0 }}>
          <Box sx={{ border: '1px solid #000', mb: 1 }}>
            <Box sx={{ display: 'flex', borderBottom: '1px solid #000', bgcolor: 'grey.100' }}>
              {['確認日付', '確認済', '担当者'].map((h) => (
                <Typography key={h} sx={{ flex: 1, fontSize: '0.62rem', textAlign: 'center', p: 0.25, borderRight: '1px solid #000', '&:last-child': { borderRight: 0 } }}>
                  {h}
                </Typography>
              ))}
            </Box>
            <Box sx={{ height: 28 }} />
          </Box>
          <Box sx={{ border: '1px solid #000' }}>
            {[
              ['伝票No.', doc.slipNumber.replace(/^0+/, '')],
              ['元伝票', doc.linkedSlip.replace(/^0+/, '') || ''],
              ['書面発行No.', doc.documentNo],
              ['担当', doc.staffName],
              ['営業日', doc.transactionDate],
              ['計上日時', doc.createdAt],
            ].map(([label, value]) => (
              <Box key={label} sx={{ display: 'flex', borderBottom: '1px solid #000', '&:last-child': { borderBottom: 0 } }}>
                <Typography sx={{ width: 76, fontSize: '0.62rem', p: 0.4, bgcolor: 'grey.100', borderRight: '1px solid #000' }}>
                  {label}
                </Typography>
                <Typography sx={{ flex: 1, fontSize: '0.66rem', p: 0.4, fontFamily: 'monospace' }}>
                  {value}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* 顧客情報欄 */}
      <Box sx={{ border: '1px solid #000', mt: 1.5 }}>
        {[
          ['氏名（漢字）', c.nameKanji],
          ['氏名（カナ）', c.nameKana],
          ['生年月日', c.birthDate ? `${toWareki(c.birthDate)} ${c.birthDate.replaceAll('-', '/')}` : ''],
          ['住所', [c.address, c.address2].filter(Boolean).join(' ／ ')],
          ['電話番号', c.phone],
          ['職業', c.occupation === 'その他' ? `その他（${c.occupationOther}）` : c.occupation],
          ['本人確認書類', [c.idDocType, c.idDocNumber].filter(Boolean).join(' ')],
        ].map(([label, value]) => (
          <Box key={label} sx={{ display: 'flex', borderBottom: '1px solid #000', '&:last-child': { borderBottom: 0 } }}>
            <Typography sx={{ width: 110, fontSize: '0.66rem', p: 0.5, bgcolor: 'grey.100', borderRight: '1px solid #000' }}>
              {label}
            </Typography>
            <Typography sx={{ flex: 1, fontSize: '0.72rem', p: 0.5 }}>{value}</Typography>
          </Box>
        ))}
        {doc.sellerType === '法人' && (
          <>
            <Box sx={{ display: 'flex', borderTop: '1px solid #000' }}>
              <Typography sx={{ width: 110, fontSize: '0.66rem', p: 0.5, bgcolor: 'grey.100', borderRight: '1px solid #000' }}>
                登録番号
              </Typography>
              <Typography sx={{ flex: 1, fontSize: '0.72rem', p: 0.5, fontFamily: 'monospace' }}>
                {doc.invoiceRegistrationNo}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', borderTop: '1px solid #000' }}>
              <Typography sx={{ width: 110, fontSize: '0.66rem', p: 0.5, bgcolor: 'grey.100', borderRight: '1px solid #000' }}>
                事業者名称
              </Typography>
              <Typography sx={{ flex: 1, fontSize: '0.72rem', p: 0.5 }}>{doc.corporateName}</Typography>
            </Box>
          </>
        )}
      </Box>

      {/* 買取内容 */}
      <Box sx={{ display: 'flex', gap: 2, mt: 1, alignItems: 'center' }}>
        <Typography sx={{ fontSize: '0.72rem' }}>買取内容：{doc.itemSummary}</Typography>
        <Typography sx={{ fontSize: '0.72rem', ml: 'auto', fontWeight: 700 }}>
          買取金額合計：¥{doc.totalAmount.toLocaleString()}
        </Typography>
      </Box>

      {/* 署名欄 */}
      <Box sx={{ border: '1px solid #000', mt: 1, height: 64, display: 'flex' }}>
        <Typography sx={{ width: 110, fontSize: '0.66rem', p: 0.5, bgcolor: 'grey.100', borderRight: '1px solid #000' }}>
          署名
        </Typography>
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {doc.hasSignature ? (
            showSignature ? (
              <Typography sx={{ fontFamily: 'cursive', fontSize: '1.4rem', transform: 'rotate(-3deg)' }}>
                {c.nameKanji}
              </Typography>
            ) : (
              <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                署名データあり（「画像照会」で表示）
              </Typography>
            )
          ) : (
            <Typography sx={{ fontSize: '0.7rem', color: 'text.disabled' }}>
              署名なし（{doc.noSignatureReason}）
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  )
}
