import { useRef, useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TouchAppIcon from '@mui/icons-material/TouchApp'
import { useTranslation } from 'react-i18next'
import { WizardFooter } from '../WizardFooter'
import { useReception } from '../../context/ReceptionContext'

export function Step2Privacy() {
  const { t } = useTranslation()
  const { goTo } = useReception()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrolled, setScrolled] = useState(false)
  const [showScrollHint, setShowScrollHint] = useState(true)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const handleScroll = () => {
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 20
      if (atBottom) {
        setScrolled(true)
        setShowScrollHint(false)
      }
    }

    el.addEventListener('scroll', handleScroll)
    return () => el.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        bgcolor: 'grey.100',
      }}
    >
      <Box
        sx={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          px: 6,
          py: 3,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 2,
            mb: 2,
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {t('purchaseReceptionWizard.step2.title')}
          </Typography>

          {showScrollHint && (
            <Box
              sx={{
                flexShrink: 0,
                mt: 0.25,
                px: 2,
                py: 0.75,
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                bgcolor: 'common.white',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                color: 'text.primary',
              }}
            >
              <TouchAppIcon sx={{ fontSize: 20 }} />
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                {t('purchaseReceptionWizard.step2.scrollHint')}
              </Typography>
            </Box>
          )}
        </Box>

        <Box
          ref={scrollRef}
          sx={{
            flex: 1,
            overflowY: 'auto',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            px: 3,
            py: 2,
            bgcolor: 'common.white',
            fontSize: '0.875rem',
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          }}
        >
          <Typography
            variant="body2"
            sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}
          >
            {t('purchaseReceptionWizard.step2.policyText')}
          </Typography>
        </Box>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body1" sx={{ fontWeight: 700 }}>
            {t('purchaseReceptionWizard.step2.confirmText')}
          </Typography>
        </Box>
      </Box>

      <WizardFooter
        onCancel={() => goTo('cancel-confirm')}
        onNext={() => goTo('step3')}
        nextLabel={t('purchaseReceptionWizard.step2.agree')}
        nextDisabled={!scrolled}
      />
    </Box>
  )
}
