// supabase.js - Standalone authentication for demo
import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper function to validate UMich email format
export const isUMichEmail = (email) => {
  const umichRegex = /^[a-zA-Z0-9._%+-]+@umich\.edu$/;
  return umichRegex.test(email);
};

// Mock user storage key
const MOCK_USER_KEY = 'michigan_eaters_user';

// Standalone authentication functions for demo
export const signInWithEmail = async (email) => {
  if (!isUMichEmail(email)) {
    throw new Error('Please use a valid University of Michigan email address (user@umich.edu)');
  }
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Create a mock user object
  const mockUser = {
    id: Date.now().toString(),
    email: email,
    created_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
  };
  
  // Store user in AsyncStorage
  await AsyncStorage.setItem(MOCK_USER_KEY, JSON.stringify(mockUser));
  
  return { user: mockUser };
};

export const signOut = async () => {
  await AsyncStorage.removeItem(MOCK_USER_KEY);
};

export const getCurrentUser = async () => {
  try {
    const userData = await AsyncStorage.getItem(MOCK_USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const onAuthStateChange = (callback) => {
  // For the standalone version, we'll use a simple interval to check for auth changes
  let lastUser = null;
  
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
  
  // Check immediately
  checkAuthState();
  
  // Check every second
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