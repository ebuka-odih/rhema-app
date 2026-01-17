import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { IconHeart, IconShare, IconDownload } from '../Icons';

interface DailyVerseProps {
    reference: string;
    text: string;
    version: string;
}

export const DailyVerse: React.FC<DailyVerseProps> = ({ reference, text, version }) => (
    <View style={styles.verseCard}>
        <Image
            source={{ uri: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=600&h=800&fit=crop' }}
            style={styles.verseBackground}
        />
        <View style={styles.verseOverlay} />

        <View style={styles.verseContent}>
            <Text style={styles.verseLabel}>VERSE OF THE DAY</Text>
            <Text style={styles.verseText}>"{text}"</Text>

            <View style={styles.verseFooter}>
                <Text style={styles.verseReference}>{reference} {version}</Text>
                <View style={styles.verseActions}>
                    <TouchableOpacity style={styles.verseAction}>
                        <IconHeart size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.verseAction}>
                        <IconShare size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.verseAction}>
                        <IconDownload size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    </View>
);

const styles = StyleSheet.create({
    verseCard: {
        marginHorizontal: 24,
        marginBottom: 32,
        height: 384,
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    verseBackground: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: 0.6,
    },
    verseOverlay: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    verseContent: {
        flex: 1,
        justifyContent: 'flex-end',
        padding: 24,
    },
    verseLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#FFD35A',
        letterSpacing: 1.5,
        marginBottom: 16,
    },
    verseText: {
        fontSize: 20,
        lineHeight: 32,
        color: '#FFFFFF',
        marginBottom: 16,
        fontStyle: 'italic',
    },
    verseFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    verseReference: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#999999',
    },
    verseActions: {
        flexDirection: 'row',
        gap: 16,
    },
    verseAction: {
        padding: 4,
    },
});
