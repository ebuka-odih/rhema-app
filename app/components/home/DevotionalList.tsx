import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

interface Devotional {
    id: string;
    title: string;
    plan: string;
}

interface DevotionalListProps {
    devotionals: Devotional[];
}

export const DevotionalList: React.FC<DevotionalListProps> = ({ devotionals }) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bible Stories (Coming Soon)</Text>
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.devotionalsList}
        >
            {devotionals.map((devotional) => (
                <TouchableOpacity key={devotional.id} style={styles.devotionalCard}>
                    <View style={styles.devotionalIcon} />
                    <View style={styles.devotionalInfo}>
                        <Text style={styles.devotionalTitle}>{devotional.title}</Text>
                        <Text style={styles.devotionalPlan}>{devotional.plan}</Text>
                    </View>
                </TouchableOpacity>
            ))}
        </ScrollView>
    </View>
);

const styles = StyleSheet.create({
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    devotionalsList: {
        paddingLeft: 24,
        paddingRight: 24,
        gap: 16,
    },
    devotionalCard: {
        width: 160,
        height: 192,
        backgroundColor: '#1A1A1A',
        borderRadius: 16,
        padding: 16,
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    devotionalIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    devotionalInfo: {
        gap: 4,
    },
    devotionalTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    devotionalPlan: {
        fontSize: 12,
        color: '#999999',
    },
});
