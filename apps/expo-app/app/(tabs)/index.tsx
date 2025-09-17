import { ScrollView, StyleSheet, View } from 'react-native';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Body,
  DocumentCard,
  HeroTitle,
  Screen,
  Section,
  Subheading,
  useTheme
} from '@simplegov/ui';
import { useSupabase } from '../../providers/supabase-provider';

const NEXT_STEPS = [
  'Hook up onboarding to collect user preferences',
  'Implement For You feed using personalization ranks',
  'Polish search filters (categories, recency)',
  'Ship official profiles with approval voting'
];

type FeedDocument = {
  id: string;
  title: string;
  summary: string | null;
  categories: string[] | null;
  source: string | null;
  published_at: string | null;
};

export default function HomeScreen() {
  const theme = useTheme();
  const supabase = useSupabase();

  const feedQuery = useQuery<FeedDocument[]>({
    queryKey: ['documents', 'home-feed'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('id,title,summary,categories,source,published_at')
        .eq('visibility', 'public')
        .order('published_at', { ascending: false })
        .limit(20);

      if (error) {
        throw error;
      }

      return (data as FeedDocument[]) ?? [];
    }
  });

  const feedState = useMemo(() => {
    if (feedQuery.isLoading) {
      return { state: 'loading' as const };
    }
    if (feedQuery.isError) {
      return { state: 'error' as const, message: getFriendlyError(feedQuery.error) };
    }

    const docs = feedQuery.data ?? [];
    return { state: 'ready' as const, documents: docs };
  }, [feedQuery.data, feedQuery.error, feedQuery.isError, feedQuery.isLoading]);

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={[styles.scrollContainer, { gap: theme.spacing.lg }]}> 
        <View style={[styles.hero, { backgroundColor: theme.colors.surface }]}> 
          <HeroTitle>SimpleGov</HeroTitle>
          <Subheading>MVP delivery tracker</Subheading>
          <Body>
            {feedState.state === 'error'
              ? feedState.message
              : feedState.state === 'loading'
              ? 'Loading latest activity...'
              : 'Latest activity pulled from Supabase and personalized for your policy interests.'}
          </Body>
        </View>

        {feedState.state === 'ready' && feedState.documents.length > 0 ? (
          <Section title="Latest documents" subtitle="Recently ingested government releases">
            {feedState.documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                title={doc.title}
                summary={doc.summary ?? 'Summary forthcoming'}
                source={doc.source ?? 'Unknown Source'}
                categories={doc.categories ?? undefined}
                publishedAt={formatRelativeDate(doc.published_at)}
              />
            ))}
          </Section>
        ) : null}

        <Section title="Next build steps">
          {NEXT_STEPS.map((item) => (
            <Body key={item}>
              - {item}
            </Body>
          ))}
        </Section>
      </ScrollView>
    </Screen>
  );
}

function getFriendlyError(error: unknown) {
  if (typeof error === 'object' && error !== null) {
    const message = (error as { message?: string }).message ?? '';
    if (message.includes('schema cache') || message.includes('does not exist')) {
      return 'Supabase configuration needed: run the schema migration or refresh the Supabase project tables.';
    }
    return message || 'Unable to load documents from Supabase.';
  }

  return 'Unable to load documents from Supabase.';
}

function formatRelativeDate(value: string | null) {
  if (!value) {
    return 'Unknown date';
  }

  const published = new Date(value);
  const now = new Date();
  const diffMs = now.getTime() - published.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (Number.isNaN(diffDays)) {
    return 'Recently';
  }

  if (diffDays <= 0) {
    return 'Today';
  }

  if (diffDays === 1) {
    return 'Yesterday';
  }

  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }

  return published.toLocaleDateString();
}

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 24
  },
  hero: {
    borderRadius: 18,
    padding: 24,
    gap: 12
  }
});


