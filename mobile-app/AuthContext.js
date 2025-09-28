// AuthContext.js - Authentication context and provider
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, onAuthStateChange, signOut } from './supabase';

const AuthContext = createContext({
  user: null,
  loading: true,
  signOut: () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    getCurrentUser()
      .then((user) => {
        setUser(user);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error getting user:', error);
        setUser(null);
        setLoading(false);
      });

    // Listen for auth state changes
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    loading,
    signOut: handleSignOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};