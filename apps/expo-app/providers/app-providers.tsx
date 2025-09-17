import { PropsWithChildren, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@simplegov/ui';
import { SupabaseProvider } from './supabase-provider';

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SupabaseProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </ThemeProvider>
    </SupabaseProvider>
  );
}
