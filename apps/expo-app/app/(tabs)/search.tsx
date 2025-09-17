import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Body, DocumentCard, Screen, Section, Subheading, useTheme } from '@simplegov/ui';
import { useQuery } from '@tanstack/react-query';
import { useSupabase } from '../../providers/supabase-provider';

type SearchDocument = {
  id: string;
  title: string;
  summary: string | null;
  categories: string[] | null;
  source: string | null;
  published_at: string | null;
};

const CATEGORY_FILTERS = ['All', 'Policy', 'Finance', 'Environment', 'Civil Rights'];

export default function SearchScreen() {
  const theme = useTheme();
  const supabase = useSupabase();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const results = useQuery({
    queryKey: ['search-documents', query, activeCategory],
    queryFn: async (): Promise<SearchDocument[]> => {
      if (!query.trim()) {
        return [];
      }

      let request = supabase
        .from('documents')
        .select('id,title,summary,categories,source,published_at')
        .ilike('title', `%${query}%`)
        .order('published_at', { ascending: false })
        .limit(15);

      if (activeCategory !== 'All') {
        request = request.contains('categories', `["${activeCategory}"]`);
      }

      const { data, error } = await request;
      if (error) {
        throw error;
      }

      return (data as SearchDocument[]) ?? [];
    },
    enabled: query.trim().length > 0
  });

  const showEmptyState = query.trim().length > 0 && results.data?.length === 0 && !results.isLoading;

  return (
    <Screen padded={false}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.xl,
          paddingVertical: theme.spacing.xl,
          gap: theme.spacing.lg
        }}
      >
        <View style={styles.fieldBlock}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search documents, agencies, or topics"
            placeholderTextColor={theme.colors.muted}
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                color: theme.colors.textPrimary,
                borderColor: theme.colors.border
              }
            ]}
          />
          <Body>Try keywords like "climate", "appropriations", or "education".</Body>
        </View>

        <View style={styles.filterRow}>
          {CATEGORY_FILTERS.map((filter) => {
            const isActive = activeCategory === filter;
            return (
              <Pressable
                key={filter}
                onPress={() => setActiveCategory(filter)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isActive ? theme.colors.accent : theme.colors.surface,
                    borderColor: isActive ? theme.colors.accent : theme.colors.border
                  }
                ]}
              >
                <Body style={{ color: isActive ? '#FFFFFF' : theme.colors.textSecondary }}>{filter}</Body>
              </Pressable>
            );
          })}
        </View>

        {results.isError ? (
          <Section title="Search error">
            <Body>We could not search documents. Double-check your Supabase schema and try again.</Body>
          </Section>
        ) : null}

        {results.isLoading ? (
          <Section title="Searching">
            <Body>Looking up relevant documents...</Body>
          </Section>
        ) : null}

        {showEmptyState ? (
          <Section title="No results">
            <Body>No documents matched that query yet. Try a simpler keyword or different category.</Body>
          </Section>
        ) : null}

        {results.data && results.data.length > 0 ? (
          <Section title="Results">
            {results.data.map((doc) => (
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
      </ScrollView>
    </Screen>
  );
}

function formatRelativeDate(value: string | null) {
  if (!value) {
    return 'Unknown date';
  }

  const date = new Date(value);
  return date.toLocaleDateString();
}

const styles = StyleSheet.create({
  fieldBlock: {
    gap: 12
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    fontSize: 16
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8
  }
});