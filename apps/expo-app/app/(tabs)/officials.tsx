import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Body, Screen, Section, Subheading, useTheme } from '@simplegov/ui';
import { useSupabase } from '../../providers/supabase-provider';

type OfficialRecord = {
  id: string;
  name: string;
  title: string | null;
  org_id: string | null;
  metadata: Record<string, unknown> | null;
};

export default function OfficialsScreen() {
  const theme = useTheme();
  const supabase = useSupabase();

  const officials = useQuery<OfficialRecord[]>({
    queryKey: ['officials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('officials')
        .select('id,name,title,org_id,metadata')
        .order('name', { ascending: true })
        .limit(50);

      if (error) {
        throw error;
      }

      return (data as OfficialRecord[]) ?? [];
    }
  });

  const content = useMemo(() => {
    if (officials.isLoading) {
      return <Body>Loading officials...</Body>;
    }

    if (officials.isError) {
      return <Body>Unable to load officials yet. Add records to the `officials` table to preview profiles.</Body>;
    }

    if (!officials.data || officials.data.length === 0) {
      return <Body>No officials captured yet. Once ingestion populates officials, they will appear here.</Body>;
    }

    return officials.data.map((official) => (
      <View key={official.id} style={[styles.officialRow, { borderColor: theme.colors.border }]}> 
        <View style={[styles.avatar, { backgroundColor: theme.colors.surfaceAlt }]} />
        <View style={styles.officialText}>
          <Subheading>{official.name}</Subheading>
          <Body>{official.title ?? 'Role pending'}</Body>
        </View>
      </View>
    ));
  }, [officials.data, officials.error, officials.isError, officials.isLoading, theme.colors.border, theme.colors.surfaceAlt]);

  return (
    <Screen padded={false}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.xl,
          paddingVertical: theme.spacing.xl,
          gap: theme.spacing.lg
        }}
      >
        <Section title="Officials" subtitle="Approval insights and recent activity">
          {content}
        </Section>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  officialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    gap: 16
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26
  },
  officialText: {
    flex: 1,
    gap: 4
  }
});
