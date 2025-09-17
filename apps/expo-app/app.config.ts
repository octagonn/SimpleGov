import 'dotenv/config';
import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'SimpleGov',
  slug: 'simplegov',
  version: '0.1.0',
  orientation: 'portrait',
  scheme: 'simplegov',
  platforms: ['ios', 'android', 'web'],
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#0A0A0A'
  },
  updates: {
    fallbackToCacheTimeout: 0
  },
  assets: ['./assets/fonts/'],
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://ebsusosjzpasoovixtud.supabase.co',
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVic3Vzb3NqenBhc29vdml4dHVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNDgwNDcsImV4cCI6MjA3MzYyNDA0N30.5hwR_uZXa9Q48Rj4DtAbEpU35uqjcxPoYCRB-gSs1Ts'
  }
};

export default config;
