import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProviders } from '../providers/app-providers';
import { useTheme } from '@simplegov/ui';

function ThemedStatusBar() {
  const theme = useTheme();
  return <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />;
}

export default function RootLayout() {
  return (
    <AppProviders>
      <ThemedStatusBar />
      <Stack screenOptions={{ headerShown: false }} />
    </AppProviders>
  );
}
