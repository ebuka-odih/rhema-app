import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Sermon } from '../../types/sermon';
import { IconSearch } from '../Icons';
import { SermonCard } from './SermonCard';

interface SermonListProps {
    sermons: Sermon[];
    onSelectSermon: (sermon: Sermon) => void;
}

export const SermonList: React.FC<SermonListProps> = ({ sermons, onSelectSermon }) => (
    <View style={styles.viewContainer}>
        <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Sermons</Text>
            <TouchableOpacity style={styles.searchButton}>
                <IconSearch size={20} color="#FFFFFF" />
            </TouchableOpacity>
        </View>

        <ScrollView style={styles.sermonsList} contentContainerStyle={styles.sermonsListContent}>
            {sermons.map(sermon => (
                <SermonCard
                    key={sermon.id}
                    sermon={sermon}
                    onPress={() => onSelectSermon(sermon)}
                />
            ))}
        </ScrollView>
    </View>
);

const styles = StyleSheet.create({
    viewContainer: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 0,
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    listTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    searchButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#222222',
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
});
