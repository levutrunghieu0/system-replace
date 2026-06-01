import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import InputBase from '@mui/material/InputBase'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'
import KeyboardIcon from '@mui/icons-material/Keyboard'
import { Link } from '@tanstack/react-router'
import { useLayoutConfig } from '../hooks/useLayoutConfig'
import { primaryMenuItems } from '../config/navigation'

export const Route = createFileRoute('/')({
  component: TopPage,
})

// Color per primary section — used as icon background
const SECTION_COLORS: Record<string, string> = {
  front:              '#1976d2',
  purchaseReception:  '#e65100',
  purchase:           '#388e3c',
  inventory:          '#7b1fa2',
  warehouse:          '#0097a7',
  ecTransaction:      '#c62828',
  member:             '#ad1457',
  storeOperation:     '#283593',
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'おはようございます'
  if (h < 18) return 'こんにちは'
  return 'こんばんは'
}

function TopPage() {
  const { t } = useTranslation()
  const searchRef = useRef<HTMLInputElement>(null)
  const [searchInput, setSearchInput] = useState('')
  const [activeQuery, setActiveQuery] = useState('')

  useLayoutConfig({ title: t('screen.home') })

  // 300ms debounce — creates the "slight delay" search feel
  useEffect(() => {
    const timer = setTimeout(() => setActiveQuery(searchInput.trim().toLowerCase()), 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  // Press "/" to focus search (desktop shortcut)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchRef.current) {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Build sections with matched state per sub-item
  const sections = useMemo(() => {
    return primaryMenuItems.map((primary) => {
      const color = SECTION_COLORS[primary.key] ?? '#616161'
      const items = primary.subItems.map((sub) => {
        const label = t(sub.labelKey)
        const matched = !activeQuery || label.toLowerCase().includes(activeQuery)
        return { ...sub, label, color, matched }
      })
      return {
        ...primary,
        primaryLabel: t(primary.labelKey),
        color,
        items,
        hasMatch: items.some((i) => i.matched),
      }
    })
  }, [t, activeQuery])

  const visibleSections = activeQuery ? sections.filter((s) => s.hasMatch) : sections
  const isSearching = searchInput.length > 0
  const totalItems = primaryMenuItems.reduce((n, s) => n + s.subItems.length, 0)

  return (
    <Box sx={{ pb: 6, maxWidth: 960, mx: 'auto' }}>

      {/* ── Greeting ── */}
      <Box sx={{ mb: 2.5, pt: 0.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
          {greeting()}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {totalItems} 件のメニューが利用可能です
        </Typography>
      </Box>

      {/* ── Search bar ── */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          bgcolor: 'background.default',
          pb: 2.5,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: 'action.hover',
            borderRadius: 3,
            px: 1.5,
            py: 0.6,
            gap: 1,
            border: '1.5px solid',
            borderColor: isSearching ? 'primary.main' : 'transparent',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            boxShadow: isSearching ? '0 0 0 3px rgba(25,118,210,0.12)' : 'none',
          }}
        >
          <SearchIcon sx={{ color: isSearching ? 'primary.main' : 'text.disabled', fontSize: 20, transition: 'color 0.2s ease' }} />
          <InputBase
            inputRef={searchRef}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="メニューを検索..."
            sx={{ flex: 1, fontSize: '0.9rem' }}
          />
          {isSearching ? (
            <IconButton size="small" onClick={() => setSearchInput('')} sx={{ p: 0.25 }}>
              <ClearIcon fontSize="small" />
            </IconButton>
          ) : (
            <Tooltip title='Press "/" to search' placement="top">
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.25,
                px: 0.75,
                py: 0.2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                color: 'text.disabled',
                cursor: 'default',
              }}>
                <KeyboardIcon sx={{ fontSize: 13 }} />
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 600 }}>/</Typography>
              </Box>
            </Tooltip>
          )}
        </Box>

        {/* Search result count */}
        {activeQuery && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: 'block', pl: 0.5 }}>
            「{activeQuery}」: {visibleSections.reduce((n, s) => n + s.items.filter(i => i.matched).length, 0)} 件一致
          </Typography>
        )}
      </Box>

      {/* ── Sections ── */}
      {visibleSections.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
          {visibleSections.map((section) => (
            <Box key={section.key}>

              {/* Section header */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.75 }}>
                <Box sx={{
                  width: 26,
                  height: 26,
                  borderRadius: '7px',
                  bgcolor: section.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  flexShrink: 0,
                  '& svg': { fontSize: 15 },
                }}>
                  {section.icon}
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.8rem', color: 'text.secondary', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  {section.primaryLabel}
                </Typography>
                <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider', ml: 0.5 }} />
                {activeQuery && (
                  <Chip
                    label={`${section.items.filter(i => i.matched).length} 件`}
                    size="small"
                    sx={{ fontSize: '0.65rem', height: 18, bgcolor: section.color, color: 'white', fontWeight: 700 }}
                  />
                )}
              </Box>

              {/* App-icon grid */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {section.items.map((item) => (
                  <Link
                    key={`${section.key}-${item.key}`}
                    to={item.path as Parameters<typeof Link>[0]['to']}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <Box sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 0.75,
                      p: 1,
                      width: 80,
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition: 'opacity 0.28s ease, transform 0.28s ease, background-color 0.15s ease',
                      opacity: item.matched ? 1 : 0.15,
                      transform: item.matched ? 'scale(1)' : 'scale(0.88)',
                      pointerEvents: item.matched ? 'auto' : 'none',
                      '&:hover': {
                        bgcolor: 'action.hover',
                        transform: 'scale(1.08)',
                      },
                      '&:active': {
                        transform: 'scale(0.96)',
                      },
                    }}>
                      {/* iOS-style icon */}
                      <Box sx={{
                        width: 52,
                        height: 52,
                        borderRadius: '14px',
                        background: `linear-gradient(145deg, ${item.color}ee, ${item.color}bb)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        flexShrink: 0,
                        boxShadow: item.matched
                          ? `0 4px 10px ${item.color}45`
                          : 'none',
                        transition: 'box-shadow 0.28s ease',
                        '& svg': { fontSize: 26 },
                      }}>
                        {item.icon}
                      </Box>
                      {/* Label */}
                      <Typography sx={{
                        fontSize: '0.67rem',
                        textAlign: 'center',
                        lineHeight: 1.35,
                        color: 'text.primary',
                        fontWeight: 500,
                        maxWidth: 72,
                        wordBreak: 'break-word',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {item.label}
                      </Typography>
                    </Box>
                  </Link>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      ) : (
        /* ── Empty search state ── */
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1.5,
          pt: 8,
          color: 'text.secondary',
        }}>
          <SearchIcon sx={{ fontSize: 52, opacity: 0.25 }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            「{activeQuery}」に一致するメニューがありません
          </Typography>
          <Chip
            label="検索をクリア"
            size="small"
            variant="outlined"
            onClick={() => setSearchInput('')}
            sx={{ cursor: 'pointer', mt: 0.5 }}
          />
        </Box>
      )}
    </Box>
  )
}
