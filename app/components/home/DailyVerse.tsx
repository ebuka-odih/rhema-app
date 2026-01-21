import React, { useRef, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform, Share, Alert } from 'react-native';
import { IconHeart, IconShare, IconDownload } from '../Icons';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { API_BASE_URL } from '../../services/apiConfig';
import { authService } from '../../services/auth';

interface DailyVerseProps {
    id: string;
    reference: string;
    text: string;
    version: string;
    affirmation?: string;
    theme?: string;
    backgroundImage?: string;
    initialLikes?: number;
    initialShares?: number;
    initialDownloads?: number;
    initialUserLiked?: boolean;
}

export const DailyVerse: React.FC<DailyVerseProps> = ({
    id, reference, text, version, affirmation, theme, backgroundImage,
    initialLikes = 0, initialShares = 0, initialDownloads = 0, initialUserLiked = false
}) => {
    const viewRef = useRef<View>(null);
    const [metrics, setMetrics] = useState({
        likes: initialLikes,
        shares: initialShares,
        downloads: initialDownloads,
        userLiked: initialUserLiked
    });
    const [isInteracting, setIsInteracting] = useState(false);

    // Sync metrics with props when they change (e.g. after Homescreen fetch)
    React.useEffect(() => {
        setMetrics({
            likes: initialLikes,
            shares: initialShares,
            downloads: initialDownloads,
            userLiked: initialUserLiked
        });
    }, [id, initialLikes, initialShares, initialDownloads, initialUserLiked]);

    const handleInteract = async (type: 'like' | 'share' | 'download') => {
        if (isInteracting) return;
        setIsInteracting(true);
        try {
            const token = await authService.getToken();
            const res = await fetch(`${API_BASE_URL}bible/daily-verse/interact`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ daily_verse_id: id, type })
            });

            if (res.ok) {
                const data = await res.json();
                if (type === 'like') {
                    setMetrics(prev => ({
                        ...prev,
                        likes: data.likes_count,
                        userLiked: data.user_liked
                    }));
                } else if (type === 'share') {
                    setMetrics(prev => ({ ...prev, shares: data.shares_count || prev.shares + 1 }));
                    await processShare();
                } else if (type === 'download') {
                    setMetrics(prev => ({ ...prev, downloads: data.downloads_count || prev.downloads + 1 }));
                    await processDownload();
                }
            } else if (res.status === 401) {
                Alert.alert("Authentication Required", "Please sign in to interact with daily verses.");
            }
        } catch (err) {
            console.error('Interaction error:', err);
        } finally {
            setIsInteracting(false);
        }
    };

    const processShare = async () => {
        try {
            const uri = await captureRef(viewRef, {
                format: 'png',
                quality: 0.9,
                result: 'tmpfile'
            });
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri);
            } else {
                await Share.share({ url: uri });
            }
        } catch (err) {
            console.error('Share capture error:', err);
        }
    };

    const processDownload = async () => {
        try {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert("Permission Required", "Allow access to your photo library to save verses.");
                return;
            }
            const uri = await captureRef(viewRef, {
                format: 'png',
                quality: 1.0,
                result: 'tmpfile'
            });
            await MediaLibrary.saveToLibraryAsync(uri);
            Alert.alert("Saved!", "Daily verse image has been saved to your gallery.");
        } catch (err) {
            console.error('Download capture error:', err);
        }
    };

    return (
        <View style={styles.verseCard}>
            {/* Wrapper for content to be captured (excluding buttons) */}
            <View ref={viewRef} collapsable={false} style={styles.captureContainer}>
                <Image
                    source={{
                        uri: backgroundImage || `https://source.unsplash.com/featured/800x1100?nature,spiritual,${theme || 'landscape'}&sig=${id || 'fallback'}`
                    }}
                    style={styles.verseBackground}
                />
                <View style={styles.verseOverlay} />

                <View style={styles.handleContainer}>
                    <View style={styles.handle} />
                </View>

                <View style={styles.topSection}>
                    <View style={styles.badgeContainer}>
                        <Text style={styles.verseLabel}>VERSE OF THE DAY</Text>
                        {theme && (
                            <View style={styles.themeBadge}>
                                <Text style={styles.themeText}>{theme.toUpperCase()}</Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.verseContent}>
                    <View style={styles.mainTextContainer}>
                        <Text style={styles.verticalQuote}>"</Text>
                        <Text style={styles.verseText}>{text}</Text>
                        <Text style={styles.verticalQuote}>"</Text>
                    </View>

                    <Text style={styles.verseReference}>{reference} • {version}</Text>

                    {affirmation && (
                        <View style={styles.affirmationCard}>
                            <Text style={styles.affirmationTitle}>DAILY AFFIRMATION</Text>
                            <Text style={styles.affirmationText}>{affirmation}</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Actions are OUTSIDE the captureRef but inside the card container */}
            <View style={styles.footerActions}>
                <View style={styles.actionsContainer}>
                    <View style={styles.actionItem}>
                        <TouchableOpacity
                            style={[styles.actionCircle, metrics.userLiked && styles.likedCircle]}
                            onPress={() => handleInteract('like')}
                            activeOpacity={0.7}
                            disabled={!id || isInteracting}
                        >
                            <IconHeart
                                size={20}
                                color={id ? (metrics.userLiked ? "#FFD35A" : "#FFFFFF") : "#444"}
                                strokeWidth={metrics.userLiked ? 0 : 2.5}
                                fill={metrics.userLiked ? "#FFD35A" : "transparent"}
                            />
                        </TouchableOpacity>
                        <Text style={styles.actionCount}>{metrics.likes}</Text>
                    </View>

                    <View style={styles.actionItem}>
                        <TouchableOpacity
                            style={styles.actionCircle}
                            onPress={() => handleInteract('share')}
                            activeOpacity={0.7}
                            disabled={!id || isInteracting}
                        >
                            <IconShare size={20} color={id ? "#FFFFFF" : "#444"} strokeWidth={2.5} />
                        </TouchableOpacity>
                        <Text style={styles.actionCount}>{metrics.shares}</Text>
                    </View>

                    <View style={styles.actionItem}>
                        <TouchableOpacity
                            style={styles.actionCircle}
                            onPress={() => handleInteract('download')}
                            activeOpacity={0.7}
                            disabled={!id || isInteracting}
                        >
                            <IconDownload size={20} color={id ? "#FFFFFF" : "#444"} strokeWidth={2.5} />
                        </TouchableOpacity>
                        <Text style={styles.actionCount}>{metrics.downloads}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    verseCard: {
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: '#1A1A1A',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
    },
    captureContainer: {
        width: '100%',
        backgroundColor: '#1A1A1A',
    },
    verseBackground: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    verseOverlay: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    handleContainer: {
        alignItems: 'center',
        paddingTop: 8,
    },
    handle: {
        width: 32,
        height: 3,
        borderRadius: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    topSection: {
        paddingTop: 6,
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    badgeContainer: {
        alignItems: 'center',
        gap: 2,
        marginTop: 2,
    },
    verseLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#FFD35A',
        letterSpacing: 1.5,
        opacity: 0.75,
    },
    themeBadge: {
        backgroundColor: 'rgba(255, 211, 90, 0.12)',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 211, 90, 0.25)',
    },
    themeText: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#FFD35A',
        letterSpacing: 1,
    },
    verseContent: {
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 20,
    },
    mainTextContainer: {
        alignItems: 'center',
        marginBottom: 4,
    },
    verticalQuote: {
        fontSize: 28,
        color: '#FFD35A',
        opacity: 0.25,
        height: 20,
        lineHeight: 34,
        fontWeight: 'bold',
    },
    verseText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#FFFFFF',
        textAlign: 'center',
        fontWeight: '600',
        paddingHorizontal: 4,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    verseReference: {
        fontSize: 13,
        color: '#FFD35A',
        fontWeight: '700',
        marginBottom: 12,
        marginTop: 2,
        opacity: 0.85,
    },
    affirmationCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
        padding: 10,
        width: '100%',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.06)',
        marginBottom: 4,
    },
    affirmationTitle: {
        fontSize: 9,
        fontWeight: '900',
        color: 'rgba(255, 255, 255, 0.4)',
        letterSpacing: 1.2,
        marginBottom: 2,
        textAlign: 'center',
    },
    affirmationText: {
        fontSize: 12,
        lineHeight: 18,
        color: '#FFFFFF',
        textAlign: 'center',
        fontWeight: '500',
    },
    footerActions: {
        paddingBottom: 16,
        paddingTop: 8,
        backgroundColor: 'rgba(0,0,0,0.2)', // Visual separation for buttons
    },
    actionsContainer: {
        flexDirection: 'row',
        gap: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionItem: {
        alignItems: 'center',
        gap: 4,
    },
    actionCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.12)',
    },
    likedCircle: {
        backgroundColor: 'rgba(255, 211, 90, 0.15)',
        borderColor: 'rgba(255, 211, 90, 0.3)',
    },
    actionCount: {
        fontSize: 10,
        color: '#FFFFFF',
        fontWeight: 'bold',
        opacity: 0.8,
    },
});
