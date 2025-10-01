import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getCurrentUser, onAuthStateChange, signOut as supabaseSignOut, User } from '../../src/services/supabase';

// Define the shape of our context so that components consuming it get
// proper type information for the user and loading state.
interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Hook to consume the authentication context. Throws an error if the hook
 * is used outside of an `AuthProvider` so that misuse is caught early.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Provides authentication state to descendant components. The provider
 * subscribes to changes in the supabase auth state and updates the
 * current user accordingly. It exposes a `signOut` method which logs
 * the user out and clears the stored user.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load the currently authenticated user on mount
    getCurrentUser()
      .then((u) => {
        setUser(u);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });

    // Subscribe to auth changes from supabase. When the user logs in or out
    // this callback will be invoked and we update local state accordingly.
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Clean up the subscription on unmount
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabaseSignOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
};