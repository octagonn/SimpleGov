import { PropsWithChildren, useMemo } from 'react';
import { StyleProp, StyleSheet, Text, TextProps, TextStyle } from 'react-native';
import { SimpleGovTheme, useTheme } from '../theme';

type TypeProps = TextProps & {
  style?: StyleProp<TextStyle>;
};

export function HeroTitle({ children, style, ...rest }: PropsWithChildren<TypeProps>) {
  const styles = useThemedText();
  return (
    <Text style={[styles.base, styles.hero, style]} {...rest} accessibilityRole="header">
      {children}
    </Text>
  );
}

export function Heading({ children, style, ...rest }: PropsWithChildren<TypeProps>) {
  const styles = useThemedText();
  return (
    <Text style={[styles.base, styles.heading, style]} {...rest} accessibilityRole="header">
      {children}
    </Text>
  );
}

export function Subheading({ children, style, ...rest }: PropsWithChildren<TypeProps>) {
  const styles = useThemedText();
  return (
    <Text style={[styles.base, styles.subheading, style]} {...rest}>
      {children}
    </Text>
  );
}

export function Body({ children, style, ...rest }: PropsWithChildren<TypeProps>) {
  const styles = useThemedText();
  return (
    <Text style={[styles.base, styles.body, style]} {...rest}>
      {children}
    </Text>
  );
}

export function Caption({ children, style, ...rest }: PropsWithChildren<TypeProps>) {
  const styles = useThemedText();
  return (
    <Text style={[styles.base, styles.caption, style]} {...rest}>
      {children}
    </Text>
  );
}

type Variant = 'hero' | 'heading' | 'subheading' | 'body' | 'caption';

type TextConfig = {
  base: TextStyle;
  hero: TextStyle;
  heading: TextStyle;
  subheading: TextStyle;
  body: TextStyle;
  caption: TextStyle;
};

function useThemedText(variant: Variant) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return { theme, styles, variant };
}

function createStyles(theme: SimpleGovTheme): TextConfig {
  const { typography, colors } = theme;

  return StyleSheet.create<TextConfig>({
    base: {
      fontFamily: typography.fontFamily,
      color: colors.textPrimary
    },
    hero: {
      fontSize: typography.sizes.hero,
      fontWeight: typography.weightBold as any,
      lineHeight: typography.sizes.hero * 1.1
    },
    heading: {
      fontSize: typography.sizes.xl,
      fontWeight: typography.weightBold as any,
      lineHeight: typography.sizes.xl * 1.2
    },
    subheading: {
      fontSize: typography.sizes.lg,
      fontWeight: typography.weightSemibold as any,
      color: colors.textSecondary,
      lineHeight: typography.sizes.lg * 1.3
    },
    body: {
      fontSize: typography.sizes.md,
      color: colors.textSecondary,
      lineHeight: typography.sizes.md * 1.5
    },
    caption: {
      fontSize: typography.sizes.xs,
      color: colors.muted
    }
  });
}

