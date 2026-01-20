import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface HomeHeaderProps {
  greeting: string;
  date: string;
  userName?: string;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({ greeting, date, userName = "User" }) => (
  <View style={styles.header}>
    <Text style={styles.greeting}>{greeting}, {userName}</Text>
    <Text style={styles.date}>{date}</Text>
  </View>
);

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingTop: 32, // Reduced from 48
    paddingBottom: 12, // Reduced from 24
  },
  greeting: {
    fontSize: 22, // Reduced from 28
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2, // Reduced from 4
  },
  date: {
    fontSize: 12, // Reduced from 14
    color: '#999999',
  },
});
