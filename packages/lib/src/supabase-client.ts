import { createClient } from '@supabase/supabase-js';

let nativeStorage: any;
if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
  try {
    nativeStorage = require('@react-native-async-storage/async-storage').default;
  } catch (error) {
    console.warn('AsyncStorage not available; Supabase sessions will not persist across launches.');
  }
}

type ClientConfig = {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  storage?: any;
};

function resolveConfig(overrides: ClientConfig = {}) {
  const supabaseUrl =
    overrides.supabaseUrl ??
    process.env.EXPO_PUBLIC_SUPABASE_URL ??
    process.env.SIMPLEGOV_SUPABASE_URL ??
    process.env.SUPABASE_URL ??
    'https://ebsusosjzpasoovixtud.supabase.co';
  const supabaseAnonKey =
    overrides.supabaseAnonKey ??
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVic3Vzb3NqenBhc29vdml4dHVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNDgwNDcsImV4cCI6MjA3MzYyNDA0N30.5hwR_uZXa9Q48Rj4DtAbEpU35uqjcxPoYCRB-gSs1Ts';

  const storage = overrides.storage ?? nativeStorage;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      'Supabase client missing configuration. Update EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to enable API calls.'
    );
  }

  return { supabaseUrl, supabaseAnonKey, storage };
}

export const supabase = (() => {
  const { supabaseUrl, supabaseAnonKey, storage } = resolveConfig();
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      storageKey: 'simplegov.session',
      storage: storage ?? undefined
    }
  });
})();

export function createSupabaseClient(overrides: ClientConfig = {}) {
  const { supabaseUrl, supabaseAnonKey, storage } = resolveConfig(overrides);
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase configuration is required to instantiate a client.');
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      storageKey: 'simplegov.server.session',
      storage: storage ?? undefined
    }
  });
}

export * from '@supabase/supabase-js';
