import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const JourneyHeader: React.FC = () => {
    return (
        <View style={styles.header}>
            <View>
                <Text style={styles.welcomeText}>Grace & Peace,</Text>
                <Text style={styles.headerTitle}>Your Journey</Text>
            </View>
            <View style={styles.profileButton}>
                <View style={styles.profileCircle}>
                    <Text style={styles.profileInitial}>J</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    welcomeText: {
        fontSize: 14,
        color: '#666666',
        fontWeight: '600',
        marginBottom: 4,
    },
    headerTitle: {
        fontSize: 34,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -1.2,
    },
    profileButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        padding: 2,
        backgroundColor: 'rgba(232, 80, 58, 0.15)',
    },
    profileCircle: {
        flex: 1,
        borderRadius: 22,
        backgroundColor: '#E8503A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileInitial: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '800',
    },
});
