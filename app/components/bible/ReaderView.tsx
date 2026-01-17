import React from 'react';
import { ScrollView, View, Text, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { BibleChapter } from '../../services/bibleService';

interface ReaderViewProps {
    loading: boolean;
    book: string;
    chapter: number;
    bibleData: BibleChapter | null;
    fontSize: number;
}

export const ReaderView: React.FC<ReaderViewProps> = ({
    loading,
    book,
    chapter,
    bibleData,
    fontSize
}) => {
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#E8503A" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.readerScroll} contentContainerStyle={styles.readerContent}>
            <Text style={styles.chapterTitle}>{book} {chapter}</Text>
            <View style={styles.textContainer}>
                {bibleData && Object.entries(bibleData.verses).map(([num, content]) => (
                    <Text
                        key={num}
                        style={[styles.bibleParagraph, { fontSize: fontSize }]}
                    >
                        <Text style={styles.verseNumber}>{num} </Text>
                        {content}
                    </Text>
                ))}
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
    readerScroll: {
        flex: 1,
    },
    readerContent: {
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 120,
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
    bibleParagraph: {
        color: '#E0E0E0',
        lineHeight: 32,
        marginBottom: 24,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    verseNumber: {
        fontSize: 14,
        color: '#E8503A',
        fontWeight: 'bold',
    },
});
