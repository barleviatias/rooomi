import { isNative } from '@/lib/platform'

export function useSafeArea() {
  if (!isNative) {
    return { top: 0, bottom: 0, left: 0, right: 0 }
  }

  return {
    top: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sat') || '0'),
    bottom: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sab') || '0'),
    left: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sal') || '0'),
    right: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sar') || '0'),
  }
}
