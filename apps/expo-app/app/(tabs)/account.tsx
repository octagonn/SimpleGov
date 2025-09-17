import { ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useState } from 'react';
import { Body, Screen, Section, Subheading, useTheme } from '@simplegov/ui';

export default function AccountScreen() {
  const theme = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [analyticsOptIn, setAnalyticsOptIn] = useState(false);

  return (
    <Screen padded={false}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.xl,
          paddingVertical: theme.spacing.xl,
          gap: theme.spacing.lg
        }}
      >
        <Section title="Profile snapshot">
          <Subheading>Preference capture</Subheading>
          <Body>Complete onboarding to tailor your policy feed and official recommendations.</Body>
        </Section>

        <Section title="Notifications">
          <Row label="Email alerts" value={notifications} onChange={setNotifications} />
          <Row label="Analytics opt-in" value={analyticsOptIn} onChange={setAnalyticsOptIn} />
        </Section>

        <Section title="Data">
          <Body>- Export my saved documents (coming soon)</Body>
          <Body>- Manage privacy and data retention settings</Body>
          <Body>- Contact support</Body>
        </Section>
      </ScrollView>
    </Screen>
  );
}

type RowProps = {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
};

function Row({ label, value, onChange }: RowProps) {
  const theme = useTheme();
  return (
    <View style={[styles.row, { borderColor: theme.colors.border }]}> 
      <Body>{label}</Body>
      <Switch value={value} onValueChange={onChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1
  }
});
