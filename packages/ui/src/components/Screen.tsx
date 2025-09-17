import { ReactNode } from 'react';
import { SafeAreaView, SafeAreaViewProps, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../theme';

type ScreenProps = SafeAreaViewProps & {
  children: ReactNode;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Screen({ children, padded = true, style, ...rest }: ScreenProps) {
  const theme = useTheme();
  const paddingStyle = padded
    ? {
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.lg
      }
    : null;

  return (
    <SafeAreaView
      style={[styles.base, { backgroundColor: theme.colors.background }, paddingStyle, style]}
      {...rest}
    >
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1
  }
});
