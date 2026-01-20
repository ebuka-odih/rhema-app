import React from 'react';
import { ScrollView, View, Text, StyleSheet, Platform, ActivityIndicator, TouchableOpacity } from 'react-native';
import { BibleChapter } from '../../services/bibleService';
import { BibleHighlight } from '../../types';
import { isJesusSpeaking } from '../../services/redLetterService';

interface ReaderViewProps {
    loading: boolean;
    book: string;
    chapter: number;
    bibleData: BibleChapter | null;
    fontSize: number;
    highlights: BibleHighlight[];
    selectedVerses: number[];
    onVersePress: (verseNum: number) => void;
}

export const ReaderView: React.FC<ReaderViewProps> = ({
    loading,
    book,
    chapter,
    bibleData,
    fontSize,
    highlights,
    selectedVerses,
    onVersePress
}) => {
    if (loading && !bibleData) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#E8503A" />
            </View>
        );
    }

    if (!loading && !bibleData) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>This chapter is not available offline.</Text>
                <Text style={styles.errorSubtext}>Please connect to the internet to download it.</Text>
            </View>
        );
    }

    const getVerseHighlight = (num: number) => {
        return highlights.find(h => h.verse === num);
    };

    return (
        <ScrollView style={styles.readerScroll} contentContainerStyle={styles.readerContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.chapterTitle}>{book} {chapter}</Text>
            <View style={styles.textContainer}>
                {bibleData && Object.entries(bibleData.verses).map(([numStr, content]) => {
                    const num = parseInt(numStr);
                    const highlight = getVerseHighlight(num);
                    const isSelected = selectedVerses.includes(num);
                    const jesusSpeaks = isJesusSpeaking(book, chapter, num);

                    return (
                        <TouchableOpacity
                            key={numStr}
                            activeOpacity={0.7}
                            onPress={() => onVersePress(num)}
                            style={[
                                styles.verseContainer,
                                highlight && { backgroundColor: `${highlight.color}60` },
                                isSelected && styles.selectedVerse,
                                isSelected && highlight && { backgroundColor: `${highlight.color}80` }
                            ]}
                        >
                            <Text style={[styles.bibleParagraph, { fontSize: fontSize }]}>
                                <Text style={[styles.verseNumber, !jesusSpeaks && styles.brandVerseNumber]}>
                                    {numStr}{' '}
                                </Text>
                                <Text style={jesusSpeaks ? styles.jesusWords : null}>
                                    {content}
                                </Text>
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    errorText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 12,
    },
    errorSubtext: {
        color: '#999999',
        fontSize: 16,
        textAlign: 'center',
    },
    readerScroll: {
        flex: 1,
    },
    readerContent: {
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 150,
    },
    chapterTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 32,
        textAlign: 'center',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    textContainer: {
        maxWidth: 600,
        alignSelf: 'center',
        width: '100%',
    },
    verseContainer: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginHorizontal: -12,
        borderRadius: 8,
    },
    selectedVerse: {
        backgroundColor: 'rgba(232, 80, 58, 0.15)',
        borderLeftWidth: 3,
        borderLeftColor: '#E8503A',
    },
    bibleParagraph: {
        color: '#E0E0E0',
        lineHeight: 32,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    jesusWords: {
        color: '#FF4D4D', // Semi-red for Jesus' words
    },
    verseNumber: {
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    brandVerseNumber: {
        color: '#E8503A',
    },
});
