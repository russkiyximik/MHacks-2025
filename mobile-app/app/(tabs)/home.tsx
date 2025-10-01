import React from 'react';
import { ScrollView, View, Text, ActivityIndicator } from 'react-native';
import { useMenu } from '../../src/hooks/useMenu';

/**
 * Home screen which displays the menu for all dining halls. It uses the
 * `useMenu` hook powered by TanStack Query to load the menu from the API.
 * While loading, a spinner is shown; errors are surfaced as text.
 */
export default function HomeScreen() {
  const { data, isLoading, error } = useMenu();

  if (isLoading) {
    return <ActivityIndicator />;
  }
  if (error) {
    return <Text>Error loading menu</Text>;
  }
  if (!data || !data.halls) {
    return <Text>No menu data available</Text>;
  }

  return (
    <ScrollView style={{ padding: 16 }}>
      {Object.keys(data.halls).map((hallName) => {
        const hall = (data as any).halls[hallName];
        return (
          <View key={hallName}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginTop: 16 }}>
              {hallName}
            </Text>
            {Object.entries(hall.stations).map(([stationName, items]) => (
              <View key={stationName} style={{ paddingLeft: 8 }}>
                <Text style={{ fontSize: 18, marginTop: 8 }}>{stationName}</Text>
                {(items as any[]).map((item: any, idx: number) => (
                  <Text key={idx} style={{ paddingLeft: 16 }}>
                    • {item.name}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        );
      })}
    </ScrollView>
  );
}