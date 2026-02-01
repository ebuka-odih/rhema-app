import React from 'react';
import { ScrollView, View, Text, StyleSheet, Platform, ActivityIndicator, Pressable, useWindowDimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { BibleChapter } from '../../services/bibleService';
import { BibleHighlight, BibleBookmark } from '../../types';
import { isJesusSpeaking } from '../../services/redLetterService';

interface ReaderViewProps {
    loading: boolean;
    book: string;
    chapter: number;
    bibleData: BibleChapter | null;
    fontSize: number;
    highlights: BibleHighlight[];
    bookmarks: BibleBookmark[];
    selectedVerses: number[];
    onVersePress: (verseNum: number) => void;
    targetVerse?: number | null;
}

export const ReaderView: React.FC<ReaderViewProps> = ({
    loading,
    book,
    chapter,
    bibleData,
    fontSize,
    highlights,
    bookmarks,
    selectedVerses,
    onVersePress,
    targetVerse
}) => {
    const scrollRef = React.useRef<ScrollView>(null);
    const { width } = useWindowDimensions();

    // Calculate dynamic padding based on screen width for better readability on tablets
    const horizontalPadding = width > 600 ? 40 : 24;

    const versePositions = React.useRef<Record<number, number>>({});

    React.useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ y: 0, animated: false });
        }
    }, [book, chapter]);

    React.useEffect(() => {
        if (targetVerse && versePositions.current[targetVerse] !== undefined && scrollRef.current) {
            scrollRef.current.scrollTo({
                y: versePositions.current[targetVerse],
                animated: true
            });
        }
    }, [targetVerse, bibleData]);

    const handleVersePress = (num: number) => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onVersePress(num);
    };

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
        <ScrollView
            ref={scrollRef}
            style={styles.readerScroll}
            contentContainerStyle={[styles.readerContent, { paddingHorizontal: horizontalPadding }]}
            showsVerticalScrollIndicator={false}
        >
            <Text style={styles.chapterTitle}>{book} {chapter}</Text>
            <View style={styles.textContainer}>
                {bibleData && Object.entries(bibleData.verses).map(([numStr, content]) => {
                    const num = parseInt(numStr);
                    const highlight = highlights.find(h => Number(h.verse) === num);
                    const isBookmarked = bookmarks.some(b => Number(b.verse) === num);
                    const isSelected = selectedVerses.includes(num);
                    const jesusSpeaks = isJesusSpeaking(book, chapter, num);

                    return (
                        <Pressable
                            key={numStr}
                            onPress={() => handleVersePress(num)}
                            onLayout={(event) => {
                                versePositions.current[num] = event.nativeEvent.layout.y;
                            }}
                            style={({ pressed }) => [
                                styles.verseContainer,
                                // Bookmark color (Light Orange / Brand Tint)
                                isBookmarked && { backgroundColor: 'rgba(232, 80, 58, 0.15)' },
                                // Manual highlight color (overrides or stacks)
                                highlight && { backgroundColor: `${highlight.color}45` },
                                isSelected && styles.selectedVerse,
                                (isSelected && isBookmarked) && { backgroundColor: 'rgba(232, 80, 58, 0.3)' },
                                (isSelected && highlight) && { backgroundColor: `${highlight.color}65` },
                                pressed && !isSelected && styles.pressedVerse
                            ]}
                        >
                            <Text style={[styles.bibleParagraph, { fontSize: fontSize, lineHeight: fontSize * 1.6 }]}>
                                <Text style={[
                                    styles.verseNumber,
                                    !jesusSpeaks && styles.brandVerseNumber,
                                    isBookmarked && { color: '#E8503A', opacity: 1 }, // Make verse num pop if bookmarked
                                    { fontSize: fontSize * 0.65 }
                                ]}>
                                    {numStr}
                                </Text>
                                <Text>  </Text>
                                <Text style={[
                                    jesusSpeaks ? styles.jesusWords : styles.textWords,
                                    isBookmarked && { color: '#FFB347' } // Light Orange text color as requested
                                ]}>
                                    {content}
                                </Text>
                            </Text>
                        </Pressable>
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
        paddingTop: 40,
        paddingBottom: 150,
    },
    chapterTitle: {
        fontSize: 32,
        fontWeight: '800', // Heavier weight
        color: '#FFFFFF',
        marginBottom: 40,
        textAlign: 'center',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'serif', // Cleaner system font
        letterSpacing: -0.5,
    },
    textContainer: {
        maxWidth: 700,
        alignSelf: 'center',
        width: '100%',
    },
    verseContainer: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        marginHorizontal: -16, // Bleed selection to edges
        borderRadius: 12, // Smoother corners using continuous curve simulation
        marginBottom: 2,
    },
    pressedVerse: {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
    },
    selectedVerse: {
        backgroundColor: 'rgba(232, 80, 58, 0.15)',
    },
    bibleParagraph: {
        color: '#E0E0E0',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    textWords: {
        color: '#E0E0E0',
    },
    jesusWords: {
        color: '#FF6B6B', // Softer red
    },
    verseNumber: {
        color: '#E8503A',
        fontWeight: 'bold',
        fontVariant: ['tabular-nums'], // Monospaced numbers
        opacity: 0.8,
        textAlignVertical: 'top',
    },
    brandVerseNumber: {
        color: '#888888',
    },
});
