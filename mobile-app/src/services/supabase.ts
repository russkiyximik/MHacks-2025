import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Representation of a user object in the demo auth system. The `id` and
 * `email` fields are required; additional fields may be added in the
 * future as needed.
 */
export interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string;
}

export interface Session {
  user: User | null;
}

/**
 * Validates that an email belongs to the University of Michigan domain. The
 * regex only accepts addresses ending in `@umich.edu`.
 */
export const isUMichEmail = (email: string): boolean => {
  const umichRegex = /^[a-zA-Z0-9._%+-]+@umich\.edu$/;
  return umichRegex.test(email);
};

// Storage key used for persisting the mock user in AsyncStorage
const MOCK_USER_KEY = 'michigan_eaters_user';

/**
 * Mock sign in function. It performs basic validation of the provided
 * email address and then creates a fake user record. In a real app
 * this would call out to Supabase or another backend service.
 */
export const signInWithEmail = async (email: string): Promise<{ user: User }> => {
  if (!isUMichEmail(email)) {
    throw new Error('Please use a valid University of Michigan email address (user@umich.edu)');
  }

  // Simulate a network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const mockUser: User = {
    id: Date.now().toString(),
    email: email,
    created_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
  };

  await AsyncStorage.setItem(MOCK_USER_KEY, JSON.stringify(mockUser));
  return { user: mockUser };
};

/**
 * Removes the currently authenticated user from storage. In a real app
 * this would call the backend's sign out function.
 */
export const signOut = async (): Promise<void> => {
  await AsyncStorage.removeItem(MOCK_USER_KEY);
};

/**
 * Reads the current user from AsyncStorage. Returns null if no user
 * is stored or if an error occurs.
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const userData = await AsyncStorage.getItem(MOCK_USER_KEY);
    return userData ? (JSON.parse(userData) as User) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Listens for changes to the auth state. The demo implementation polls
 * AsyncStorage every second to detect changes. In production you would
 * subscribe to Supabase's auth changes instead.
 */
export const onAuthStateChange = (
  callback: (event: 'SIGNED_IN' | 'SIGNED_OUT', session: Session | null) => void,
) => {
  let lastUser: User | null = null;

  const checkAuthState = async () => {
    try {
      const currentUser = await getCurrentUser();
      const currentUserString = JSON.stringify(currentUser);
      const lastUserString = JSON.stringify(lastUser);

      if (currentUserString !== lastUserString) {
        lastUser = currentUser;
        const event = currentUser ? 'SIGNED_IN' : 'SIGNED_OUT';
        const session = currentUser ? { user: currentUser } : null;
        callback(event, session);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    }
  };

  // Immediately check on subscription
  checkAuthState();
  const interval = setInterval(checkAuthState, 1000);
  return {
    data: {
      subscription: {
        unsubscribe: () => {
          clearInterval(interval);
        },
      },
    },
  };
};