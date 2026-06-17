import Dialog from '@mui/material/Dialog'
import Box from '@mui/material/Box'
import { useTranslation } from 'react-i18next'
import { useReception } from '../context/ReceptionContext'
import { WizardHeader } from './WizardHeader'
import { TabletHandoffModal } from './TabletHandoffModal'
import { Step1Terms } from './steps/Step1Terms'
import { Step2Privacy } from './steps/Step2Privacy'
import { Step3PersonalInfo } from './steps/Step3PersonalInfo'
import { Step4ItemCategory } from './steps/Step4ItemCategory'
import { Step5Coupon } from './steps/Step5Coupon'
import { Step6Sms } from './steps/Step6Sms'
import { StaffConfirmScreen } from './staff/StaffConfirmScreen'
import { DeviceCheckScreen } from './staff/DeviceCheckScreen'
import type { WizardScreen } from '../types'

const STEP_NUMBER: Partial<Record<WizardScreen, number>> = {
  step1: 1,
  step2: 2,
  step3: 3,
  step4: 4,
  step5: 5,
  step6: 6,
}

const CUSTOMER_SCREENS: WizardScreen[] = ['step1', 'step2', 'step3', 'step4', 'step5', 'step6']
const OVERLAY_SCREENS: WizardScreen[] = ['handoff-to-customer', 'handoff-to-staff', 'cancel-confirm']

export function ReceptionWizard() {
  const { t } = useTranslation()
  const { isWizardOpen, screen, prevScreen, goTo, closeWizard } = useReception()

  const backgroundScreen =
    OVERLAY_SCREENS.includes(screen)
      ? screen === 'handoff-to-customer'
        ? null
        : prevScreen
      : screen
  const visibleScreen = backgroundScreen ?? screen
  const currentStep = STEP_NUMBER[visibleScreen] ?? null
  const isOverlay = OVERLAY_SCREENS.includes(screen)
  const isStaffScreen = screen === 'staff-confirm' || screen === 'device-check'
  const showDialog = isWizardOpen && !isStaffScreen && (!isOverlay || backgroundScreen !== null)
  const isCustomerScreen = CUSTOMER_SCREENS.includes(visibleScreen)

  const handleBack = () => {
    if (!currentStep || currentStep <= 1) return
    goTo(`step${currentStep - 1}` as WizardScreen)
  }

  return (
    <>
      <Dialog
        open={showDialog}
        fullScreen
        onClose={() => {
          // prevent accidental close
        }}
        slotProps={{ paper: { sx: { display: 'flex', flexDirection: 'column', overflow: 'hidden' } } }}
      >
        {isCustomerScreen && (
          <WizardHeader
            title={t('purchaseReceptionWizard.title.reception')}
            currentStep={currentStep}
            onBack={currentStep && currentStep > 1 ? handleBack : undefined}
            onClose={() => goTo('cancel-confirm')}
          />
        )}

        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          {visibleScreen === 'step1' && <Step1Terms />}
          {visibleScreen === 'step2' && <Step2Privacy />}
          {visibleScreen === 'step3' && <Step3PersonalInfo />}
          {visibleScreen === 'step4' && <Step4ItemCategory />}
          {visibleScreen === 'step5' && <Step5Coupon />}
          {visibleScreen === 'step6' && <Step6Sms />}
        </Box>
      </Dialog>

      {isWizardOpen && isStaffScreen && (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {screen === 'staff-confirm' && <StaffConfirmScreen />}
          {screen === 'device-check' && <DeviceCheckScreen />}
        </Box>
      )}

      <TabletHandoffModal
        open={isWizardOpen && screen === 'handoff-to-customer'}
        direction="to-customer"
        onCancel={closeWizard}
        onConfirm={() => goTo('step1')}
      />

      <TabletHandoffModal
        open={isWizardOpen && screen === 'handoff-to-staff'}
        direction="to-staff"
        onCancel={() => goTo('step6')}
        onConfirm={() => goTo('staff-confirm')}
      />

      <TabletHandoffModal
        open={isWizardOpen && screen === 'cancel-confirm'}
        direction="cancel"
        onCancel={() => goTo(currentStep ? (`step${currentStep}` as WizardScreen) : 'step1')}
        onConfirm={closeWizard}
      />
    </>
  )
}
