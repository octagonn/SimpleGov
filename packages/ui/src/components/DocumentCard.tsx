import { ReactNode, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SimpleGovTheme, useTheme } from '../theme';

type DocumentCardProps = {
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  categories?: string[];
  actions?: ReactNode;
  onPress?: () => void;
};

export function DocumentCard({
  title,
  summary,
  source,
  publishedAt,
  categories,
  actions,
  onPress
}: DocumentCardProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const Container = onPress ? Pressable : View;

  return (
    <Container style={styles.card} onPress={onPress} accessibilityRole={onPress ? 'button' : undefined}>
      <Text style={styles.source}>{source.toUpperCase()}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.summary}>{summary}</Text>

      {categories && categories.length > 0 && (
        <View style={styles.tagRow}>
          {categories.slice(0, 3).map((category) => (
            <View key={category} style={styles.tag}>
              <Text style={styles.tagText}>{category}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.dateLabel}>{publishedAt}</Text>
        {actions}
      </View>
    </Container>
  );
}

function createStyles(theme: SimpleGovTheme) {
  const { colors, spacing, typography, radii } = theme;
  return StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: radii.lg,
      padding: spacing.lg,
      gap: spacing.sm
    },
    source: {
      fontSize: typography.sizes.xs,
      letterSpacing: 1,
      color: colors.muted
    },
    title: {
      fontSize: typography.sizes.lg,
      fontWeight: typography.weightBold as any,
      color: colors.textPrimary
    },
    summary: {
      fontSize: typography.sizes.md,
      lineHeight: typography.sizes.md * 1.4,
      color: colors.textSecondary
    },
    tagRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs
    },
    tag: {
      backgroundColor: colors.surfaceAlt,
      borderRadius: radii.sm,
      paddingHorizontal: spacing.xs,
      paddingVertical: spacing.xxs
    },
    tagText: {
      fontSize: typography.sizes.xs,
      color: colors.muted,
      fontWeight: typography.weightMedium as any
    },
    footer: {
      marginTop: spacing.xs,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    dateLabel: {
      fontSize: typography.sizes.xs,
      color: colors.muted
    }
  });
}

