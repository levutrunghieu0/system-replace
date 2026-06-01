import type { Shadows } from '@mui/material/styles'

function makeShadow(elevation: number): string {
  if (elevation === 0) return 'none'
  const y = Math.ceil(elevation / 2)
  const blur = elevation * 2
  const spread = elevation > 6 ? elevation - 6 : 0
  const opacity = (0.04 + elevation * 0.004).toFixed(2)
  return `0px ${y}px ${blur}px ${spread}px rgba(0,0,0,${opacity})`
}

export const shadows: Shadows = Array.from({ length: 25 }, (_, i) =>
  makeShadow(i),
) as Shadows
