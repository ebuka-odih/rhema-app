import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const FastingScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Fasting</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Fasting Timer (Coming Soon)</Text>
        <Text style={styles.cardText}>
          Track your fasting journey with a custom timer and join community groups for support.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  content: {
    padding: 24,
    paddingBottom: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 14,
    color: '#999999',
    lineHeight: 22,
  },
  note: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default FastingScreen;