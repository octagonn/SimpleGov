import { createContext, ReactNode, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

type ColorTokens = {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  muted: string;
  accent: string;
  success: string;
  warning: string;
};

type SpacingTokens = {
  xxs: number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
};

type RadiiTokens = {
  sm: number;
  md: number;
  lg: number;
  xl: number;
};

type TypographyTokens = {
  fontFamily: string;
  weightRegular: string;
  weightMedium: string;
  weightSemibold: string;
  weightBold: string;
  sizes: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    hero: number;
  };
};

export type SimpleGovTheme = {
  mode: 'light' | 'dark';
  colors: ColorTokens;
  spacing: SpacingTokens;
  radii: RadiiTokens;
  typography: TypographyTokens;
};

const spacing: SpacingTokens = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 36
};

const radii: RadiiTokens = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24
};

const typography: TypographyTokens = {
  fontFamily: 'System',
  weightRegular: '400',
  weightMedium: '500',
  weightSemibold: '600',
  weightBold: '700',
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 26,
    hero: 32
  }
};

const lightColors: ColorTokens = {
  background: '#F7F9FC',
  surface: '#FFFFFF',
  surfaceAlt: '#E4E9F5',
  border: '#D0D8E8',
  textPrimary: '#0A1627',
  textSecondary: '#314161',
  muted: '#64748B',
  accent: '#1D3FFF',
  success: '#18A558',
  warning: '#FF6B35'
};

const darkColors: ColorTokens = {
  background: '#0D1117',
  surface: '#161B22',
  surfaceAlt: '#1F2937',
  border: '#233044',
  textPrimary: '#F4F7FB',
  textSecondary: '#B9C6D6',
  muted: '#8FA2B5',
  accent: '#3E68FF',
  success: '#30C48D',
  warning: '#FF8250'
};

const lightTheme: SimpleGovTheme = {
  mode: 'light',
  colors: lightColors,
  spacing,
  radii,
  typography
};

const darkTheme: SimpleGovTheme = {
  mode: 'dark',
  colors: darkColors,
  spacing,
  radii,
  typography
};

const ThemeContext = createContext<SimpleGovTheme>(darkTheme);

export type ThemeProviderProps = {
  children: ReactNode;
  mode?: 'light' | 'dark';
};

export function ThemeProvider({ children, mode }: ThemeProviderProps) {
  const systemScheme = useColorScheme();
  const resolvedMode = mode ?? (systemScheme === 'dark' ? 'dark' : 'light');

  const value = useMemo(() => (resolvedMode === 'dark' ? darkTheme : lightTheme), [resolvedMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

export const themes = {
  light: lightTheme,
  dark: darkTheme
};
