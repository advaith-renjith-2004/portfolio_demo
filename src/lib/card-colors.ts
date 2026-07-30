import type { CardType } from '@/types'

// RGB colors (0-255 range) for Three.js CanvasRevealEffect
export const TYPE_SPOTLIGHT_COLORS: Record<CardType, [number, number, number][]> = {
  experience: [
    [56, 189, 248], // sky-400
    [14, 165, 233], // sky-500
  ],
  project: [
    [52, 211, 153], // emerald-400
    [16, 185, 129], // emerald-500
  ],
  skill: [
    [167, 139, 250], // violet-400
    [139, 92, 246], // violet-500
  ],
  education: [
    [251, 191, 36], // amber-400
    [245, 158, 11], // amber-500
  ],
  about: [
    [148, 163, 184], // slate-400
    [100, 116, 139], // slate-500
  ],
}
