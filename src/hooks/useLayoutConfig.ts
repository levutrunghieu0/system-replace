import { useEffect, useRef } from 'react'
import { useLayoutContext, type ActionButton } from '../contexts/LayoutContext'

interface UseLayoutConfigOptions {
  title?: string
  showBackButton?: boolean
  actions?: ActionButton[]
  /** Hide secondary nav (Menu 2) to expand work area. */
  hideSecondaryNav?: boolean
  /** Override back button behaviour. If provided, called instead of router.history.back(). */
  onBack?: () => void
}

export function useLayoutConfig({
  title,
  showBackButton,
  actions,
  hideSecondaryNav,
  onBack,
}: UseLayoutConfigOptions) {
  const {
    setScreenTitle,
    setShowBackButton,
    setActions,
    setForceHideSecondaryNav,
    setOnBack,
  } = useLayoutContext()

  useEffect(() => {
    if (title !== undefined) setScreenTitle(title)
    return () => setScreenTitle('')
  }, [title, setScreenTitle])

  useEffect(() => {
    setShowBackButton(showBackButton ?? false)
    return () => setShowBackButton(false)
  }, [showBackButton, setShowBackButton])

  useEffect(() => {
    setForceHideSecondaryNav(hideSecondaryNav ?? false)
    return () => setForceHideSecondaryNav(false)
  }, [hideSecondaryNav, setForceHideSecondaryNav])

  // onBack: use a ref so the handler stays current without re-triggering the effect
  const onBackRef = useRef(onBack)
  onBackRef.current = onBack
  const hasOnBack = onBack !== undefined

  useEffect(() => {
    setOnBack(() => hasOnBack ? () => onBackRef.current?.() : undefined)
    return () => setOnBack(() => undefined)
  }, [hasOnBack, setOnBack]) // eslint-disable-line react-hooks/exhaustive-deps

  // startIcon and onClick are excluded from the comparison key (not serializable)
  const actionsKey = JSON.stringify(
    actions?.map(({ key, labelKey, disabled, variant, color, position }) => ({
      key, labelKey, disabled, variant, color, position,
    }))
  )
  const actionsRef = useRef(actions)
  actionsRef.current = actions

  useEffect(() => {
    if (actionsRef.current !== undefined) setActions(actionsRef.current)
    return () => setActions([])
  }, [actionsKey, setActions]) // eslint-disable-line react-hooks/exhaustive-deps
}
