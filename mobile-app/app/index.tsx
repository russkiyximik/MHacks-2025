import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from './context/AuthContext';

/**
 * The root index route decides whether to send the user to the login screen
 * or the home screen. It uses the `useAuth` hook to read the current user
 * from context. While the user state is loading, nothing is rendered.
 */
export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    // Optionally you could show a splash screen or loader here
    return null;
  }

  // If the user is logged in redirect to the home page, otherwise go to login
  return <Redirect href={user ? '/home' : '/login'} />;
}