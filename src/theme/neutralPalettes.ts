export const neutralPalettes = {
  dark: {
    background: '#0F0D0E',
    backgroundMuted: '#141112',
    surface: '#1C1819',
    surfaceElevated: '#272122',
    surfacePressed: '#332B2C',

    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.74)',
    textMuted: 'rgba(255,255,255,0.52)',
    textDisabled: 'rgba(255,255,255,0.32)',

    border: 'rgba(255,255,255,0.11)',
    borderStrong: 'rgba(255,255,255,0.18)',

    overlay: 'rgba(0,0,0,0.55)',
    scrim: 'rgba(0,0,0,0.75)',
  },

  light: {
    background: '#FFF8F4',
    backgroundMuted: '#F7EEE9',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFCFA',
    surfacePressed: '#F1E4DE',

    textPrimary: '#211A18',
    textSecondary: 'rgba(33,26,24,0.74)',
    textMuted: 'rgba(33,26,24,0.52)',
    textDisabled: 'rgba(33,26,24,0.32)',

    border: 'rgba(33,26,24,0.11)',
    borderStrong: 'rgba(33,26,24,0.18)',

    overlay: 'rgba(33,26,24,0.28)',
    scrim: 'rgba(33,26,24,0.48)',
  },
} as const;
