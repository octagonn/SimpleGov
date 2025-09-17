import { ReactNode, useMemo } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { SimpleGovTheme, useTheme } from '../theme';

export type SectionProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Section({ title, subtitle, children, style }: SectionProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

function createStyles(theme: SimpleGovTheme) {
  const { colors, spacing, radii, typography } = theme;
  return StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: radii.lg,
      padding: spacing.lg,
      gap: spacing.sm
    },
    title: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weightSemibold as any,
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: theme.mode === 'dark' ? colors.muted : colors.textSecondary
    },
    subtitle: {
      fontSize: typography.sizes.md,
      color: colors.textSecondary
    },
    content: {
      gap: spacing.sm
    }
  });
}
