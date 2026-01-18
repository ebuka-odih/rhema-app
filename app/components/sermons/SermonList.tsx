import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Sermon } from '../../types/sermon';
import { IconSearch } from '../Icons';
import { SermonCard } from './SermonCard';
import { SermonSkeleton } from './SermonSkeleton';

interface SermonListProps {
    sermons: Sermon[];
    onSelectSermon: (sermon: Sermon) => void;
    isLoading?: boolean;
}

export const SermonList: React.FC<SermonListProps> = ({ sermons, onSelectSermon, isLoading }) => (
    <View style={styles.viewContainer}>
        <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Sermons</Text>
            <TouchableOpacity style={styles.searchButton}>
                <IconSearch size={20} color="#FFFFFF" />
            </TouchableOpacity>
        </View>

        <ScrollView style={styles.sermonsList} contentContainerStyle={styles.sermonsListContent} showsVerticalScrollIndicator={false}>
            {isLoading ? (
                <>
                    <SermonSkeleton />
                    <SermonSkeleton />
                    <SermonSkeleton />
                </>
            ) : sermons.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No sermons recorded yet.</Text>
                    <Text style={styles.emptySubtext}>Tap the microphone to start!</Text>
                </View>
            ) : (
                sermons.map(sermon => (
                    <SermonCard
                        key={sermon.id}
                        sermon={sermon}
                        onPress={() => onSelectSermon(sermon)}
                    />
                ))
            )}
        </ScrollView>
    </View>
);

const styles = StyleSheet.create({
    viewContainer: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 48,
        paddingBottom: 0,
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    listTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -1,
    },
    searchButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sermonsList: {
        flex: 1,
    },
    sermonsListContent: {
        gap: 16,
        paddingBottom: 120,
    },
    emptyState: {
        flex: 1,
        marginTop: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    emptySubtext: {
        color: '#666',
        fontSize: 14,
    },
});
