export const iconSizes = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  xxl: 36,
} as const;

export const iconStrokeWidths = {
  thin: 1.5,
  regular: 2,
  medium: 2.25,
  bold: 2.6,
} as const;

export const iconContainers = {
  sm: {
    width: 32,
    height: 32,
    borderRadius: 10,
  },
  md: {
    width: 40,
    height: 40,
    borderRadius: 14,
  },
  lg: {
    width: 48,
    height: 48,
    borderRadius: 16,
  },
  pill: {
    minWidth: 44,
    height: 44,
    borderRadius: 999,
  },
} as const;
