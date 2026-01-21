import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, SectionList, StyleSheet } from 'react-native';
import { BibleBook } from '../../services/bibleService';

interface BookChapterSelectorProps {
    visible: boolean;
    books: BibleBook[];
    currentBook: string;
    currentChapter: number;
    initialView?: 'BOOKS' | 'CHAPTERS';
    onSelectChapter: (book: string, chapter: number) => void;
    onClose: () => void;
}

export const BookChapterSelector: React.FC<BookChapterSelectorProps> = ({
    visible,
    books,
    currentBook,
    currentChapter,
    initialView = 'BOOKS',
    onSelectChapter,
    onClose
}) => {
    const [view, setView] = useState<'BOOKS' | 'CHAPTERS'>(initialView);
    const [selectedBook, setSelectedBook] = useState<BibleBook | null>(
        books.find(b => b.name === currentBook) || (books.length > 0 ? books[0] : null)
    );

    const handleBookSelect = (book: BibleBook) => {
        setSelectedBook(book);
        setView('CHAPTERS');
    };

    const OT_BOOKS = [
        'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
        '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra',
        'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon',
        'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
        'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'
    ];

    const sections = [
        {
            title: 'OLD TESTAMENT',
            data: books.filter(b => OT_BOOKS.includes(b.name))
        },
        {
            title: 'NEW TESTAMENT',
            data: books.filter(b => !OT_BOOKS.includes(b.name))
        }
    ].filter(s => s.data.length > 0);

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.selectorModal}>
                    <View style={styles.selectorHeader}>
                        <View style={styles.selectorTabs}>
                            <TouchableOpacity
                                onPress={() => setView('BOOKS')}
                                style={[styles.selectorTab, view === 'BOOKS' && styles.selectorTabActive]}
                            >
                                <Text style={[styles.selectorTabText, view === 'BOOKS' && styles.selectorTabTextActive]}>BOOKS</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setView('CHAPTERS')}
                                style={[styles.selectorTab, view === 'CHAPTERS' && styles.selectorTabActive]}
                            >
                                <Text style={[styles.selectorTabText, view === 'CHAPTERS' && styles.selectorTabTextActive]}>CHAPTERS</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Text style={styles.closeBtnText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {view === 'BOOKS' ? (
                        <SectionList
                            sections={sections}
                            keyExtractor={(item) => item.name}
                            renderSectionHeader={({ section: { title } }) => (
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionHeaderText}>{title}</Text>
                                </View>
                            )}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.selectionItem, currentBook === item.name && styles.selectionItemActive]}
                                    onPress={() => handleBookSelect(item)}
                                >
                                    <Text style={[styles.selectionItemText, currentBook === item.name && styles.selectionItemTextActive]}>
                                        {item.name}
                                    </Text>
                                    <Text style={styles.chapterCountLabel}>{item.chapters} Ch</Text>
                                </TouchableOpacity>
                            )}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                            stickySectionHeadersEnabled={true}
                        />
                    ) : (
                        <ScrollView contentContainerStyle={styles.chapterGrid} showsVerticalScrollIndicator={false}>
                            {selectedBook && Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((num) => (
                                <TouchableOpacity
                                    key={num}
                                    style={[
                                        styles.chapterGridItem,
                                        currentChapter === num && currentBook === selectedBook.name && styles.chapterGridItemActive
                                    ]}
                                    onPress={() => onSelectChapter(selectedBook.name, num)}
                                >
                                    <Text style={[
                                        styles.chapterGridText,
                                        currentChapter === num && currentBook === selectedBook.name && styles.chapterGridTextActive
                                    ]}>
                                        {num}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    selectorModal: {
        backgroundColor: '#1A1A1A',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        height: '80%',
        paddingTop: 20,
    },
    selectorHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 20,
    },
    selectorTabs: {
        flexDirection: 'row',
        backgroundColor: '#0D0D0D',
        borderRadius: 12,
        padding: 4,
    },
    selectorTab: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 8,
    },
    selectorTabActive: {
        backgroundColor: '#E8503A',
    },
    selectorTabText: {
        color: '#999999',
        fontSize: 12,
        fontWeight: 'bold',
    },
    selectorTabTextActive: {
        color: '#FFFFFF',
    },
    closeBtn: {
        padding: 8,
    },
    closeBtnText: {
        color: '#FFFFFF',
        fontSize: 20,
    },
    selectionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    selectionItemActive: {
        backgroundColor: 'rgba(232, 80, 58, 0.05)',
    },
    sectionHeader: {
        backgroundColor: '#1A1A1A',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    sectionHeaderText: {
        color: '#E8503A',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    selectionItemText: {
        fontSize: 16,
        color: '#999999',
    },
    selectionItemTextActive: {
        color: '#E8503A',
        fontWeight: '700',
    },
    chapterCountLabel: {
        fontSize: 12,
        color: '#666666',
    },
    chapterGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 16,
        justifyContent: 'flex-start',
    },
    chapterGridItem: {
        width: '20%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        marginBottom: 8,
    },
    chapterGridItemActive: {
        backgroundColor: '#E8503A',
    },
    chapterGridText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    chapterGridTextActive: {
        fontWeight: 'bold',
    },
    listContent: {
        paddingBottom: 40,
    },
});
