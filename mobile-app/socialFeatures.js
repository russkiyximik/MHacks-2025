// socialFeatures.js - Local storage for favorites and social features
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUser } from './supabase';

// Storage keys
const FAVORITES_KEY = 'jara_favorites';
const CHAT_KEY = 'jara_chat';
const CHAT_DATE_KEY = 'jara_chat_date';

// Favorites functionality
export const addToFavorites = async (foodItem, diningHall, station) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const favoritesData = await AsyncStorage.getItem(FAVORITES_KEY);
    const favorites = favoritesData ? JSON.parse(favoritesData) : {};
    
    if (!favorites[user.id]) {
      favorites[user.id] = [];
    }
    
    const favoriteItem = {
      id: Date.now().toString(),
      name: foodItem.name,
      diningHall: diningHall,
      station: station,
      nutrition: foodItem.nutrition,
      allergens: foodItem.allergens,
      dietary_tags: foodItem.dietary_tags,
      addedAt: new Date().toISOString(),
    };
    
    // Check if already in favorites
    const exists = favorites[user.id].some(fav => 
      fav.name === foodItem.name && fav.diningHall === diningHall
    );
    
    if (!exists) {
      favorites[user.id].push(favoriteItem);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }
    
    return !exists;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return false;
  }
};

export const removeFromFavorites = async (foodItem, diningHall) => {
  try {
    const user = await getCurrentUser();
    if (!user) return false;

    const favoritesData = await AsyncStorage.getItem(FAVORITES_KEY);
    const favorites = favoritesData ? JSON.parse(favoritesData) : {};
    
    if (favorites[user.id]) {
      favorites[user.id] = favorites[user.id].filter(fav => 
        !(fav.name === foodItem.name && fav.diningHall === diningHall)
      );
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }
    
    return true;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return false;
  }
};

export const getUserFavorites = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const favoritesData = await AsyncStorage.getItem(FAVORITES_KEY);
    const favorites = favoritesData ? JSON.parse(favoritesData) : {};
    
    return favorites[user.id] || [];
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
};

export const isFavorite = async (foodItem, diningHall) => {
  try {
    const favorites = await getUserFavorites();
    return favorites.some(fav => 
      fav.name === foodItem.name && fav.diningHall === diningHall
    );
  } catch (error) {
    return false;
  }
};

export const toggleFavorite = async (foodItem, diningHall, station) => {
  try {
    const isCurrentlyFavorite = await isFavorite(foodItem, diningHall);
    
    if (isCurrentlyFavorite) {
      await removeFromFavorites(foodItem, diningHall);
      return false; // No longer favorite
    } else {
      await addToFavorites(foodItem, diningHall, station);
      return true; // Now favorite
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return false;
  }
};

// Mock users for chat demo
const MOCK_USERS = [
  { id: '1', email: 'alice@umich.edu', name: 'Alice Johnson' },
  { id: '2', email: 'bob@umich.edu', name: 'Bob Smith' },
  { id: '3', email: 'charlie@umich.edu', name: 'Charlie Brown' },
  { id: '4', email: 'diana@umich.edu', name: 'Diana Lee' },
  { id: '5', email: 'ethan@umich.edu', name: 'Ethan Davis' },
  { id: '6', email: 'fiona@umich.edu', name: 'Fiona Wilson' },
];

// Sample messages for demo
const SAMPLE_MESSAGES = [
  "The food at Markley is amazing today! 🍽️",
  "Anyone know what time North Quad closes?",
  "The pizza at South Quad is really good right now",
  "Bursley has fresh sushi today! 🍣",
  "The salad bar at East Quad looks great",
  "Hill dining hall has the best desserts",
  "Just tried the new sandwich at West Quad - highly recommend!",
  "The stir fry at Mosher-Jordan is perfect today",
  "Oxford has really good pasta today 🍝",
  "The grill station at Stockwell is on point!",
];

// Helper function to get today's date string
const getTodayDateString = () => {
  return new Date().toDateString();
};

// Helper function to check if we need to reset chat (new day)
const shouldResetChat = async () => {
  try {
    const lastChatDate = await AsyncStorage.getItem(CHAT_DATE_KEY);
    const today = getTodayDateString();
    return lastChatDate !== today;
  } catch (error) {
    console.error('Error checking chat date:', error);
    return true;
  }
};

// Initialize chat with sample messages for new day
const initializeDailyChat = async () => {
  try {
    const today = getTodayDateString();
    
    // Create sample messages from mock users
    const initialMessages = [];
    const numMessages = Math.floor(Math.random() * 5) + 3; // 3-7 initial messages
    
    for (let i = 0; i < numMessages; i++) {
      const randomUser = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
      const randomMessage = SAMPLE_MESSAGES[Math.floor(Math.random() * SAMPLE_MESSAGES.length)];
      const randomTime = new Date(Date.now() - Math.random() * 3600000 * 12); // Random time in last 12 hours
      
      initialMessages.push({
        id: `mock_${Date.now()}_${i}`,
        message: randomMessage,
        userId: randomUser.id,
        userEmail: randomUser.email,
        userName: randomUser.name,
        timestamp: randomTime.toISOString(),
        isCurrentUser: false,
      });
    }
    
    // Sort messages by timestamp
    initialMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    await AsyncStorage.setItem(CHAT_KEY, JSON.stringify(initialMessages));
    await AsyncStorage.setItem(CHAT_DATE_KEY, today);
    
    return initialMessages;
  } catch (error) {
    console.error('Error initializing daily chat:', error);
    return [];
  }
};

// Get all chat messages for today
export const getChatMessages = async () => {
  try {
    // Check if we need to reset chat for new day
    if (await shouldResetChat()) {
      return await initializeDailyChat();
    }
    
    const chatData = await AsyncStorage.getItem(CHAT_KEY);
    return chatData ? JSON.parse(chatData) : [];
  } catch (error) {
    console.error('Error getting chat messages:', error);
    return [];
  }
};

// Send a new chat message
export const sendChatMessage = async (message) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
    const currentMessages = await getChatMessages();
    
    // Extract first name from email for display
    const userName = user.email.split('@')[0];
    
    const newMessage = {
      id: `${user.id}_${Date.now()}`,
      message: message.trim(),
      userId: user.id,
      userEmail: user.email,
      userName: userName,
      timestamp: new Date().toISOString(),
      isCurrentUser: true,
    };
    
    const updatedMessages = [...currentMessages, newMessage];
    await AsyncStorage.setItem(CHAT_KEY, JSON.stringify(updatedMessages));
    
    // Simulate other users sending messages occasionally (for demo)
    setTimeout(() => {
      simulateRandomMessage();
    }, Math.random() * 30000 + 10000); // Random delay 10-40 seconds
    
    return newMessage;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};

// Simulate a random message from a mock user (for demo purposes)
const simulateRandomMessage = async () => {
  try {
    const currentMessages = await getChatMessages();
    const randomUser = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
    const randomMessage = SAMPLE_MESSAGES[Math.floor(Math.random() * SAMPLE_MESSAGES.length)];
    
    // Don't duplicate recent messages
    const recentMessages = currentMessages.slice(-5);
    const isDuplicate = recentMessages.some(msg => msg.message === randomMessage);
    if (isDuplicate) return;
    
    const mockMessage = {
      id: `mock_${Date.now()}_${Math.random()}`,
      message: randomMessage,
      userId: randomUser.id,
      userEmail: randomUser.email,
      userName: randomUser.name,
      timestamp: new Date().toISOString(),
      isCurrentUser: false,
    };
    
    const updatedMessages = [...currentMessages, mockMessage];
    await AsyncStorage.setItem(CHAT_KEY, JSON.stringify(updatedMessages));
  } catch (error) {
    console.error('Error simulating random message:', error);
  }
};

// Delete a message (only current user's messages)
export const deleteChatMessage = async (messageId) => {
  try {
    const user = await getCurrentUser();
    if (!user) return false;
    
    const currentMessages = await getChatMessages();
    const updatedMessages = currentMessages.filter(msg => 
      !(msg.id === messageId && msg.userId === user.id)
    );
    
    await AsyncStorage.setItem(CHAT_KEY, JSON.stringify(updatedMessages));
    return true;
  } catch (error) {
    console.error('Error deleting chat message:', error);
    return false;
  }
};