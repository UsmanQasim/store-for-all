import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { darkColors, lightColors, radius, shadow, spacing, typography, type ThemeColors } from './tokens';

export * from './tokens';

export type Theme = {
  dark: boolean;
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  shadow: typeof shadow;
};

const ThemeContext = createContext<Theme | null>(null);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const scheme = useColorScheme();
  const theme = useMemo<Theme>(
    () => ({
      dark: false, // Stitch designs are light-only
      colors: lightColors,
      spacing,
      radius,
      typography,
      shadow,
    }),
    [scheme],
  );
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): Theme {
  const t = useContext(ThemeContext);
  if (!t) throw new Error('useAppTheme must be used inside AppThemeProvider');
  return t;
}
