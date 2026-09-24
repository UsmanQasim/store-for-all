/**
 * Design tokens — mirror of DESIGN.md. When Stitch screens arrive, adjust
 * values here first; components only ever read from the theme.
 */
const palette = {
  emerald50: '#E8F5EF',
  emerald100: '#C8E8D9',
  emerald500: '#12916A',
  emerald600: '#0B6E4F',
  emerald700: '#08573F',
  emerald900: '#04291E',
  saffron100: '#FFF1D6',
  saffron400: '#FFB938',
  saffron500: '#F5A000',
  saffron700: '#A86A00',
  stone0: '#FFFFFF',
  stone50: '#FAF8F5',
  stone100: '#F2EFEA',
  stone200: '#E6E1D9',
  stone300: '#D1CAC0',
  stone500: '#8A8279',
  stone600: '#6B645C',
  stone800: '#2E2A26',
  stone900: '#1C1A17',
  stone950: '#12110F',
  red500: '#D93F3F',
  red100: '#FDE7E7',
  blue500: '#2F6FEB',
  blue100: '#E4EDFF',
  green100: '#DDF4E6',
  green600: '#1E8E4E',
};

export type ThemeColors = {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  textInverse: string;
  primary: string;
  primaryPressed: string;
  primarySoft: string;
  onPrimary: string;
  accent: string;
  accentSoft: string;
  onAccent: string;
  danger: string;
  dangerSoft: string;
  success: string;
  successSoft: string;
  info: string;
  infoSoft: string;
  warning: string;
  warningSoft: string;
  star: string;
  overlay: string;
};

export const lightColors: ThemeColors = {
  background: palette.stone50,
  surface: palette.stone0,
  surfaceAlt: palette.stone100,
  border: palette.stone200,
  text: palette.stone900,
  textMuted: palette.stone600,
  textInverse: palette.stone0,
  primary: palette.emerald600,
  primaryPressed: palette.emerald700,
  primarySoft: palette.emerald50,
  onPrimary: palette.stone0,
  accent: palette.saffron500,
  accentSoft: palette.saffron100,
  onAccent: palette.stone950,
  danger: palette.red500,
  dangerSoft: palette.red100,
  success: palette.green600,
  successSoft: palette.green100,
  info: palette.blue500,
  infoSoft: palette.blue100,
  warning: palette.saffron700,
  warningSoft: palette.saffron100,
  star: palette.saffron500,
  overlay: 'rgba(18,17,15,0.5)',
};

export const darkColors: ThemeColors = {
  background: palette.stone950,
  surface: '#1B1916',
  surfaceAlt: '#25221E',
  border: '#34302B',
  text: '#F4F1EC',
  textMuted: '#A8A097',
  textInverse: palette.stone950,
  primary: '#2FB385',
  primaryPressed: '#249A71',
  primarySoft: '#10362A',
  onPrimary: palette.stone950,
  accent: palette.saffron400,
  accentSoft: '#3A2C10',
  onAccent: palette.stone950,
  danger: '#F06A6A',
  dangerSoft: '#3A1A1A',
  success: '#4CC47F',
  successSoft: '#143222',
  info: '#6F9BFF',
  infoSoft: '#18233D',
  warning: palette.saffron400,
  warningSoft: '#3A2C10',
  star: palette.saffron400,
  overlay: 'rgba(0,0,0,0.6)',
};

export const spacing = { xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32, huge: 48 } as const;
export const radius = { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 } as const;

export const fonts = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
} as const;

export const typography = {
  display: { fontFamily: fonts.extrabold, fontSize: 30, lineHeight: 36, letterSpacing: -0.5 },
  h1: { fontFamily: fonts.bold, fontSize: 24, lineHeight: 30, letterSpacing: -0.3 },
  h2: { fontFamily: fonts.bold, fontSize: 20, lineHeight: 26 },
  h3: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 22 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 22 },
  caption: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18 },
  label: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 16, letterSpacing: 0.4 },
  price: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 20 },
} as const;

export type TypographyVariant = keyof typeof typography;

export const shadow = {
  card: {
    shadowColor: '#1C1A17',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  floating: {
    shadowColor: '#1C1A17',
    shadowOpacity: 0.14,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
} as const;

/** Minimum touch target per Android accessibility guidance (48dp). */
export const TOUCH_TARGET = 48;
