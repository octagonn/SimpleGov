import { ScrollView, StyleSheet, View } from 'react-native';
import { Body, Screen, Section, Subheading, useTheme } from '@simplegov/ui';

const HUB_SECTIONS = [
  {
    title: 'Agencies spotlight',
    description: 'Track top federal agencies you follow for rule updates.',
    items: ['Department of Justice', 'Department of Education', 'Environmental Protection Agency']
  },
  {
    title: 'Committees on watch',
    description: 'See committees aligned with your saved interests.',
    items: ['House Judiciary Committee', 'Senate Finance Committee', 'House Energy & Commerce']
  },
  {
    title: 'Issue collections',
    description: 'Curated bundles of documents for rapid catch-up.',
    items: ['Climate and resilience', 'Privacy and consumer protection', 'Budget & appropriations']
  }
];

export default function HubScreen() {
  const theme = useTheme();

  return (
    <Screen padded={false}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.xl,
          paddingVertical: theme.spacing.xl,
          gap: theme.spacing.lg
        }}
      >
        <View style={styles.header}>
          <Subheading>Personalize your civic hub</Subheading>
          <Body>
            Surface the agencies, committees, and topics that matter most. Collections will adapt once you begin saving
            documents.
          </Body>
        </View>

        {HUB_SECTIONS.map((section) => (
          <Section key={section.title} title={section.title} subtitle={section.description}>
            {section.items.map((item) => (
              <Body key={item}>- {item}</Body>
            ))}
          </Section>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 12
  }
});
