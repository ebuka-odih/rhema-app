import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, TextInput, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { bibleService } from '../../services/bibleService';
import { IconSearch, IconChevronLeft } from '../Icons';

interface BibleSearchModalProps {
    visible: boolean;
    currentVersion: string;
    onSelectVerse: (book: string, chapter: number, verse: number) => void;
    onClose: () => void;
}

export const BibleSearchModal: React.FC<BibleSearchModalProps> = ({
    visible,
    currentVersion,
    onSelectVerse,
    onClose
}) => {
    const [query, setQuery] = useState('');
    const [testament, setTestament] = useState<'all' | 'old' | 'new'>('all');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);

    const handleSearch = useCallback(async (text: string, filter: 'all' | 'old' | 'new') => {
        if (text.length < 2) {
            setResults([]);
            setTotal(0);
            return;
        }

        setLoading(true);
        try {
            const data = await bibleService.searchBible(text, {
                version: currentVersion,
                testament: filter,
                limit: 50
            });
            setResults(data.results || []);
            setTotal(data.total || 0);
        } catch (err) {
            console.error('Search error:', err);
        } finally {
            setLoading(false);
        }
    }, [currentVersion]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            handleSearch(query, testament);
        }, 500);
        return () => clearTimeout(timeout);
    }, [query, testament, handleSearch]);

    const handleVerseSelect = (res: any) => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        onSelectVerse(res.book, res.chapter, res.verse);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.contentContainer}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onClose} style={styles.backButton}>
                            <IconChevronLeft size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                        <View style={styles.searchContainer}>
                            <IconSearch size={20} color="#666666" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search Chapter, Verses, Words..."
                                placeholderTextColor="#666666"
                                value={query}
                                onChangeText={setQuery}
                                autoFocus={true}
                                selectionColor="#E8503A"
                            />
                        </View>
                    </View>

                    <View style={styles.filterContainer}>
                        {(['all', 'old', 'new'] as const).map((t) => (
                            <TouchableOpacity
                                key={t}
                                style={[styles.filterTab, testament === t && styles.filterTabActive]}
                                onPress={() => {
                                    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setTestament(t);
                                }}
                            >
                                <Text style={[styles.filterTabText, testament === t && styles.filterTabTextActive]}>
                                    {t.toUpperCase()}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {loading ? (
                        <View style={styles.centerContainer}>
                            <ActivityIndicator size="large" color="#E8503A" />
                            <Text style={styles.loadingText}>Searching the Scriptures...</Text>
                        </View>
                    ) : results.length > 0 ? (
                        <ScrollView contentContainerStyle={styles.resultsList} showsVerticalScrollIndicator={false}>
                            <Text style={styles.resultsCount}>{total} results found</Text>
                            {results.map((res, i) => (
                                <TouchableOpacity
                                    key={`${res.book}-${res.chapter}-${res.verse}-${i}`}
                                    style={styles.resultItem}
                                    onPress={() => handleVerseSelect(res)}
                                >
                                    <View style={styles.resultHeader}>
                                        <Text style={styles.resultReference}>{res.reference}</Text>
                                        <Text style={styles.resultVersion}>{currentVersion}</Text>
                                    </View>
                                    <Text style={styles.resultText} numberOfLines={3}>
                                        {res.text}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    ) : query.length >= 2 ? (
                        <View style={styles.centerContainer}>
                            <Text style={styles.noResultsText}>No results found for "{query}"</Text>
                            <Text style={styles.noResultsSub}>Try a different word or reference</Text>
                        </View>
                    ) : (
                        <View style={styles.centerContainer}>
                            <IconSearch size={48} color="rgba(255, 255, 255, 0.05)" />
                            <Text style={styles.initialText}>Search for Wisdom</Text>
                            <Text style={styles.initialSub}>Type keywords or scripture references</Text>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: '#0D0D0D',
    },
    contentContainer: {
        flex: 1,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 16,
        gap: 12,
    },
    backButton: {
        padding: 4,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    searchInput: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 16,
        marginLeft: 8,
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 20,
        gap: 8,
    },
    filterTab: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
        backgroundColor: '#1A1A1A',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    filterTabActive: {
        backgroundColor: '#E8503A',
        borderColor: '#E8503A',
    },
    filterTabText: {
        color: '#999999',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    filterTabTextActive: {
        color: '#FFFFFF',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    loadingText: {
        color: '#666666',
        marginTop: 16,
        fontSize: 14,
    },
    resultsList: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    resultsCount: {
        color: '#E8503A',
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 16,
        letterSpacing: 1,
    },
    resultItem: {
        backgroundColor: '#1A1A1A',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    resultHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    resultReference: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    resultVersion: {
        fontSize: 10,
        color: '#666666',
        fontWeight: 'bold',
    },
    resultText: {
        fontSize: 15,
        color: '#CCCCCC',
        lineHeight: 22,
    },
    noResultsText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    noResultsSub: {
        color: '#666666',
        fontSize: 14,
        textAlign: 'center',
    },
    initialText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
    },
    initialSub: {
        color: '#666666',
        fontSize: 14,
        textAlign: 'center',
    }
});
