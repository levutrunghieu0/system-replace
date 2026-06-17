import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import { useTranslation } from 'react-i18next'
import type { PurchaseLedger } from '../types'

interface Props {
  ledger: PurchaseLedger
  consentOutOfSync: boolean
  onCheckout: () => void
  disabled?: boolean
}

function LedgerRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: bold ? 700 : 500, fontSize: bold ? '0.95rem' : '0.82rem' }}>
        {value}
      </Typography>
    </Box>
  )
}

export function FinancialLedger({ ledger, consentOutOfSync, onCheckout, disabled }: Props) {
  const { t } = useTranslation()
  const { retailValue, basePrice, couponLabel, couponAdjustment, itemCount, subtotal, tax } = ledger

  return (
    <Box sx={{ border: '1px solid', borderColor: consentOutOfSync ? 'warning.main' : 'divider', borderRadius: 2, overflow: 'hidden', bgcolor: 'background.paper' }}>
      <Box sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
        <LedgerRow label={t('page.purchase.detail.ledger.retailValue')} value={`¥${retailValue.toLocaleString()}`} />
        <LedgerRow label={t('page.purchase.detail.ledger.purchasePrice')} value={`¥${basePrice.toLocaleString()}`} />
      </Box>

      {couponLabel && couponAdjustment !== 0 && (
        <>
          <Divider />
          <Box sx={{ px: 2, py: 1, bgcolor: '#f0fff4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <LocalOfferIcon sx={{ fontSize: '0.9rem', color: 'success.main' }} />
              <Chip label={couponLabel} size="small" sx={{ height: 18, fontSize: '0.68rem', bgcolor: 'success.light', color: 'success.dark', fontWeight: 600 }} />
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.dark', fontSize: '0.82rem' }}>
              +¥{couponAdjustment.toLocaleString()}
            </Typography>
          </Box>
        </>
      )}

      <Divider />
      <Box sx={{ px: 2, py: 1 }}>
        <LedgerRow label={t('page.purchase.detail.ledger.itemCount')} value={t('page.purchase.detail.ledger.itemCountValue', { n: itemCount })} />
        <LedgerRow label={t('page.purchase.detail.ledger.subtotal')} value={`¥${subtotal.toLocaleString()}`} />
        <LedgerRow label={t('page.purchase.detail.ledger.tax')} value={`¥${tax.toLocaleString()}`} />
      </Box>

      <Divider />
      <Box sx={{ px: 2, py: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
            {t('page.purchase.detail.ledger.total')}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
            ¥{(subtotal + tax).toLocaleString()}
          </Typography>
        </Box>
      </Box>

      {consentOutOfSync && (
        <Box sx={{ px: 2, pb: 1 }}>
          <Box sx={{ bgcolor: '#fff3e0', border: '1px solid', borderColor: 'warning.light', borderRadius: 1, px: 1.5, py: 0.75 }}>
            <Typography variant="caption" color="warning.dark" sx={{ fontWeight: 600, display: 'block' }}>
              {t('page.purchase.detail.ledger.outOfSyncWarning')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('page.purchase.detail.ledger.outOfSyncHint')}
            </Typography>
          </Box>
        </Box>
      )}

      <Box sx={{ p: 1.5, pt: 0 }}>
        <Button
          fullWidth
          variant="contained"
          color={consentOutOfSync ? 'warning' : 'primary'}
          disabled={disabled || itemCount === 0}
          onClick={onCheckout}
          startIcon={<AccountBalanceWalletIcon />}
          sx={{ textTransform: 'none', fontWeight: 700, py: 1 }}
        >
          {t('page.purchase.detail.ledger.checkoutButton')}
        </Button>
      </Box>
    </Box>
  )
}
