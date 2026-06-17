import { createFileRoute } from '@tanstack/react-router'
import { useState, useCallback, useMemo } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Paper from '@mui/material/Paper'
import Switch from '@mui/material/Switch'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen'
import OpenInFullIcon from '@mui/icons-material/OpenInFull'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { useTranslation } from 'react-i18next'
import { AppModal } from '../components/common/AppModal'
import { FilterBar } from '../components/common/FilterBar'
import type { FilterChipDef } from '../components/common/FilterBar'
import { InventorySetupTabBar } from '../components/common/InventorySetupTabBar'
import { useLayoutConfig } from '../hooks/useLayoutConfig'

export const Route = createFileRoute('/inventory/classification')({
  component: ClassificationSettingsPage,
})

// ── Types ─────────────────────────────────────────────────────────────────────
interface SubCategory { id: string; name: string; group: string }

// ── Group & tab definitions ───────────────────────────────────────────────────
const GROUPS = [
  { key: 'fashion',     label: '衣料・身の回り品',    from: 1,   to: 36  },
  { key: 'household',   label: '日用雑貨・インテリア', from: 37,  to: 72  },
  { key: 'cosmetics',   label: 'コスメ・美容',         from: 73,  to: 96  },
  { key: 'food',        label: '食品・飲料',            from: 97,  to: 126 },
  { key: 'books',       label: '書籍・ホビー',          from: 127, to: 156 },
  { key: 'electronics', label: '家電・PC',              from: 157, to: 186 },
  { key: 'sports',      label: 'スポーツ・アウトドア',  from: 187, to: 222 },
  { key: 'baby',        label: 'ベビー・マタニティ',    from: 223, to: 246 },
  { key: 'pets',        label: 'ペット用品',             from: 247, to: 264 },
  { key: 'auto',        label: '車・バイク用品',         from: 265, to: 282 },
  { key: 'tools',       label: '工具・DIY・園芸',        from: 283, to: 300 },
]

const MACRO_TABS = [
  { key: 'all',         label: 'すべて',          groups: [] as string[] },
  { key: 'fashion',     label: 'ファッション',     groups: ['fashion'] },
  { key: 'daily',       label: '日用品・生活雑貨', groups: ['household', 'cosmetics', 'baby'] },
  { key: 'electronics', label: '家電・PC',         groups: ['electronics'] },
  { key: 'food_hobby',  label: '食品・ホビー',     groups: ['food', 'books', 'sports'] },
  { key: 'other',       label: 'その他',           groups: ['pets', 'auto', 'tools'] },
]

// ── Mock data ─────────────────────────────────────────────────────────────────
const NAMES = [
  '衣料（婦人）','衣料（紳士）','服飾雑貨','バッグ・財布','シューズ','アクセサリー',
  'キッズ衣料','スポーツウェア','寝具・タオル','インテリア','キッチン用品','食器・調理器具',
  '家電（小型）','家電（大型）','AV機器','PC・周辺機器','スマートフォン','カメラ',
  '書籍・雑誌','コミック','DVD・BD','ゲームソフト','ゲーム機器','おもちゃ',
  '文具・オフィス','画材','工具・DIY','園芸・農業','ペット用品','食品・飲料',
  'お菓子','調味料','化粧品','健康食品','医薬品','ベビー用品',
  'スポーツ用品','アウトドア','釣り・キャンプ','楽器','水着','下着・靴下',
  'ナイトウェア','マタニティ','ブライダル','和装','フォーマル','カジュアル',
  'ワークウェア','防寒具','レインウェア','帽子','手袋・スカーフ','財布・キーケース',
  '名刺入れ','旅行用品','傘・雨具','サングラス','時計','ジュエリー',
  'ヘアアクセサリー','コスメ（口紅）','コスメ（ファンデ）','コスメ（アイ）','ネイル','香水',
  'ボディケア','スキンケア','ヘアケア','洗面用品','入浴用品','掃除用品',
  '洗濯用品','防虫・消臭','ゴミ箱・収納','カーテン','ラグ・マット','照明',
  '壁掛け時計','絵画・アート','観葉植物','鍋・フライパン','包丁・まな板','保存容器',
  '弁当箱','水筒・ポット','コーヒー用品','お茶用品','酒類','パン・ベーカリー',
  '米・穀物','麺類','缶詰・瓶詰','冷凍食品','レトルト食品','サプリメント',
  'ビタミン剤','プロテイン','ダイエット食品','介護用品','眼鏡・コンタクト','歯ブラシ',
  'ランドセル','学習用品','知育玩具','ぬいぐるみ','ブロック・パズル','カードゲーム',
  'ボードゲーム','自転車','スケートボード','水泳用品','テニス用品','サッカー用品',
  '野球用品','ゴルフ用品','スキー・スノボ','登山用品','ヨガ用品','釣り具',
  'キャンプ用品','テント','寝袋','バーベキュー','ピアノ','ギター',
  'ドラム','DJ機器','マイク・音響','カメラ用品','三脚','照明機材',
  'モバイルバッテリー','ケーブル類','スマホケース','ウェアラブル','イヤホン','スピーカー',
  'プロジェクター','テレビ','レコーダー','ゲームコントローラー','プリンター','事務用品',
  '机・チェア','棚・収納','のぼり・旗','看板','梱包材','ねじ・ボルト',
  '電気部品','配管用品','外壁材','床材','フェンス','防犯用品',
  '消火器','防災用品','花・植物','土・肥料','プランター','農具',
  '芝刈り機','剪定ハサミ','種・球根','犬用品','猫用品','小動物用品',
  '鳥用品','魚用品','ペットフード（犬）','ペットフード（猫）','ペット医療','ペットケア',
  '車用品','バイク用品','タイヤ・ホイール','カーナビ','ドライブレコーダー','カーケア',
  '自動車整備','バッテリー','エンジンオイル','洗車用品','自転車部品','電動自転車',
  'バドミントン','バスケットボール','バレーボール','格闘技用品','ダンス用品','天体望遠鏡',
  'ドローン','ラジコン','VR機器','楽譜','CD・レコード','フィルム',
  'スケッチブック','版画用品','授乳用品','おむつ・ケア','離乳食','ベビーカー',
  'チャイルドシート','ベビーベッド','哺乳瓶','ベビー食器','マタニティウェア','爬虫類用品',
]

function pad(n: number) { return String(n).padStart(3, '0') }

const MOCK_CATEGORIES: SubCategory[] = Array.from({ length: 300 }, (_, i) => {
  const num = i + 1
  const g = GROUPS.find(g => num >= g.from && num <= g.to)!
  return { id: pad(num), name: NAMES[i % NAMES.length], group: g.key }
})

const INITIAL_SELECTED = new Set([
  '001','002','003','010','019','020','025','028','030','035',
  '037','040','042','050','055','060',
  '073','078','080',
  '097','100','105','110','115','120',
  '127','130','135','140',
  '157','160','165',
  '187','190',
  '223','230','247',
  '265','283',
])

const BLUE  = '#005BAC'
const GREEN = '#00A854'

// ── Shared grid pane ──────────────────────────────────────────────────────────
interface GridPaneProps {
  items: SubCategory[]
  height: number | string
  selected: Set<string>
  toggle: (id: string) => void
  showSelectedOnly: boolean
}

function GridPane({ items, height, selected, toggle, showSelectedOnly }: GridPaneProps) {
  return (
    <Paper variant="outlined" sx={{ height, overflowX: 'auto', overflowY: 'hidden' }}>
      {items.length === 0 ? (
        <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography sx={{ fontSize: '0.85rem', color: 'text.disabled' }}>
            {showSelectedOnly ? '選択された小分類がありません' : '表示する小分類がありません'}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap', alignContent: 'flex-start', height: '100%' }}>
          {items.map(cat => (
            <Box key={cat.id} onClick={() => toggle(cat.id)}
              sx={{
                display: 'flex', alignItems: 'center',
                width: 186, height: 26, flexShrink: 0,
                px: 0.5, cursor: 'pointer', boxSizing: 'border-box',
                borderBottom: '1px solid', borderRight: '1px solid', borderColor: 'divider',
                bgcolor: selected.has(cat.id) ? '#e8f0fb' : 'transparent',
                '&:hover': { bgcolor: selected.has(cat.id) ? '#d0e1f7' : 'action.hover' },
                transition: 'background-color 0.12s',
              }}
            >
              <Checkbox size="small" checked={selected.has(cat.id)} onChange={() => toggle(cat.id)}
                onClick={e => e.stopPropagation()}
                sx={{ p: 0, mr: 0.25, flexShrink: 0, '&.Mui-checked': { color: BLUE } }}
              />
              <Typography noWrap sx={{ fontSize: '0.75rem', lineHeight: 1 }} title={`${cat.id}: ${cat.name}`}>
                {cat.id}: {cat.name}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  )
}

// ── Shared tabs + toggle bar ───────────────────────────────────────────────────
interface ControlBarProps {
  selected: Set<string>
  activeTab: string
  onTabChange: (tab: string) => void
  showSelectedOnly: boolean
  onToggle: (v: boolean) => void
  displayCount: number
  tabItems: SubCategory[]
  onExpand?: () => void
}

function ControlBar({ selected, activeTab, onTabChange, showSelectedOnly, onToggle, displayCount, tabItems, onExpand }: ControlBarProps) {
  return (
    <>
      <Tabs value={activeTab} onChange={(_, v) => onTabChange(v)} variant="scrollable" scrollButtons="auto"
        sx={{
          borderBottom: '2px solid', borderColor: 'divider', minHeight: 36,
          '& .MuiTab-root': { minHeight: 36, py: 0, px: 1.5, fontSize: '0.78rem', textTransform: 'none' },
          '& .Mui-selected': { color: BLUE, fontWeight: 700 },
          '& .MuiTabs-indicator': { bgcolor: BLUE, height: 3 },
        }}
      >
        {MACRO_TABS.map(tab => {
          const items = tab.key === 'all' ? MOCK_CATEGORIES : MOCK_CATEGORIES.filter(c => tab.groups.includes(c.group))
          const selCount = items.filter(c => selected.has(c.id)).length
          return (
            <Tab key={tab.key} value={tab.key}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <span>{tab.label}</span>
                  {selCount > 0 && (
                    <Chip label={selCount} size="small"
                      sx={{ height: 16, fontSize: '0.65rem', bgcolor: BLUE, color: 'white', '& .MuiChip-label': { px: 0.75 } }}
                    />
                  )}
                </Box>
              }
            />
          )
        })}
      </Tabs>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: BLUE }}>
          選択中: {selected.size} / 全小分類: {MOCK_CATEGORIES.length}
          {activeTab !== 'all' && (
            <Typography component="span" sx={{ fontSize: '0.75rem', fontWeight: 400, color: 'text.secondary', ml: 1 }}>
              （表示中: {tabItems.length}件）
            </Typography>
          )}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FormControlLabel
            control={
              <Switch size="small" checked={showSelectedOnly} onChange={e => onToggle(e.target.checked)}
                sx={{ '& .Mui-checked': { color: BLUE }, '& .Mui-checked + .MuiSwitch-track': { bgcolor: BLUE } }}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography sx={{ fontSize: '0.78rem', color: showSelectedOnly ? BLUE : 'text.secondary', fontWeight: showSelectedOnly ? 600 : 400 }}>
                  選択中のみ表示
                </Typography>
                {showSelectedOnly && (
                  <Chip label={displayCount} size="small"
                    sx={{ height: 16, fontSize: '0.65rem', bgcolor: BLUE, color: 'white', '& .MuiChip-label': { px: 0.75 } }}
                  />
                )}
              </Box>
            }
            labelPlacement="start" sx={{ mr: 0 }}
          />

          {onExpand && (
            <IconButton
              size="small"
              onClick={onExpand}
              title="全画面表示"
              sx={{
                color: BLUE, border: '1px solid', borderColor: BLUE,
                '&:hover': { bgcolor: '#e8f0fb' },
              }}
            >
              <OpenInFullIcon sx={{ fontSize: '0.85rem' }} />
            </IconButton>
          )}
        </Box>
      </Box>
    </>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
function ClassificationSettingsPage() {
  const { t } = useTranslation()
  const [selected, setSelected]                 = useState<Set<string>>(INITIAL_SELECTED)
  const [activeTab, setActiveTab]               = useState('all')
  const [showSelectedOnly, setShowSelectedOnly] = useState(false)
  const [expanded, setExpanded]                 = useState(false)
  const [initDialog, setInitDialog]             = useState(false)
  const [filterMonth, setFilterMonth]           = useState<string | null>(null)
  const [filterStatus, setFilterStatus]         = useState<string | null>(null)

  const MONTHS = ['全月', '2026年1月', '2026年2月', '2026年3月', '2026年4月', '2026年5月', '2026年6月']
  const STATUSES = ['全て', '棚卸済', '棚卸未実施']

  const filterChips = useMemo<FilterChipDef[]>(() => [
    {
      key: 'month',
      label: '実施月',
      value: filterMonth ?? undefined,
      active: filterMonth !== null,
      popoverContent: (close) => (
        <List dense disablePadding sx={{ py: 0.5 }}>
          {MONTHS.map((m) => (
            <ListItemButton
              key={m}
              selected={filterMonth === (m === '全月' ? null : m) || (m === '全月' && filterMonth === null)}
              onClick={() => { setFilterMonth(m === '全月' ? null : m); close() }}
              sx={{ px: 2, py: 0.5 }}
            >
              <ListItemText primary={m} slotProps={{ primary: { style: { fontSize: '0.8rem' } } }} />
            </ListItemButton>
          ))}
        </List>
      ),
    },
    {
      key: 'status',
      label: '棚卸状況',
      value: filterStatus ?? undefined,
      active: filterStatus !== null,
      popoverContent: (close) => (
        <List dense disablePadding sx={{ py: 0.5 }}>
          {STATUSES.map((s) => (
            <ListItemButton
              key={s}
              selected={filterStatus === (s === '全て' ? null : s) || (s === '全て' && filterStatus === null)}
              onClick={() => { setFilterStatus(s === '全て' ? null : s); close() }}
              sx={{ px: 2, py: 0.5 }}
            >
              <ListItemText primary={s} slotProps={{ primary: { style: { fontSize: '0.8rem' } } }} />
            </ListItemButton>
          ))}
        </List>
      ),
    },
    { key: 'shelf',    label: '棚番号',   onClick: () => {} },
    { key: 'operator', label: 'スキャン担当者', onClick: () => {} },
  ], [filterMonth, filterStatus])

  useLayoutConfig({ title: t('page.tanazaoroshi.classification.title') })

  const toggle = useCallback((id: string) =>
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n }), [])

  const tabItems = useMemo(() => {
    if (activeTab === 'all') return MOCK_CATEGORIES
    const tab = MACRO_TABS.find(t => t.key === activeTab)!
    return MOCK_CATEGORIES.filter(c => tab.groups.includes(c.group))
  }, [activeTab])

  const displayItems = useMemo(
    () => showSelectedOnly ? tabItems.filter(c => selected.has(c.id)) : tabItems,
    [tabItems, showSelectedOnly, selected],
  )

  const controlBarProps: ControlBarProps = {
    selected, activeTab, onTabChange: setActiveTab,
    showSelectedOnly, onToggle: setShowSelectedOnly,
    displayCount: displayItems.length, tabItems,
    onExpand: () => setExpanded(true),
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <InventorySetupTabBar
        activeTab="classification"
        filterSlot={<FilterBar filters={filterChips} />}
      />

      <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {/* Notes */}
        <Paper variant="outlined" sx={{ p: 1.5, bgcolor: '#fffbf0', borderColor: '#f0dfa0' }}>
          <Typography sx={{ fontSize: '0.80rem', color: 'text.secondary' }}>
            ※ 新規に棚卸業務を開始するときは、必ず「初期化」キーを押して下さい。
          </Typography>
          <Typography sx={{ fontSize: '0.80rem', color: 'text.secondary', mt: 0.25 }}>
            ※ 実施月で絞込と、棚卸実施基準で指定されている小分類だけが表示されます。
          </Typography>
        </Paper>

        {/* Tabs + counter/toggle */}
        <ControlBar {...controlBarProps} />

        {/* Grid */}
        <GridPane items={displayItems} height={416} selected={selected} toggle={toggle} showSelectedOnly={showSelectedOnly} />

        {/* Global actions */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button size="small" variant="outlined"
            onClick={() => setSelected(new Set(MOCK_CATEGORIES.map(c => c.id)))}>
            {t('page.tanazaoroshi.classification.action.selectAll')}
          </Button>
          <Button size="small" variant="outlined"
            onClick={() => setSelected(new Set())}>
            {t('page.tanazaoroshi.classification.action.clearAll')}
          </Button>
          <Button size="small" variant="outlined" color="error"
            onClick={() => setInitDialog(true)}>
            {t('page.tanazaoroshi.classification.action.initialize')}
          </Button>
          <Button size="small" variant="contained"
            startIcon={<PlayArrowIcon fontSize="small" />}
            disabled={selected.size === 0}
            sx={{ bgcolor: GREEN, '&:hover': { bgcolor: '#007a3d' }, '&.Mui-disabled': { bgcolor: 'action.disabledBackground' } }}
          >
            {t('page.tanazaoroshi.classification.action.run')}
          </Button>
        </Box>

        {/* Initialize dialog */}
        <AppModal
          open={initDialog}
          onClose={() => setInitDialog(false)}
          title={t('page.tanazaoroshi.classification.action.initialize')}
          actions={[
            { label: t('page.tanazaoroshi.classification.dialog.no'), onClick: () => setInitDialog(false), color: 'inherit' },
            { label: t('page.tanazaoroshi.classification.dialog.yes'), onClick: () => { setSelected(new Set(INITIAL_SELECTED)); setInitDialog(false) }, variant: 'contained', color: 'error' },
          ]}
        >
          <Typography sx={{ fontSize: '0.9rem' }}>
            {t('page.tanazaoroshi.classification.dialog.initConfirm')}
          </Typography>
        </AppModal>
      </Box>

      {/* Fullscreen dialog */}
      <Dialog
        open={expanded}
        onClose={() => setExpanded(false)}
        fullScreen
        slotProps={{ paper: { sx: { display: 'flex', flexDirection: 'column', overflow: 'hidden' } } }}
      >
        {/* Single compact header: close | tabs (flex) | counter + toggle */}
        <Box sx={{
          display: 'flex', alignItems: 'center', flexShrink: 0,
          height: 42, borderBottom: '2px solid', borderColor: 'divider',
          pl: 0.5, pr: 1,
        }}>
          <Tooltip title="全画面を閉じる">
            <IconButton size="small" onClick={() => setExpanded(false)} sx={{ mr: 0.5, flexShrink: 0 }}>
              <CloseFullscreenIcon sx={{ fontSize: '0.9rem' }} />
            </IconButton>
          </Tooltip>

          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto"
            sx={{
              flex: 1, minHeight: 42,
              '& .MuiTab-root': { minHeight: 42, py: 0, px: 1.5, fontSize: '0.78rem', textTransform: 'none' },
              '& .Mui-selected': { color: BLUE, fontWeight: 700 },
              '& .MuiTabs-indicator': { bgcolor: BLUE, height: 3 },
            }}
          >
            {MACRO_TABS.map(tab => {
              const items = tab.key === 'all' ? MOCK_CATEGORIES : MOCK_CATEGORIES.filter(c => tab.groups.includes(c.group))
              const selCount = items.filter(c => selected.has(c.id)).length
              return (
                <Tab key={tab.key} value={tab.key}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <span>{tab.label}</span>
                      {selCount > 0 && (
                        <Chip label={selCount} size="small"
                          sx={{ height: 16, fontSize: '0.65rem', bgcolor: BLUE, color: 'white', '& .MuiChip-label': { px: 0.75 } }}
                        />
                      )}
                    </Box>
                  }
                />
              )
            })}
          </Tabs>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0, pl: 1 }}>
            <Typography sx={{ fontSize: '0.80rem', fontWeight: 700, color: BLUE, whiteSpace: 'nowrap' }}>
              選択中: {selected.size} / {MOCK_CATEGORIES.length}
            </Typography>
            <FormControlLabel
              control={
                <Switch size="small" checked={showSelectedOnly} onChange={e => setShowSelectedOnly(e.target.checked)}
                  sx={{ '& .Mui-checked': { color: BLUE }, '& .Mui-checked + .MuiSwitch-track': { bgcolor: BLUE } }}
                />
              }
              label={
                <Typography sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap', color: showSelectedOnly ? BLUE : 'text.secondary', fontWeight: showSelectedOnly ? 600 : 400 }}>
                  選択中のみ
                </Typography>
              }
              labelPlacement="start" sx={{ mr: 0 }}
            />
          </Box>
        </Box>

        {/* Grid — takes all remaining height; 42px header + 2px border + 8px padding = 52px overhead */}
        <Box sx={{ p: 0.5, overflow: 'hidden' }}>
          <GridPane items={displayItems} height="calc(100vh - 52px)" selected={selected} toggle={toggle} showSelectedOnly={showSelectedOnly} />
        </Box>
      </Dialog>
    </Box>
  )
}
