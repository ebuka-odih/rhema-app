import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface TabNavigatorProps {
    activeTab: 'SUMMARY' | 'TRANSCRIPTION';
    onTabChange: (tab: 'SUMMARY' | 'TRANSCRIPTION') => void;
}

export const TabNavigator: React.FC<TabNavigatorProps> = ({ activeTab, onTabChange }) => (
    <View style={styles.tabContainer}>
        <TouchableOpacity
            style={[styles.tab, activeTab === 'SUMMARY' && styles.activeTab]}
            onPress={() => onTabChange('SUMMARY')}
        >
            <Text style={[styles.tabText, activeTab === 'SUMMARY' && styles.activeTabText]}>Summary</Text>
        </TouchableOpacity>
        <TouchableOpacity
            style={[styles.tab, activeTab === 'TRANSCRIPTION' && styles.activeTab]}
            onPress={() => onTabChange('TRANSCRIPTION')}
        >
            <Text style={[styles.tabText, activeTab === 'TRANSCRIPTION' && styles.activeTabText]}>Transcription</Text>
        </TouchableOpacity>
    </View>
);

const styles = StyleSheet.create({
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        padding: 4,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    activeTab: {
        backgroundColor: '#E8503A',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#999999',
    },
    activeTabText: {
        color: '#FFFFFF',
    },
});
