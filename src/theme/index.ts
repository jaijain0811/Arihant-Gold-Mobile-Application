const themeColorsMap = {
  light: {
    background: '#FAF8F5',
    foreground: '#121110',
    card: '#FFFFFF',
    cardForeground: '#121110',
    primary: '#121110',
    primaryForeground: '#FAF8F5',
    secondary: '#F1ECE4',
    secondaryForeground: '#121110',
    muted: '#E6E0D5',
    mutedForeground: '#70685C',
    accent: '#C59B27', // Luxury Warm Gold
    accentForeground: '#121110',
    border: 'rgba(197, 155, 39, 0.25)',
    destructive: '#D93838',
    success: '#10B981',
    inputBg: '#F3EFEA',
  },
  dark: {
    background: '#0B0907',
    foreground: '#F7F3EE',
    card: '#15120E',
    cardForeground: '#F7F3EE',
    primary: '#F7F3EE',
    primaryForeground: '#0B0907',
    secondary: '#1F1913',
    secondaryForeground: '#F7F3EE',
    muted: '#2A221A',
    mutedForeground: '#B0A290',
    accent: '#D4AF37', // Pure Gold Accent
    accentForeground: '#0B0907',
    border: 'rgba(212, 175, 55, 0.22)',
    destructive: '#EF4444',
    success: '#34D399',
    inputBg: '#1C1610',
  }
};

export const colors: typeof themeColorsMap = new Proxy(themeColorsMap, {
  get(target, prop) {
    if (typeof prop === 'string' && prop in target) {
      return (target as any)[prop];
    }
    return target.light;
  }
});

export type ThemeType = 'light' | 'dark';

export const typography = {
  fontSans: 'System',
  fontSerif: 'System',
};
