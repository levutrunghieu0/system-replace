import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined'
import PointOfSaleIcon from '@mui/icons-material/PointOfSale'
import PrintIcon from '@mui/icons-material/Print'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import { useTranslation } from 'react-i18next'
import { useBuyback } from '../../context/BuybackContext'
import { DEMO_RECEPTION_NO } from '../../types'
import { computeEstimateTotals } from '../../utils/estimateTotals'

function formatDateTime(date: Date, locale: string): string {
  return date.toLocaleString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      {typeof value === 'string' ? (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {value}
        </Typography>
      ) : (
        value
      )}
    </Box>
  )
}

export function SettlementScreen() {
  const { t, i18n } = useTranslation()
  const {
    items,
    coupon,
    personalInfo,
    paymentMethod,
    signatureData,
    settlementStatus,
    settlementError,
    registerBalance,
    paymentRecord,
    executeSettlement,
    clearSettlementError,
    demoSetLowBalance,
    closeBuyback,
  } = useBuyback()

  const totals = computeEstimateTotals(items, coupon)
  const consentSigned = Boolean(signatureData)
  const isCash = paymentMethod === 'cash'
  const completed = settlementStatus === 'completed'

  const paymentMethodLabel = paymentMethod
    ? t(
        paymentMethod === 'cash'
          ? 'buybackWizard.payment.methods.cash'
          : paymentMethod === 'pay'
            ? 'buybackWizard.payment.methods.pay'
            : 'buybackWizard.payment.methods.bankTransfer'
      )
    : '-'

  const statusChip = (
    <Chip
      size="small"
      color={completed ? 'success' : settlementStatus === 'processing' ? 'info' : 'warning'}
      label={t(
        completed
          ? 'buybackWizard.settlement.status.completed'
          : settlementStatus === 'processing'
            ? 'buybackWizard.settlement.status.processing'
            : 'buybackWizard.settlement.status.awaiting'
      )}
      sx={{ fontWeight: 700 }}
    />
  )

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        bgcolor: 'grey.50',
        overflowY: 'auto',
      }}
    >
      <Box sx={{ maxWidth: 760, width: '100%', mx: 'auto', px: 4, py: 3 }}>
        {completed && (
          <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 2 }}>
            {t('buybackWizard.settlement.completedNotice')}
          </Alert>
        )}

        {/* E-35 step 1: payout precondition summary */}
        <Paper variant="outlined" sx={{ borderRadius: 2, px: 3, py: 2, mb: 2 }}>
          <InfoRow
            label={t('buybackWizard.settlement.info.receptionNo')}
            value={DEMO_RECEPTION_NO}
          />
          <Divider />
          <InfoRow
            label={t('buybackWizard.settlement.info.customerName')}
            value={`${personalInfo.lastName} ${personalInfo.firstName}`}
          />
          <Divider />
          <InfoRow
            label={t('buybackWizard.settlement.info.itemCount')}
            value={t('buybackWizard.settlement.info.itemCountValue', {
              count: totals.acceptedCount,
            })}
          />
          <Divider />
          <InfoRow
            label={t('buybackWizard.settlement.info.paymentMethod')}
            value={paymentMethodLabel}
          />
          <Divider />
          <InfoRow
            label={t('buybackWizard.settlement.info.consentStatus')}
            value={
              <Chip
                size="small"
                color={consentSigned ? 'success' : 'error'}
                label={t(
                  consentSigned
                    ? 'buybackWizard.settlement.info.consentSigned'
                    : 'buybackWizard.settlement.info.consentUnsigned'
                )}
                sx={{ fontWeight: 700 }}
              />
            }
          />
          {isCash && (
            <>
              <Divider />
              <InfoRow
                label={t('buybackWizard.settlement.info.registerBalance')}
                value={`¥${registerBalance.toLocaleString()}`}
              />
            </>
          )}
          <Divider />
          <InfoRow label={t('buybackWizard.settlement.info.status')} value={statusChip} />
          <Divider />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              pt: 2,
              pb: 1,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {t('buybackWizard.settlement.info.totalAmount')}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
              ¥{totals.total.toLocaleString()}
            </Typography>
          </Box>
        </Paper>

        {/* Rule 4: financial journal of the completed payout */}
        {completed && paymentRecord && (
          <Paper variant="outlined" sx={{ borderRadius: 2, px: 3, py: 2, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              {t('buybackWizard.settlement.log.title')}
            </Typography>
            <InfoRow
              label={t('buybackWizard.settlement.log.transactionId')}
              value={paymentRecord.transactionId}
            />
            <Divider />
            <InfoRow
              label={t('buybackWizard.settlement.log.amount')}
              value={`¥${paymentRecord.amount.toLocaleString()}`}
            />
            <Divider />
            <InfoRow
              label={t('buybackWizard.settlement.log.staffId')}
              value={paymentRecord.staffId}
            />
            <Divider />
            <InfoRow
              label={t('buybackWizard.settlement.log.registerId')}
              value={paymentRecord.registerId}
            />
            <Divider />
            <InfoRow
              label={t('buybackWizard.settlement.log.paidAt')}
              value={formatDateTime(paymentRecord.paidAt, i18n.language)}
            />
          </Paper>
        )}

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {!completed ? (
            <>
              <Button
                variant="contained"
                size="large"
                startIcon={<PointOfSaleIcon />}
                onClick={executeSettlement}
                // Rule 1: payout is gated on a signed consent form.
                // Rule 2: locked while processing / after completion.
                disabled={!consentSigned || settlementStatus !== 'awaiting'}
                sx={{ minWidth: 240, height: 56, fontSize: '1rem', fontWeight: 700 }}
              >
                {t('buybackWizard.settlement.executeButton')}
              </Button>
              {isCash && (
                <Button variant="text" size="small" color="warning" onClick={demoSetLowBalance}>
                  {t('buybackWizard.settlement.demoLowBalance')}
                </Button>
              )}
            </>
          ) : (
            <Button
              variant="contained"
              size="large"
              onClick={closeBuyback}
              sx={{ minWidth: 240, height: 56, fontSize: '1rem', fontWeight: 700 }}
            >
              {t('buybackWizard.settlement.finishButton')}
            </Button>
          )}
        </Box>

        {!consentSigned && !completed && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {t('buybackWizard.settlement.errors.consentRequired')}
          </Alert>
        )}
      </Box>

      {/* Processing: cash drawer + receipt printer simulation */}
      <Dialog
        open={settlementStatus === 'processing'}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, textAlign: 'center' } } }}
      >
        <DialogContent sx={{ py: 5, px: 4 }}>
          <CircularProgress size={48} sx={{ mb: 3 }} />
          {isCash && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center', mb: 1 }}>
              <PointOfSaleIcon fontSize="small" color="action" />
              <Typography variant="body1">
                {t('buybackWizard.settlement.processing.drawer')}
              </Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center', mb: 2 }}>
            <PrintIcon fontSize="small" color="action" />
            <Typography variant="body1">
              {t('buybackWizard.settlement.processing.printing')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
            <Chip
              icon={<ReceiptLongIcon />}
              label={t('buybackWizard.settlement.receipts.customerCopy')}
              variant="outlined"
              size="small"
            />
            <Chip
              icon={<ReceiptLongIcon />}
              label={t('buybackWizard.settlement.receipts.storeCopy')}
              variant="outlined"
              size="small"
            />
          </Box>
        </DialogContent>
      </Dialog>

      {/* Settlement error (Rules 1-3) */}
      <Dialog
        open={settlementError !== null}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, textAlign: 'center' } } }}
      >
        <DialogContent sx={{ py: 5, px: 4 }}>
          <ErrorOutlineIcon sx={{ fontSize: 56, color: 'error.main', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 4 }}>
            {settlementError &&
              t(
                settlementError === 'consent-required'
                  ? 'buybackWizard.settlement.errors.consentRequired'
                  : settlementError === 'insufficient-balance'
                    ? 'buybackWizard.settlement.errors.insufficientBalance'
                    : 'buybackWizard.settlement.errors.duplicate'
              )}
          </Typography>
          <Button
            variant="contained"
            onClick={clearSettlementError}
            sx={{ minWidth: 160, height: 48 }}
          >
            {t('buybackWizard.settlement.errors.close')}
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  )
}
