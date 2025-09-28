// App.js - Main React Native App
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  RefreshControl,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';

import { AuthProvider, useAuth } from './AuthContext';
import LoginScreen from './LoginScreen';
import { 
  getUserFavorites, 
  toggleFavorite, 
  isFavorite, 
  getChatMessages, 
  sendChatMessage, 
  deleteChatMessage,
  toggleMessageLike,
  getLikesForMessage,
  hasUserLikedMessage,
  initializeMockLikes
} from './socialFeatures';
import { getCurrentUser } from './supabase';
import realMenuData from './menu_data.json';



/* Mock data for demo - in real app this would come from your scraped JSON
const mockMenuData = {
  "last_updated": "2025-09-27 20:30:00",
  "halls": {
    "Bursley": {
      "name": "Bursley",
      "stations": {
        "Grill": [
          {
            "name": "Grilled Chicken Breast",
            "nutrition": {
              "calories": 284,
              "protein_g": 53.4,
              "total_carbs_g": 0,
              "total_fat_g": 6.2,
              "fiber_g": 0,
              "sodium_mg": 320,
              "has_nutrition_data": true,
              "serving_size": "6 oz (170g)"
            },
            "allergens": [],
            "dietary_tags": ["High Protein", "Low Carbon Footprint"]
          },
          {
            "name": "Turkey Burger",
            "nutrition": {
              "calories": 390,
              "protein_g": 28,
              "total_carbs_g": 32,
              "total_fat_g": 18,
              "fiber_g": 3,
              "sodium_mg": 680,
              "has_nutrition_data": true,
              "serving_size": "1 burger (180g)"
            },
            "allergens": ["wheat/barley/rye"],
            "dietary_tags": ["High Protein"]
          }
        ],
        "Wild Fire Maize": [
          {
            "name": "Stew Beef Poutine",
            "nutrition": {
              "calories": 338,
              "protein_g": 9,
              "total_carbs_g": 11,
              "total_fat_g": 29,
              "fiber_g": 1,
              "sodium_mg": 237,
              "has_nutrition_data": true,
              "serving_size": "1/2 Cup (105g)"
            },
            "allergens": ["beef", "milk"],
            "dietary_tags": ["Halal", "High Carbon Footprint"]
          },
          {
            "name": "Criss Cross Fries",
            "nutrition": {
              "calories": 272,
              "protein_g": 1,
              "total_carbs_g": 23,
              "total_fat_g": 20,
              "fiber_g": 1,
              "sodium_mg": 27,
              "has_nutrition_data": true,
              "serving_size": "1/2 Cup (113g)"
            },
            "allergens": ["item is deep fried"],
            "dietary_tags": ["Vegan", "Low Carbon Footprint"]
          }
        ],
        "MBakery": [
          {
            "name": "Red Velvet Cake",
            "nutrition": {
              "calories": 359,
              "protein_g": 4,
              "total_carbs_g": 46,
              "total_fat_g": 18,
              "fiber_g": 1,
              "sodium_mg": 394,
              "has_nutrition_data": true,
              "serving_size": "Slice (94g)"
            },
            "allergens": ["eggs", "milk", "soy", "wheat/barley/rye"],
            "dietary_tags": ["Vegetarian", "Medium Carbon Footprint"]
          }
        ]
      },
      "item_count": 5,
      "items_with_nutrition": 5
    },
    "South Quad": {
      "name": "South Quad", 
      "stations": {
        "Global Kitchen": [
          {
            "name": "Chicken Tikka Masala",
            "nutrition": {
              "calories": 420,
              "protein_g": 35,
              "total_carbs_g": 12,
              "total_fat_g": 26,
              "fiber_g": 2,
              "sodium_mg": 890,
              "has_nutrition_data": true,
              "serving_size": "1 cup (240g)"
            },
            "allergens": ["milk"],
            "dietary_tags": ["Spicy", "High Protein", "Halal"]
          }
        ],
        "Pizza Station": [
          {
            "name": "Cheese Pizza",
            "nutrition": {
              "calories": 285,
              "protein_g": 12,
              "total_carbs_g": 36,
              "total_fat_g": 10,
              "fiber_g": 2,
              "sodium_mg": 640,
              "has_nutrition_data": true,
              "serving_size": "1 slice (107g)"
            },
            "allergens": ["milk", "wheat/barley/rye"],
            "dietary_tags": ["Vegetarian"]
          }
        ]
      },
      "item_count": 2,
      "items_with_nutrition": 2
    }
  },
  "summary": {
    "total_halls": 2,
    "total_items": 7,
    "items_with_nutrition": 7,
    "nutrition_coverage": "7/7 (100%)"
  }
};

*/

// Components
const MacroCard = ({ label, value, unit, color = '#007AFF' }) => (
  <View style={[styles.macroCard, { borderTopColor: color }]}>
    <Text style={[styles.macroValue, { color }]}>{value || 0}{unit}</Text>
    <Text style={styles.macroLabel}>{label}</Text>
  </View>
);

const FoodItem = ({ item, onPress, isSelected, isFavorited, onToggleFavorite, diningHall, station }) => (
  <TouchableOpacity 
    style={[styles.foodItem, isSelected && styles.selectedFoodItem]} 
    onPress={() => onPress(item)}
  >
    <View style={styles.foodHeader}>
      <Text style={styles.foodName}>{item.name}</Text>
      <View style={styles.foodActions}>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={(e) => {
            e.stopPropagation(); // Prevent triggering the main item press
            onToggleFavorite(item, diningHall, station);
          }}
        >
          <Text style={styles.favoriteIcon}>
            {isFavorited ? '❤️' : '🤍'}
          </Text>
        </TouchableOpacity>
        {item.nutrition.has_nutrition_data && (
          <Text style={styles.caloriesBadge}>{item.nutrition.calories} cal</Text>
        )}
      </View>
    </View>
    
    <View style={styles.tagsContainer}>
      {item.dietary_tags.slice(0, 3).map((tag, index) => (
        <View key={index} style={styles.tag}>
          <Text style={styles.tagText}>{tag}</Text>
        </View>
      ))}
    </View>
    
    {item.allergens.length > 0 && (
      <Text style={styles.allergenText}>
        ⚠️ Contains: {item.allergens.slice(0, 2).join(', ')}
        {item.allergens.length > 2 && ` +${item.allergens.length - 2} more`}
      </Text>
    )}
    
    {item.nutrition.has_nutrition_data && (
      <View style={styles.macroPreview}>
        <Text style={styles.macroPreviewText}>
          P: {item.nutrition.protein_g}g • C: {item.nutrition.total_carbs_g}g • F: {item.nutrition.total_fat_g}g
        </Text>
      </View>
    )}
  </TouchableOpacity>
);

const GoalInput = ({ label, value, onChangeText, unit }) => (
  <View style={styles.goalInput}>
    <Text style={styles.goalLabel}>{label}</Text>
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.goalTextInput}
        value={value}
        onChangeText={onChangeText}
        placeholder="0"
        keyboardType="numeric"
      />
      <Text style={styles.unitLabel}>{unit}</Text>
    </View>
  </View>
);

// Main App Component
function MainApp() {
  const { user, signOut } = useAuth();
  
  // Which tab is currently active ('menu' or 'tracking')
  const [currentTab, setCurrentTab] = useState('menu');
  // Which dining hall is selected from the hall selector
  const [selectedHall, setSelectedHall] = useState('Bursley');
  // Items the user has currently selected on the menu screen but have not yet been added
  const [selectedItems, setSelectedItems] = useState([]);
  // Items that have been added to today's meal; these persist in the Progress tab
  const [consumedItems, setConsumedItems] = useState([]);
  // Which meal period is currently being viewed (Breakfast, Lunch/Brunch, Dinner)
  const [selectedMeal, setSelectedMeal] = useState('Breakfast');
  // User-defined macro goals for the day
  const [userGoals, setUserGoals] = useState({
    calories: '2000',
    protein: '150',
    carbs: '250',
    fat: '65'
  });
  const [showGoalModal, setShowGoalModal] = useState(false);
  // User's favorite items
  const [favoriteItems, setFavoriteItems] = useState([]);
  // Loading state for favorites
  const [favoritesLoading, setFavoritesLoading] = useState(true);
  // State to track which items are favorites (for quick lookup)
  const [favoriteItemsMap, setFavoriteItemsMap] = useState(new Map());
  // Chat-related states
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  // Likes-related states
  const [likesData, setLikesData] = useState({});
  const [userLikes, setUserLikes] = useState(new Set());
  // Loaded menu data (from scraped JSON)
  const [menuData, setMenuData] = useState(realMenuData);
  // Whether the menu is currently refreshing
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Calculate macro totals for a given array of items. This helper can be used for both
   * selectedItems and consumedItems. If a nutrition datum is missing it defaults to zero.
   *
   * @param {Array} items Array of menu item objects to aggregate
   * @returns {Object} Aggregate macros (calories, protein, carbs, fat, fiber, sodium)
   */
  const calculateTotals = (items) => {
    return items.reduce((totals, item) => {
      if (item.nutrition && item.nutrition.has_nutrition_data) {
        totals.calories += item.nutrition.calories || 0;
        totals.protein += item.nutrition.protein_g || 0;
        totals.carbs += item.nutrition.total_carbs_g || 0;
        totals.fat += item.nutrition.total_fat_g || 0;
        totals.fiber += item.nutrition.fiber_g || 0;
        totals.sodium += item.nutrition.sodium_mg || 0;
      }
      return totals;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0 });
  };

  // Macro totals for the current selection on the menu tab
  const selectionTotals = calculateTotals(selectedItems);
  // Macro totals for the user's added meals shown on the progress tab
  const consumptionTotals = calculateTotals(consumedItems);

  // Load favorites when app starts
  useEffect(() => {
    loadFavorites();
    loadChatMessages();
  }, []);

  const loadFavorites = async () => {
    try {
      setFavoritesLoading(true);
      const favorites = await getUserFavorites();
      setFavoriteItems(favorites);
      
      // Create a map for quick lookup
      const favMap = new Map();
      favorites.forEach(fav => {
        const key = `${fav.name}-${fav.diningHall}`;
        favMap.set(key, true);
      });
      setFavoriteItemsMap(favMap);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setFavoritesLoading(false);
    }
  };

  const handleToggleFavorite = async (item, diningHall, station) => {
    try {
      const newFavoriteStatus = await toggleFavorite(item, diningHall, station);
      await loadFavorites(); // Refresh favorites list
      return newFavoriteStatus;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorite');
      return false;
    }
  };

  // Chat functions
  const loadChatMessages = async () => {
    try {
      setChatLoading(true);
      const messages = await getChatMessages();
      setChatMessages(messages);
      
      // Initialize mock likes for messages and load likes data
      const likes = await initializeMockLikes(messages);
      setLikesData(likes);
      
      // Load user's likes
      const user = await getCurrentUser();
      if (user) {
        const userLikedMessages = new Set();
        Object.keys(likes).forEach(messageId => {
          if (likes[messageId].likedBy.includes(user.id)) {
            userLikedMessages.add(messageId);
          }
        });
        setUserLikes(userLikedMessages);
      }
    } catch (error) {
      console.error('Error loading chat messages:', error);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sendingMessage) return;
    
    try {
      setSendingMessage(true);
      await sendChatMessage(newMessage);
      setNewMessage('');
      await loadChatMessages(); // Refresh messages
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteChatMessage(messageId);
      await loadChatMessages(); // Refresh messages
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleToggleLike = async (messageId) => {
    try {
      const newLikeStatus = await toggleMessageLike(messageId);
      
      // Update local likes data
      const updatedLikesData = { ...likesData };
      const currentLikes = updatedLikesData[messageId] || { count: 0, likedBy: [] };
      
      const user = await getCurrentUser();
      if (user) {
        if (newLikeStatus) {
          // User liked the message
          currentLikes.count += 1;
          if (!currentLikes.likedBy.includes(user.id)) {
            currentLikes.likedBy.push(user.id);
          }
          setUserLikes(prev => new Set([...prev, messageId]));
        } else {
          // User unliked the message
          currentLikes.count = Math.max(0, currentLikes.count - 1);
          currentLikes.likedBy = currentLikes.likedBy.filter(id => id !== user.id);
          setUserLikes(prev => {
            const newSet = new Set(prev);
            newSet.delete(messageId);
            return newSet;
          });
        }
        
        updatedLikesData[messageId] = currentLikes;
        setLikesData(updatedLikesData);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      Alert.alert('Error', 'Failed to update like');
    }
  };

  /**
   * Toggle the selected state of a menu item. Items are uniquely identified by their
   * name and station. When selecting, ensure the station field is present on the item
   * so later comparisons and removals work correctly.
   *
   * @param {Object} item The menu item to toggle
   */
  const toggleFoodItem = (item) => {
    const isSelected = selectedItems.some(selected =>
      selected.name === item.name && selected.station === item.station
    );
    if (isSelected) {
      setSelectedItems(prev => prev.filter(selected =>
        !(selected.name === item.name && selected.station === item.station)
      ));
    } else {
      // Copy the item and ensure it has a station property
      const itemWithStation = item.station ? item : { ...item, station: undefined };
      setSelectedItems(prev => [...prev, itemWithStation]);
    }
  };

  /**
   * Move all currently selected items into the consumedItems array, then clear the selection.
   * This represents the user confirming that the selected items are part of today's meal.
   */
  const handleAddToMeal = () => {
    if (selectedItems.length === 0) return;
    setConsumedItems(prev => [...prev, ...selectedItems]);
    setSelectedItems([]);
    Alert.alert('Added', 'Selected items have been added to your meal for today.');
  };

  /**
   * Remove an item from the consumedItems array. Used on the progress tab when the user
   * decides they no longer want to count a particular item toward their daily meal.
   *
   * @param {Object} item The item to remove (compared by name & station)
   */
  const removeConsumedItem = (item) => {
    setConsumedItems(prev => prev.filter(i =>
      !(i.name === item.name && i.station === item.station)
    ));
  };

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate refreshing data
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Updated', 'Menu data refreshed successfully!');
    }, 1000);
  };

  const calculateGoalProgress = (current, goal) => {
    const percentage = (current / parseFloat(goal)) * 100;
    return Math.min(percentage, 100);
  };

  // Render different tabs
  const renderMenuTab = () => {
    const hallData = menuData.halls[selectedHall];
    if (!hallData) return <Text>No data available</Text>;

    // Build meal categories (Breakfast, Lunch/Brunch, Dinner) by cycling through items in each station.
    const mealOrder = ['Breakfast', 'Lunch/Brunch', 'Dinner'];
    const categorizedStations = {
      'Breakfast': {},
      'Lunch/Brunch': {},
      'Dinner': {}
    };
    Object.entries(hallData.stations).forEach(([stationName, items]) => {
      items.forEach((item, idx) => {
        const mealName = mealOrder[idx % mealOrder.length];
        const itemWithStation = { ...item, station: stationName };
        if (!categorizedStations[mealName][stationName]) {
          categorizedStations[mealName][stationName] = [];
        }
        categorizedStations[mealName][stationName].push(itemWithStation);
      });
    });

    return (
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Hall Selector */}
        <View style={styles.hallSelector}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {Object.keys(menuData.halls).map(hallName => (
              <TouchableOpacity
                key={hallName}
                style={[styles.hallButton, selectedHall === hallName && styles.selectedHallButton]}
                onPress={() => {
                  setSelectedHall(hallName);
                  // reset meal and selection when switching halls to avoid inconsistent state
                  setSelectedMeal('Breakfast');
                  setSelectedItems([]);
                }}
              >
                <Text style={[styles.hallButtonText, selectedHall === hallName && styles.selectedHallButtonText]}>
                  {hallName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Meal Selector */}
        <View style={styles.mealSelector}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {mealOrder.map(meal => (
              <TouchableOpacity
                key={meal}
                style={[styles.mealButton, selectedMeal === meal && styles.selectedMealButton]}
                onPress={() => setSelectedMeal(meal)}
              >
                <Text style={[styles.mealButtonText, selectedMeal === meal && styles.selectedMealButtonText]}>
                  {meal}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Selected Items Summary and Add Button */}
        {selectedItems.length > 0 && (
          <View style={styles.selectedSummary}>
            <Text style={styles.selectedTitle}>Selected Items ({selectedItems.length})</Text>
            <View style={styles.macroRow}>
              <MacroCard label="Calories" value={Math.round(selectionTotals.calories)} unit="" color="#FF6B6B" />
              <MacroCard label="Protein" value={Math.round(selectionTotals.protein)} unit="g" color="#4ECDC4" />
              <MacroCard label="Carbs" value={Math.round(selectionTotals.carbs)} unit="g" color="#45B7D1" />
              <MacroCard label="Fat" value={Math.round(selectionTotals.fat)} unit="g" color="#FFA07A" />
            </View>
            <TouchableOpacity style={styles.addButton} onPress={handleAddToMeal}>
              <Text style={styles.addButtonText}>Add to Today's Meal</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Menu Items by Selected Meal and Station */}
        {Object.entries(categorizedStations[selectedMeal]).map(([stationName, items]) => (
          <View key={stationName} style={styles.stationSection}>
            <Text style={styles.stationHeader}>{stationName}</Text>
            {items.map((item, index) => {
              const favoriteKey = `${item.name}-${selectedHall}`;
              const isFavorited = favoriteItemsMap.has(favoriteKey);
              
              return (
                <FoodItem
                  key={`${stationName}-${index}`}
                  item={item}
                  onPress={toggleFoodItem}
                  isSelected={selectedItems.some(selected =>
                    selected.name === item.name && selected.station === stationName
                  )}
                  isFavorited={isFavorited}
                  onToggleFavorite={handleToggleFavorite}
                  diningHall={selectedHall}
                  station={stationName}
                />
              );
            })}
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderTrackingTab = () => (
    <ScrollView style={styles.container}>
      <View style={styles.trackingHeader}>
        <Text style={styles.trackingTitle}>Daily Progress</Text>
        <TouchableOpacity style={styles.goalButton} onPress={() => setShowGoalModal(true)}>
          <Text style={styles.goalButtonText}>Edit Goals</Text>
        </TouchableOpacity>
      </View>

      {/* Macro Progress */}
      <View style={styles.progressSection}>
        {[
          { label: 'Calories', current: consumptionTotals.calories, goal: userGoals.calories, color: '#FF6B6B', unit: '' },
          { label: 'Protein', current: consumptionTotals.protein, goal: userGoals.protein, color: '#4ECDC4', unit: 'g' },
          { label: 'Carbs', current: consumptionTotals.carbs, goal: userGoals.carbs, color: '#45B7D1', unit: 'g' },
          { label: 'Fat', current: consumptionTotals.fat, goal: userGoals.fat, color: '#FFA07A', unit: 'g' }
        ].map((macro, index) => {
          const progress = calculateGoalProgress(macro.current, macro.goal);
          return (
            <View key={index} style={styles.progressItem}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>{macro.label}</Text>
                <Text style={styles.progressText}>
                  {Math.round(macro.current)}{macro.unit} / {macro.goal}{macro.unit}
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, {
                    width: `${progress}%`,
                    backgroundColor: macro.color
                  }]}
                />
              </View>
              <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
            </View>
          );
        })}
      </View>

      {/* Consumed Items List */}
      {consumedItems.length > 0 && (
        <View style={styles.selectedItemsList}>
          <Text style={styles.sectionTitle}>Today's Meals</Text>
          {consumedItems.map((item, index) => (
            <View key={index} style={styles.selectedItemRow}>
              <View style={styles.selectedItemInfo}>
                <Text style={styles.selectedItemName}>{item.name}</Text>
                <Text style={styles.selectedItemStation}>{item.station}</Text>
              </View>
              <TouchableOpacity onPress={() => removeConsumedItem(item)}>
                <Text style={styles.removeButton}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );

  const renderFavoritesTab = () => (
    <ScrollView style={styles.container}>
      <View style={styles.favoritesHeader}>
        <Text style={styles.favoritesTitle}>My Favorites</Text>
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={loadFavorites}
          disabled={favoritesLoading}
        >
          <Text style={styles.refreshButtonText}>
            {favoritesLoading ? 'Loading...' : 'Refresh'}
          </Text>
        </TouchableOpacity>
      </View>

      {favoritesLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading your favorites...</Text>
        </View>
      ) : favoriteItems.length === 0 ? (
        <View style={styles.emptyFavorites}>
          <Text style={styles.emptyFavoritesTitle}>No favorites yet</Text>
          <Text style={styles.emptyFavoritesText}>
            Start adding items to your favorites by tapping the heart icon on menu items!
          </Text>
        </View>
      ) : (
        <View style={styles.favoritesList}>
          {favoriteItems.map((item, index) => (
            <View key={index} style={styles.favoriteItem}>
              <View style={styles.favoriteItemHeader}>
                <Text style={styles.favoriteItemName}>{item.name}</Text>
                <TouchableOpacity
                  style={styles.removeFavoriteButton}
                  onPress={() => handleToggleFavorite(item, item.diningHall, item.station)}
                >
                  <Text style={styles.removeFavoriteText}>❤️</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.favoriteItemLocation}>
                {item.diningHall} - {item.station}
              </Text>
              {item.nutrition && item.nutrition.has_nutrition_data && (
                <View style={styles.favoriteNutrition}>
                  <Text style={styles.nutritionText}>
                    {item.nutrition.calories} cal • {item.nutrition.protein_g}g protein • {item.nutrition.total_carbs_g}g carbs • {item.nutrition.total_fat_g}g fat
                  </Text>
                </View>
              )}
              {item.dietary_tags && item.dietary_tags.length > 0 && (
                <View style={styles.dietaryTags}>
                  {item.dietary_tags.map((tag, tagIndex) => (
                    <Text key={tagIndex} style={styles.dietaryTag}>{tag}</Text>
                  ))}
                </View>
              )}
              <Text style={styles.favoriteDate}>
                Added {new Date(item.addedAt).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );

  const renderChatTab = () => (
    <KeyboardAvoidingView 
      style={styles.chatContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.chatHeader}>
        <Text style={styles.chatTitle}>Daily Chat</Text>
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={loadChatMessages}
          disabled={chatLoading}
        >
          <Text style={styles.refreshButtonText}>
            {chatLoading ? 'Loading...' : 'Refresh'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.chatSubtitle}>
        Chat resets daily at midnight • {chatMessages.length} messages today
      </Text>

      <ScrollView 
        style={styles.messagesContainer}
        ref={(ref) => {
          if (ref && chatMessages.length > 0) {
            ref.scrollToEnd({ animated: true });
          }
        }}
      >
        {chatLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading chat...</Text>
          </View>
        ) : chatMessages.length === 0 ? (
          <View style={styles.emptyChatContainer}>
            <Text style={styles.emptyChatTitle}>No messages yet</Text>
            <Text style={styles.emptyChatText}>
              Be the first to start the conversation about dining at UM!
            </Text>
          </View>
        ) : (
          chatMessages.map((message) => (
            <View 
              key={message.id} 
              style={[
                styles.messageContainer,
                message.isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
              ]}
            >
              <View style={styles.messageHeader}>
                <Text style={[
                  styles.messageUser,
                  message.isCurrentUser ? { color: '#fff' } : { color: '#495057' }
                ]}>
                  {message.isCurrentUser ? 'You' : message.userName}
                </Text>
                <Text style={[
                  styles.messageTime,
                  message.isCurrentUser ? { color: '#fff' } : { color: '#6c757d' }
                ]}>
                  {new Date(message.timestamp).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </Text>
              </View>
              <Text style={[
                styles.messageText,
                message.isCurrentUser ? { color: '#fff' } : { color: '#212529' }
              ]}>
                {message.message}
              </Text>
              
              {/* Like button and count */}
              <View style={styles.messageActions}>
                <TouchableOpacity 
                  style={styles.likeButton}
                  onPress={() => handleToggleLike(message.id)}
                >
                  <Text style={[
                    styles.likeButtonText, 
                    userLikes.has(message.id) ? styles.likeButtonActive : styles.likeButtonInactive,
                    message.isCurrentUser ? { color: '#fff' } : {}
                  ]}>
                    {userLikes.has(message.id) ? '❤️' : '🤍'} {likesData[message.id]?.count || 0}
                  </Text>
                </TouchableOpacity>
              </View>
              
              {message.isCurrentUser && (
                <TouchableOpacity 
                  style={styles.deleteMessageButton}
                  onPress={() => handleDeleteMessage(message.id)}
                >
                  <Text style={[styles.deleteMessageText, { color: '#fff' }]}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.messageInputContainer}>
        <TextInput
          style={styles.messageInput}
          placeholder="Share something about UM dining..."
          value={newMessage}
          onChangeText={setNewMessage}
          multiline={true}
          maxLength={200}
          editable={!sendingMessage}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!newMessage.trim() || sendingMessage) && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!newMessage.trim() || sendingMessage}
        >
          {sendingMessage ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.sendButtonText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>UMacros</Text>
            <Text style={styles.headerSubtitle}>UM Dining Tracker</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={signOut}
            >
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Tab Content */}
      {currentTab === 'menu' ? renderMenuTab() : 
       currentTab === 'favorites' ? renderFavoritesTab() :
       currentTab === 'chat' ? renderChatTab() :
       renderTrackingTab()}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={[styles.navButton, currentTab === 'menu' && styles.activeNavButton]}
          onPress={() => setCurrentTab('menu')}
        >
          <Text style={[styles.navButtonText, currentTab === 'menu' && styles.activeNavButtonText]}>
            Menu
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.navButton, currentTab === 'favorites' && styles.activeNavButton]}
          onPress={() => setCurrentTab('favorites')}
        >
          <Text style={[styles.navButtonText, currentTab === 'favorites' && styles.activeNavButtonText]}>
            Favorites
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.navButton, currentTab === 'chat' && styles.activeNavButton]}
          onPress={() => setCurrentTab('chat')}
        >
          <Text style={[styles.navButtonText, currentTab === 'chat' && styles.activeNavButtonText]}>
            Chat
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.navButton, currentTab === 'tracking' && styles.activeNavButton]}
          onPress={() => setCurrentTab('tracking')}
        >
          <Text style={[styles.navButtonText, currentTab === 'tracking' && styles.activeNavButtonText]}>
            Progress
          </Text>
        </TouchableOpacity>
      </View>

      {/* Goal Setting Modal */}
      <Modal visible={showGoalModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Daily Goals</Text>
            
            <GoalInput 
              label="Calories" 
              value={userGoals.calories} 
              onChangeText={(text) => setUserGoals(prev => ({...prev, calories: text}))}
              unit="cal"
            />
            <GoalInput 
              label="Protein" 
              value={userGoals.protein} 
              onChangeText={(text) => setUserGoals(prev => ({...prev, protein: text}))}
              unit="g"
            />
            <GoalInput 
              label="Carbs" 
              value={userGoals.carbs} 
              onChangeText={(text) => setUserGoals(prev => ({...prev, carbs: text}))}
              unit="g"
            />
            <GoalInput 
              label="Fat" 
              value={userGoals.fat} 
              onChangeText={(text) => setUserGoals(prev => ({...prev, fat: text}))}
              unit="g"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={() => setShowGoalModal(false)}>
                <Text style={styles.modalButtonText}>Save Goals</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setShowGoalModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// AuthenticatedApp component that shows either login or main app
function AuthenticatedApp() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return user ? <MainApp /> : <LoginScreen />;
}

// Main App component with AuthProvider
export default function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}

// Styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 2,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  userEmail: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6c757d',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  hallSelector: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  hallButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#e9ecef',
  },
  selectedHallButton: {
    backgroundColor: '#007AFF',
  },
  hallButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
  },
  selectedHallButtonText: {
    color: '#fff',
  },
  // Meal selector bar under the hall selector
  mealSelector: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  mealButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#e9ecef',
  },
  selectedMealButton: {
    backgroundColor: '#20c997',
  },
  mealButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
  },
  selectedMealButtonText: {
    color: '#fff',
  },
  // Button used to add selected items to the daily meal
  addButton: {
    marginTop: 15,
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedSummary: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#212529',
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    marginHorizontal: 3,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderTopWidth: 3,
  },
  macroValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  macroLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
  },
  stationSection: {
    margin: 15,
    marginTop: 0,
  },
  stationHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  foodItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedFoodItem: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  foodActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  favoriteButton: {
    padding: 4,
  },
  favoriteIcon: {
    fontSize: 18,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    flex: 1,
  },
  caloriesBadge: {
    backgroundColor: '#007AFF',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tag: {
    backgroundColor: '#28a745',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '500',
  },
  allergenText: {
    fontSize: 12,
    color: '#dc3545',
    marginBottom: 8,
  },
  macroPreview: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  macroPreviewText: {
    fontSize: 13,
    color: '#6c757d',
  },
  trackingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  trackingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
  },
  goalButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  goalButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  progressSection: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressItem: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  progressText: {
    fontSize: 14,
    color: '#6c757d',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'right',
  },
  selectedItemsList: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#212529',
  },
  selectedItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  selectedItemInfo: {
    flex: 1,
  },
  selectedItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
  },
  selectedItemStation: {
    fontSize: 12,
    color: '#6c757d',
  },
  removeButton: {
    color: '#dc3545',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingBottom: 10,
  },
  navButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeNavButton: {
    borderTopWidth: 3,
    borderTopColor: '#007AFF',
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c757d',
  },
  activeNavButtonText: {
    color: '#007AFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 25,
    borderRadius: 15,
    width: '85%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#212529',
  },
  goalInput: {
    marginBottom: 15,
  },
  goalLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#212529',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  goalTextInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  unitLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginLeft: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    flex: 0.45,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Favorites page styles
  favoritesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  favoritesTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
  },
  refreshButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyFavorites: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyFavoritesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6c757d',
    marginBottom: 10,
  },
  emptyFavoritesText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 22,
  },
  favoritesList: {
    padding: 15,
  },
  favoriteItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  favoriteItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  favoriteItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    flex: 1,
  },
  removeFavoriteButton: {
    padding: 4,
  },
  removeFavoriteText: {
    fontSize: 18,
  },
  favoriteItemLocation: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
  },
  favoriteNutrition: {
    marginBottom: 8,
  },
  nutritionText: {
    fontSize: 13,
    color: '#495057',
  },
  dietaryTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  dietaryTag: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontSize: 11,
    color: '#495057',
    marginRight: 5,
    marginBottom: 5,
  },
  favoriteDate: {
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  // Chat styles
  chatContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  chatTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
  },
  chatSubtitle: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  messagesContainer: {
    flex: 1,
    padding: 15,
  },
  emptyChatContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyChatTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6c757d',
    marginBottom: 10,
  },
  emptyChatText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
  },
  messageContainer: {
    marginBottom: 15,
    padding: 12,
    borderRadius: 15,
    maxWidth: '80%',
  },
  currentUserMessage: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5,
  },
  otherUserMessage: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  messageUser: {
    fontSize: 12,
    fontWeight: '600',
  },
  messageTime: {
    fontSize: 10,
    opacity: 0.7,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  deleteMessageButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  deleteMessageText: {
    fontSize: 12,
    opacity: 0.7,
  },
  messageActions: {
    flexDirection: 'row',
    marginTop: 8,
    alignItems: 'center',
  },
  likeButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginRight: 8,
  },
  likeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  likeButtonActive: {
    opacity: 1,
  },
  likeButtonInactive: {
    opacity: 0.7,
  },
  messageInputContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    alignItems: 'flex-end',
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});