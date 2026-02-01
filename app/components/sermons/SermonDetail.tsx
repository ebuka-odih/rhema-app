import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Sermon } from '../../types/sermon';
import { IconArrowLeft, IconTrash, IconPlay, IconDownload } from '../Icons';
import { TabNavigator } from './TabNavigator';
import { BibleReferenceHandler } from '../bible/BibleReferenceHandler';
import { BibleVerseModal } from '../bible/BibleVerseModal';

interface SermonDetailProps {
    sermon: Sermon;
    activeTab: 'SUMMARY' | 'TRANSCRIPTION';
    onBack: () => void;
    onDelete: () => void;
    onTabChange: (tab: 'SUMMARY' | 'TRANSCRIPTION') => void;
    onNavigateToBible?: (book: string, chapter: number) => void;
    onReprocess?: (id: string) => Promise<void>;
}

export const SermonDetail: React.FC<SermonDetailProps> = ({
    sermon,
    activeTab,
    onBack,
    onDelete,
    onTabChange,
    onNavigateToBible,
    onReprocess
}) => {
    const [selectedVerse, setSelectedVerse] = React.useState<string | null>(null);
    const [isProcessingInternal, setIsProcessingInternal] = React.useState(false);

    const handleReferencePress = (reference: string) => {
        setSelectedVerse(reference);
    };

    const handleReadFull = () => {
        if (!selectedVerse || !onNavigateToBible) return;
        const parts = selectedVerse.match(/^(.+?)\s+(\d+):(\d+)(?:-(\d+))?$/);
        if (parts) {
            const [_, book, chapter] = parts;
            onNavigateToBible(book, parseInt(chapter));
            setSelectedVerse(null);
        }
    };

    const handleRetryAnalysis = async () => {
        if (!onReprocess) return;
        setIsProcessingInternal(true);
        try {
            await onReprocess(sermon.id);
            Alert.alert('Analysis Started', 'We are reprocessing your sermon. The results will appear shortly.');
        } catch (err) {
            Alert.alert('Error', 'Failed to start reprocessing. Please try again later.');
        } finally {
            setIsProcessingInternal(false);
        }
    };

    return (
        <View style={styles.viewContainer}>
            <View style={styles.detailHeader}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <IconArrowLeft size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.detailTitle} numberOfLines={1}>{sermon.title}</Text>
                <View style={styles.detailActions}>
                    <TouchableOpacity
                        style={styles.detailAction}
                        onPress={() => Alert.alert("Coming Soon", "Downloading sermon audio will be available in the future.")}
                    >
                        <IconDownload size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onDelete} style={styles.detailAction}>
                        <IconTrash size={20} color="#E8503A" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.detailContent} contentContainerStyle={styles.detailContentPadding} showsVerticalScrollIndicator={false}>
                <View style={styles.playerCard}>
                    <View style={styles.playerInfo}>
                        <Text style={styles.playerDate}>{sermon.date}</Text>
                        <Text style={styles.playerDuration}>{sermon.duration}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.playButton}
                        onPress={() => Alert.alert("Coming Soon", "Audio playback for recorded sermons is coming soon!")}
                    >
                        <IconPlay size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                {sermon.status === 'processing' && (
                    <View style={styles.processingBar}>
                        <Text style={styles.processingText}>AI is currently analyzing this sermon...</Text>
                    </View>
                )}

                {sermon.status === 'failed' && (
                    <View style={styles.failedCard}>
                        <Text style={styles.failedText}>Transcription failed for this recording.</Text>
                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={handleRetryAnalysis}
                            disabled={isProcessingInternal}
                        >
                            <Text style={styles.retryButtonText}>
                                {isProcessingInternal ? 'Starting...' : 'Try Analysis Again'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.progressBar}>
                    <View style={styles.progressFill} />
                </View>

                <TabNavigator activeTab={activeTab} onTabChange={onTabChange} />

                {activeTab === 'SUMMARY' ? (
                    <View style={styles.summaryCard}>
                        <Text style={styles.cardLabel}>SUMMARY & KEY TAKEAWAYS</Text>
                        <BibleReferenceHandler
                            text={sermon.summary || 'No summary available.'}
                            onReferencePress={handleReferencePress}
                        />
                    </View>
                ) : (
                    <View style={styles.transcriptionCard}>
                        <Text style={styles.cardLabel}>SERMON TRANSCRIPT</Text>
                        <BibleReferenceHandler
                            text={sermon.transcription || 'No transcription available.'}
                            onReferencePress={handleReferencePress}
                        />
                    </View>
                )}
            </ScrollView>

            <BibleVerseModal
                visible={!!selectedVerse}
                reference={selectedVerse || ''}
                onClose={() => setSelectedVerse(null)}
                onReadFull={handleReadFull}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    viewContainer: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 0,
    },
    detailHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        gap: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: -8,
    },
    detailTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    detailActions: {
        flexDirection: 'row',
        gap: 8,
    },
    detailAction: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailContent: {
        flex: 1,
    },
    detailContentPadding: {
        paddingBottom: 120,
    },
    playerCard: {
        backgroundColor: '#1A1A1A',
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        marginBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    playerInfo: {
        gap: 8,
    },
    playerDate: {
        fontSize: 14,
        color: '#999999',
    },
    playerDuration: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    playButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#E8503A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressBar: {
        height: 4,
        backgroundColor: '#222222',
        borderRadius: 2,
        marginBottom: 32,
    },
    progressFill: {
        width: '30%',
        height: '100%',
        backgroundColor: '#E8503A',
        borderRadius: 2,
    },
    summaryCard: {
        backgroundColor: '#1A1A1A',
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        marginBottom: 16,
    },
    transcriptionCard: {
        backgroundColor: '#1A1A1A',
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    cardLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#E8503A',
        letterSpacing: 1,
        marginBottom: 16,
    },
    summaryText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#CCCCCC',
    },
    transcriptionText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#CCCCCC',
    },
    processingBar: {
        backgroundColor: 'rgba(232, 80, 58, 0.1)',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(232, 80, 58, 0.2)',
    },
    processingText: {
        color: '#E8503A',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    failedCard: {
        backgroundColor: 'rgba(232, 80, 58, 0.05)',
        padding: 24,
        borderRadius: 16,
        marginBottom: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: 'rgba(232, 80, 58, 0.3)',
    },
    failedText: {
        color: '#999999',
        fontSize: 14,
        marginBottom: 16,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#E8503A',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
});
