import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { bibleService, BibleChapter } from '../../services/bibleService';
import { IconClose } from '../Icons';

interface BibleVerseModalProps {
    visible: boolean;
    reference: string;
    onClose: () => void;
    onReadFull: () => void;
}

export const BibleVerseModal: React.FC<BibleVerseModalProps> = ({
    visible,
    reference,
    onClose,
    onReadFull
}) => {
    const [loading, setLoading] = useState(false);
    const [verseText, setVerseText] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (visible && reference) {
            fetchVerse();
        } else {
            setVerseText(null);
            setError(null);
        }
    }, [visible, reference]);

    const fetchVerse = async () => {
        setLoading(true);
        setError(null);
        try {
            // Basic parsing of reference like "John 3:16"
            // Handles references with single or multiple chapters/verses
            const parts = reference.match(/^(.+?)\s+(\d+):(\d+)(?:-(\d+))?$/);
            if (!parts) {
                setError("Could not parse reference.");
                setLoading(false);
                return;
            }

            const [_, book, chapter, startVerse, endVerse] = parts;
            const versionId = 'NEW KING JAMES VERSION'; // Default version

            const chapterData = await bibleService.getChapter(versionId, book, parseInt(chapter));
            if (chapterData && chapterData.verses) {
                if (endVerse) {
                    let combined = "";
                    for (let i = parseInt(startVerse); i <= parseInt(endVerse); i++) {
                        combined += `[${i}] ${chapterData.verses[i.toString()] || ""} `;
                    }
                    setVerseText(combined.trim());
                } else {
                    setVerseText(chapterData.verses[startVerse] || "Verse not found.");
                }
            } else {
                setError("Chapter not found.");
            }
        } catch (err) {
            console.error("Fetch verse error:", err);
            setError("Failed to load verse.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.header}>
                        <Text style={styles.referenceTitle}>{reference}</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <IconClose size={24} color="#999999" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.contentScroll}>
                        {loading ? (
                            <View style={styles.loaderContainer}>
                                <ActivityIndicator color="#E8503A" />
                            </View>
                        ) : error ? (
                            <Text style={styles.errorText}>{error}</Text>
                        ) : (
                            <Text style={styles.verseText}>{verseText}</Text>
                        )}
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.readFullButton} onPress={onReadFull}>
                            <Text style={styles.readFullText}>Go to Full Chapter</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        width: '100%',
        maxHeight: '60%',
        backgroundColor: '#1A1A1A',
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 16,
    },
    referenceTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    closeButton: {
        padding: 4,
    },
    contentScroll: {
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    loaderContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    verseText: {
        fontSize: 18,
        lineHeight: 28,
        color: '#CCCCCC',
        fontStyle: 'italic',
    },
    errorText: {
        color: '#E8503A',
        textAlign: 'center',
        paddingVertical: 20,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
    },
    readFullButton: {
        backgroundColor: '#E8503A',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    readFullText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
