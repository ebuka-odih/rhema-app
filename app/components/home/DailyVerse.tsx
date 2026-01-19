import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { IconHeart, IconShare, IconDownload } from '../Icons';

interface DailyVerseProps {
    reference: string;
    text: string;
    version: string;
    affirmation?: string;
    theme?: string;
}

export const DailyVerse: React.FC<DailyVerseProps> = ({ reference, text, version, affirmation, theme }) => (
    <View style={styles.verseCard}>
        <Image
            source={{ uri: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=600&h=800&fit=crop' }}
            style={styles.verseBackground}
        />
        <View style={styles.verseOverlay} />

        <View style={styles.verseContent}>
            <View style={styles.verseHeader}>
                <Text style={styles.verseLabel}>VERSE OF THE DAY</Text>
                {theme && (
                    <View style={styles.themeBadge}>
                        <Text style={styles.themeText}>FOR YOUR {theme.toUpperCase()}</Text>
                    </View>
                )}
            </View>
            <Text style={styles.verseText}>"{text}"</Text>

            {affirmation && (
                <View style={styles.affirmationContainer}>
                    <Text style={styles.affirmationTitle}>AFFIRMATION</Text>
                    <Text style={styles.affirmationText}>{affirmation}</Text>
                </View>
            )}

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
        minHeight: 400,
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
    verseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    verseLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#FFD35A',
        letterSpacing: 1.5,
    },
    themeBadge: {
        backgroundColor: 'rgba(255, 211, 90, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(255, 211, 90, 0.3)',
    },
    themeText: {
        fontSize: 9,
        fontWeight: '900',
        color: '#FFD35A',
        letterSpacing: 1,
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
    affirmationContainer: {
        backgroundColor: 'rgba(255, 211, 90, 0.15)',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        borderLeftWidth: 3,
        borderLeftColor: '#FFD35A',
    },
    affirmationTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#FFD35A',
        letterSpacing: 1,
        marginBottom: 4,
    },
    affirmationText: {
        fontSize: 14,
        lineHeight: 20,
        color: '#FFFFFF',
        opacity: 0.9,
    },
});
