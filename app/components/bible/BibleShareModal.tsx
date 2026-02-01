import React, { useRef, useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Image, Platform, Share, ActivityIndicator, Dimensions } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { IconShare, IconClose } from '../Icons';

const { width } = Dimensions.get('window');

interface BibleShareModalProps {
    visible: boolean;
    onClose: () => void;
    text: string;
    reference: string;
    version: string;
}

const STOCK_BACKGROUNDS = [
    "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1448375240586-dfd8d395ea6c?auto=format&fit=crop&w=800&q=80",
];

export const BibleShareModal: React.FC<BibleShareModalProps> = ({
    visible, onClose, text, reference, version
}) => {
    const viewRef = useRef<View>(null);
    const [isSharing, setIsSharing] = useState(false);
    const [bgIndex, setBgIndex] = useState(0);

    const handleShare = async () => {
        if (isSharing) return;
        setIsSharing(true);
        try {
            const uri = await captureRef(viewRef, {
                format: 'png',
                quality: 0.9,
                result: 'tmpfile'
            });

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri);
            } else {
                await Share.share({ url: uri, message: `"${text}" - ${reference} via Rhema App` });
            }
        } catch (err) {
            console.error('Share capture error:', err);
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Share Scripture</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <IconClose size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.previewContainer}>
                        {/* The part that will be captured as an image */}
                        <View ref={viewRef} collapsable={false} style={styles.shareCard}>
                            <Image
                                source={{ uri: STOCK_BACKGROUNDS[bgIndex] }}
                                style={styles.cardBackground}
                            />
                            <View style={styles.cardOverlay} />

                            <View style={styles.cardContent}>
                                <Text style={styles.quoteMark}>"</Text>
                                <Text style={styles.scriptureText} numberOfLines={8}>
                                    {text}
                                </Text>
                                <Text style={styles.referenceText}>
                                    {reference} • {version}
                                </Text>

                                <View style={styles.cardFooter}>
                                    <View style={styles.footerLine} />
                                    <Text style={styles.footerBrand}>RHEMA DAILY</Text>
                                    <View style={styles.footerLine} />
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={styles.controls}>
                        <Text style={styles.controlLabel}>Change Background</Text>
                        <View style={styles.bgSelector}>
                            {STOCK_BACKGROUNDS.map((bg, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    style={[styles.bgThumb, bgIndex === idx && styles.activeBgThumb]}
                                    onPress={() => setBgIndex(idx)}
                                >
                                    <Image source={{ uri: bg }} style={styles.thumbImage} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.shareBtn, isSharing && styles.shareBtnDisabled]}
                        onPress={handleShare}
                        disabled={isSharing}
                    >
                        {isSharing ? (
                            <ActivityIndicator color="#000000" />
                        ) : (
                            <>
                                <IconShare size={20} color="#000000" />
                                <Text style={styles.shareBtnText}>Share as Image</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: width * 0.9,
        backgroundColor: '#1A1A1A',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    closeBtn: {
        padding: 4,
    },
    previewContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    shareCard: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#222',
    },
    cardBackground: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    cardOverlay: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    cardContent: {
        flex: 1,
        padding: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quoteMark: {
        fontSize: 48,
        color: '#FFD35A',
        fontWeight: 'bold',
        marginBottom: -20,
        opacity: 0.6,
    },
    scriptureText: {
        fontSize: 18,
        color: '#FFFFFF',
        textAlign: 'center',
        lineHeight: 26,
        fontWeight: '600',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    referenceText: {
        fontSize: 14,
        color: '#FFD35A',
        fontWeight: '700',
        marginTop: 20,
        opacity: 0.9,
    },
    cardFooter: {
        position: 'absolute',
        bottom: 24,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    footerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    footerBrand: {
        fontSize: 10,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 2,
        marginHorizontal: 12,
        opacity: 0.6,
    },
    controls: {
        marginBottom: 24,
    },
    controlLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#666666',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    bgSelector: {
        flexDirection: 'row',
        gap: 12,
    },
    bgThumb: {
        width: 50,
        height: 50,
        borderRadius: 10,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    activeBgThumb: {
        borderColor: '#FFD35A',
    },
    thumbImage: {
        width: '100%',
        height: '100%',
    },
    shareBtn: {
        backgroundColor: '#FFD35A',
        flexDirection: 'row',
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    shareBtnDisabled: {
        opacity: 0.5,
    },
    shareBtnText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#000000',
    },
});
