import Constants from 'expo-constants';

/**
 * Base URL for the backend API. The value is resolved from the environment
 * via the EXPO_PUBLIC_API_BASE_URL variable, falling back to any `extra`
 * configuration defined in app.json. This allows the same code to run on
 * both web and native without hardcoding URLs.
 */
export const API_BASE_URL: string =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  ((Constants as any).expoConfig?.extra?.API_BASE_URL as string) ||
  '';