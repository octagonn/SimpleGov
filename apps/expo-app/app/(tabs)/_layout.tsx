import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '@simplegov/ui';

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.muted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          paddingTop: theme.spacing.xs,
          paddingBottom: theme.spacing.xs + 2,
          height: 60
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500'
        },
        tabBarIcon: ({ color, size }) => {
          const iconName = getTabIcon(route.name);
          return <Ionicons name={iconName} color={color} size={size} />;
        }
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="search" options={{ title: 'Search' }} />
      <Tabs.Screen name="hub" options={{ title: 'Hub' }} />
      <Tabs.Screen name="officials" options={{ title: 'Officials' }} />
      <Tabs.Screen name="account" options={{ title: 'Account' }} />
    </Tabs>
  );
}

function getTabIcon(routeName: string) {
  switch (routeName) {
    case 'index':
      return 'home-outline';
    case 'search':
      return 'search-outline';
    case 'hub':
      return 'grid-outline';
    case 'officials':
      return 'people-circle-outline';
    case 'account':
      return 'person-outline';
    default:
      return 'ellipse-outline';
  }
}
