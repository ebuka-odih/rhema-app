import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { Sermon } from '../../types/sermon';
import { IconSearch } from '../Icons';
import { SermonCard } from './SermonCard';
import { SermonSkeleton } from './SermonSkeleton';

interface SermonListProps {
    sermons: Sermon[];
    onSelectSermon: (sermon: Sermon) => void;
    isLoading?: boolean;
}

export const SermonList: React.FC<SermonListProps> = ({ sermons, onSelectSermon, isLoading }) => {
    const [searchEnabled, setSearchEnabled] = React.useState(false);
    const [query, setQuery] = React.useState('');

    const filteredSermons = React.useMemo(() => {
        const normalized = query.trim().toLowerCase();
        if (!normalized) return sermons;
        return sermons.filter((sermon) => {
            const haystack = `${sermon.title} ${sermon.summary || ''} ${sermon.transcription || ''}`.toLowerCase();
            return haystack.includes(normalized);
        });
    }, [sermons, query]);

    const toggleSearch = () => {
        if (searchEnabled) {
            setQuery('');
        }
        setSearchEnabled(!searchEnabled);
    };

    return (
        <View style={styles.viewContainer}>
            <View style={styles.listHeader}>
                <Text style={styles.listTitle}>Sermons</Text>
                <TouchableOpacity
                    style={styles.searchButton}
                    onPress={toggleSearch}
                >
                    <IconSearch size={20} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            {searchEnabled && (
                <View style={styles.searchInputWrap}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search sermons..."
                        placeholderTextColor="#666666"
                        value={query}
                        onChangeText={setQuery}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>
            )}

            <ScrollView style={styles.sermonsList} contentContainerStyle={styles.sermonsListContent} showsVerticalScrollIndicator={false}>
                {isLoading ? (
                    <>
                        <SermonSkeleton />
                        <SermonSkeleton />
                        <SermonSkeleton />
                    </>
                ) : filteredSermons.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>
                            {query ? 'No sermons matched your search.' : 'No sermons recorded yet.'}
                        </Text>
                        <Text style={styles.emptySubtext}>
                            {query ? 'Try a different title or keyword.' : 'Tap the microphone to start!'}
                        </Text>
                    </View>
                ) : (
                    filteredSermons.map(sermon => (
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
};

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
    searchInputWrap: {
        marginBottom: 16,
    },
    searchInput: {
        backgroundColor: '#1A1A1A',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 12,
        color: '#FFFFFF',
        paddingHorizontal: 14,
        height: 46,
        fontSize: 14,
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
