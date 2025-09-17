import { createContext, PropsWithChildren, useContext } from 'react';
import { supabase as sharedClient } from '@simplegov/lib/supabase-client';

const SupabaseContext = createContext(sharedClient);

export function SupabaseProvider({ children }: PropsWithChildren) {
  return <SupabaseContext.Provider value={sharedClient}>{children}</SupabaseContext.Provider>;
}

export function useSupabase() {
  return useContext(SupabaseContext);
}
