import type { CouponInfo, EstimateItem } from '../types'

/**
 * Campaign bonus for a single line item. Returned items get no bonus
 * (E-28 Rule 2: rejecting an item also removes its campaign bonus).
 */
export function couponBonusForItem(item: EstimateItem, coupon: CouponInfo): number {
  if (coupon.status !== 'loaded' || item.returned) return 0
  return Math.floor(item.estimatedPrice * item.quantity * coupon.rate)
}

export type EstimateTotals = {
  acceptedCount: number
  returnedCount: number
  subtotal: number
  couponBonus: number
  tax: number
  total: number
}

/**
 * Real-time totals over the estimate list. Items flagged as returned are
 * excluded from count, subtotal and campaign bonus (E-28 step 3).
 */
export function computeEstimateTotals(
  items: EstimateItem[],
  coupon: CouponInfo
): EstimateTotals {
  const accepted = items.filter((item) => !item.returned)
  const subtotal = accepted.reduce(
    (sum, item) => sum + item.estimatedPrice * item.quantity,
    0
  )
  const couponBonus = accepted.reduce(
    (sum, item) => sum + couponBonusForItem(item, coupon),
    0
  )
  const tax = Math.floor(subtotal * 0.1)
  return {
    acceptedCount: accepted.reduce((sum, item) => sum + item.quantity, 0),
    returnedCount: items
      .filter((item) => item.returned)
      .reduce((sum, item) => sum + item.quantity, 0),
    subtotal,
    couponBonus,
    tax,
    total: subtotal + couponBonus + tax,
  }
}
