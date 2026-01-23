import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Share, Platform, Alert, ActivityIndicator } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import * as Clipboard from 'expo-clipboard';
import { IconArrowLeft, IconShare, IconDownload, IconCopy } from '../components/Icons';
import { Logo } from '../components/Logo';

interface QRCodeScreenProps {
    onBack: () => void;
}

const QRCodeScreen: React.FC<QRCodeScreenProps> = ({ onBack }) => {
    const viewShotRef = useRef<any>(null);
    const [loading, setLoading] = useState(false);

    // The URL that leads to the Welcome Page
    // TODO: Replace with the actual production URL
    const APP_URL = "https://nyem.app";

    const handleShare = async () => {
        try {
            setLoading(true);
            const uri = await viewShotRef.current.capture();

            if (Platform.OS === 'web') {
                // Web handling for sharing/downloading
                const link = document.createElement('a');
                link.download = 'nyem-qrcode.png';
                link.href = uri;
                link.click();
            } else {
                // Native handling
                if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(uri);
                } else {
                    Alert.alert("Error", "Sharing is not available on this device");
                }
            }
        } catch (error) {
            console.error("Error sharing QR code:", error);
            Alert.alert("Error", "Failed to share QR code");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        try {
            setLoading(true);
            const uri = await viewShotRef.current.capture();

            if (Platform.OS === 'web') {
                const link = document.createElement('a');
                link.download = 'nyem-qrcode.png';
                link.href = uri;
                link.click();
                return;
            }

            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status === 'granted') {
                await MediaLibrary.saveToLibraryAsync(uri);
                Alert.alert("Success", "QR Code saved to gallery!");
            } else {
                Alert.alert("Permission Required", "Please allow access to photos to save the QR code.");
            }
        } catch (error) {
            console.error("Error saving QR code:", error);
            Alert.alert("Error", "Failed to save QR code");
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = async () => {
        await Clipboard.setStringAsync(APP_URL);
        Alert.alert("Success", "Link copied to clipboard!");
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <IconArrowLeft size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Share Nyem</Text>
                <View style={{ width: 40 }} /> {/* Spacer for alignment */}
            </View>

            <View style={styles.content}>
                <Text style={styles.description}>
                    Scan to visit the Welcome Page
                </Text>

                <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1.0 }} style={styles.cardContainer}>
                    <View style={styles.card}>
                        <View style={styles.logoContainer}>
                            <Logo size={48} />
                        </View>

                        <View style={styles.qrContainer}>
                            <QRCode
                                value={APP_URL}
                                size={200}
                                color="black"
                                backgroundColor="white"
                                logoSize={40}
                                logoBackgroundColor='transparent'
                            />
                        </View>

                        <Text style={styles.appName}>Nyem</Text>
                        <Text style={styles.appTagline}>Reflect. Grow. Flow.</Text>
                        <Text style={styles.urlText}>{APP_URL}</Text>
                    </View>
                </ViewShot>

                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleShare}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#000" />
                        ) : (
                            <>
                                <IconShare size={20} color="#000" />
                                <Text style={styles.actionButtonText}>Share</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.secondaryAction]}
                        onPress={handleCopyLink}
                    >
                        <IconCopy size={20} color="#FFF" />
                        <Text style={styles.secondaryActionText}>Copy Link</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.downloadLink}
                    onPress={handleDownload}
                    disabled={loading}
                >
                    <Text style={styles.downloadLinkText}>Save Image to Gallery</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D0D0D',
        position: 'relative',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60, // Adjust for status bar
        paddingBottom: 20,
    },
    backButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    description: {
        color: '#999999',
        fontSize: 16,
        marginBottom: 30,
        textAlign: 'center',
    },
    cardContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        padding: 10,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 30,
        alignItems: 'center',
        width: '100%',
        maxWidth: 320,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
    },
    logoContainer: {
        marginBottom: 20,
    },
    qrContainer: {
        padding: 10,
        backgroundColor: 'white',
        borderRadius: 10,
        marginBottom: 20,
    },
    appName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 4,
    },
    appTagline: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 16,
    },
    urlText: {
        fontSize: 12,
        color: '#999999',
    },
    actions: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 40,
        width: '100%',
        maxWidth: 320,
        marginBottom: 20,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#FFFFFF',
        paddingVertical: 16,
        borderRadius: 30,
    },
    actionButtonText: {
        color: '#000000',
        fontWeight: 'bold',
        fontSize: 16,
    },
    secondaryAction: {
        backgroundColor: '#1A1A1A',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    secondaryActionText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    downloadLink: {
        padding: 16,
    },
    downloadLinkText: {
        color: '#666666',
        fontSize: 14,
        textDecorationLine: 'underline',
    },
});

export default QRCodeScreen;
