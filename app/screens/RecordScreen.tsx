import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { useAudioRecorder, useAudioRecorderState, AudioModule, RecordingPresets, setAudioModeAsync, requestRecordingPermissionsAsync } from 'expo-audio';
import { authService } from '../services/auth';
import { API_BASE_URL } from '../services/apiConfig';
import {
  IconMic, IconPlay, IconCheck, IconTrash, IconArrowLeft,
  IconSearch, IconCalendar, IconChevronRight, IconDownload
} from '../components/Icons';


type ViewState = 'LIST' | 'DETAIL' | 'RECORD';

interface Recording {
  id: string;
  title: string;
  date: string;
  duration: string;
  transcription?: string;
  summary?: string;
}

const RecordScreen: React.FC = () => {
  const [view, setView] = useState<ViewState>('LIST');
  const [selectedSermon, setSelectedSermon] = useState<Recording | null>(null);

  // Recorder State
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 500);
  const [duration, setDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isNewRecording, setIsNewRecording] = useState(true);

  // Mock Data
  const [sermons, setSermons] = useState<Recording[]>([]);

  // Fetch sermons from backend
  useEffect(() => {
    const fetchSermons = async () => {
      try {
        const token = await authService.getToken();
        const response = await fetch(`${API_BASE_URL}sermons`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const mappedSermons = data.map((s: any) => ({
            id: s.id.toString(),
            title: s.title,
            date: new Date(s.created_at).toLocaleDateString(),
            duration: '0:00',
            transcription: s.transcription,
            summary: s.summary
          }));
          setSermons(mappedSermons);
        }
      } catch (err) {
        console.error('Failed to fetch sermons:', err);
      }
    };

    fetchSermons();
  }, []);

  // Update local duration from recorder state
  useEffect(() => {
    if (recorderState.isRecording) {
      setDuration(Math.floor(recorderState.durationMillis / 1000));
    }
  }, [recorderState.durationMillis, recorderState.isRecording]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      setError(null);

      // Configure audio for recording
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
        interruptionMode: 'doNotMix',
      });

      // Request permissions
      const status = await requestRecordingPermissionsAsync();
      if (!status.granted) {
        setError('Microphone permission denied');
        return;
      }

      // Start recording
      await recorder.prepareToRecordAsync();
      recorder.record();
      setDuration(0);
      setIsNewRecording(false);
    } catch (err) {
      console.error('Failed to start recording', err);
      setError('Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    if (!recorderState.isRecording) return;

    try {
      await recorder.stop();
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  const handleProcess = async () => {
    if (!recorder.uri) return;

    setIsProcessing(true);
    setError(null);

    try {
      const uri = recorder.uri;
      const token = await authService.getToken();

      // Create form data for upload
      const formData = new FormData();
      formData.append('audio', {
        uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
        type: 'audio/m4a',
        name: 'sermon.m4a',
      } as any);
      formData.append('title', `Sermon ${new Date().toLocaleDateString()}`);

      const response = await fetch(`${API_BASE_URL}sermons`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMsg = result.details || result.error || 'Failed to process sermon';
        throw new Error(errorMsg);
      }

      setTranscription(result.transcription);
      setSummary(result.summary);

      // Auto-save to list
      const newRecording: Recording = {
        id: result.id.toString(),
        title: result.title,
        date: new Date(result.created_at).toLocaleDateString(),
        duration: formatTime(duration),
        transcription: result.transcription,
        summary: result.summary
      };
      setSermons([newRecording, ...sermons]);
    } catch (err: any) {
      console.error('Processing error:', err);
      setError(err.message || 'Failed to process audio. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setDuration(0);
    setTranscription(null);
    setSummary(null);
    setError(null);
    setIsNewRecording(true);
  };

  const handleDelete = () => {
    if (selectedSermon) {
      Alert.alert(
        'Delete Sermon',
        'Are you sure you want to delete this sermon?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              setSermons(sermons.filter(s => s.id !== selectedSermon.id));
              setSelectedSermon(null);
              setView('LIST');
            }
          }
        ]
      );
    }
  };

  // --- Views ---

  const renderListView = () => (
    <View style={styles.viewContainer}>
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Sermons</Text>
        <TouchableOpacity style={styles.searchButton}>
          <IconSearch size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.sermonsList} contentContainerStyle={styles.sermonsListContent}>
        {sermons.map(sermon => (
          <TouchableOpacity
            key={sermon.id}
            style={styles.sermonCard}
            onPress={() => { setSelectedSermon(sermon); setView('DETAIL'); }}
          >
            <View style={styles.sermonCardContent}>
              <View style={styles.sermonIcon}>
                <IconMic size={20} color="#E8503A" />
              </View>
              <View style={styles.sermonInfo}>
                <Text style={styles.sermonTitle}>{sermon.title}</Text>
                <View style={styles.sermonMeta}>
                  <IconCalendar size={12} color="#999999" />
                  <Text style={styles.sermonDate}>{sermon.date}</Text>
                  <Text style={styles.sermonDot}>•</Text>
                  <Text style={styles.sermonDuration}>{sermon.duration}</Text>
                </View>
              </View>
              <IconChevronRight size={20} color="#666666" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => { reset(); setView('RECORD'); }}
      >
        <IconMic size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  const renderDetailView = () => {
    if (!selectedSermon) return null;

    return (
      <View style={styles.viewContainer}>
        <View style={styles.detailHeader}>
          <TouchableOpacity onPress={() => setView('LIST')} style={styles.backButton}>
            <IconArrowLeft size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.detailTitle} numberOfLines={1}>{selectedSermon.title}</Text>
          <View style={styles.detailActions}>
            <TouchableOpacity onPress={handleDelete} style={styles.detailAction}>
              <IconTrash size={20} color="#999999" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.detailAction}>
              <IconDownload size={20} color="#999999" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.detailContent} contentContainerStyle={styles.detailContentPadding}>
          <View style={styles.playerCard}>
            <View style={styles.playerInfo}>
              <Text style={styles.playerDate}>{selectedSermon.date}</Text>
              <Text style={styles.playerDuration}>{selectedSermon.duration}</Text>
            </View>
            <TouchableOpacity style={styles.playButton}>
              <IconPlay size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.cardLabel}>KEY TAKEAWAYS</Text>
            <Text style={styles.summaryText}>{selectedSermon.summary || 'No summary available.'}</Text>
          </View>

          <View style={styles.transcriptionCard}>
            <Text style={styles.cardLabel}>TRANSCRIPTION</Text>
            <Text style={styles.transcriptionText}>{selectedSermon.transcription || 'No transcription available.'}</Text>
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderRecordView = () => (
    <View style={styles.viewContainer}>
      <View style={styles.recordHeader}>
        <TouchableOpacity onPress={() => { stopRecording(); setView('LIST'); }} style={styles.backButton}>
          <IconArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.recordTitle}>New Recording</Text>
      </View>

      <ScrollView style={styles.recordContent} contentContainerStyle={styles.recordContentPadding}>
        {/* Recording Area */}
        <View style={styles.recordingCard}>
          <View style={styles.timerDisplay}>
            <Text style={styles.timerText}>{formatTime(duration)}</Text>
          </View>

          {!recorderState.isRecording && isNewRecording && (
            <TouchableOpacity style={styles.recordButton} onPress={startRecording}>
              <IconMic size={32} color="#FFFFFF" />
            </TouchableOpacity>
          )}

          {recorderState.isRecording && (
            <TouchableOpacity style={styles.stopButton} onPress={stopRecording}>
              <View style={styles.stopIcon} />
            </TouchableOpacity>
          )}

          {!recorderState.isRecording && !isNewRecording && recorder.uri && !transcription && (
            <View style={styles.recordActions}>
              <TouchableOpacity onPress={reset} style={styles.deleteButton}>
                <IconTrash size={24} color="#999999" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleProcess}
                disabled={isProcessing}
                style={[styles.processButton, isProcessing && styles.processButtonDisabled]}
              >
                {isProcessing ? (
                  <Text style={styles.processButtonText}>Processing...</Text>
                ) : (
                  <>
                    <IconCheck size={20} color="#FFFFFF" />
                    <Text style={styles.processButtonText}>Analyze Sermon</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Results */}
        {(transcription || summary) && (
          <View style={styles.resultsContainer}>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>AI Sermon Summary</Text>
              <TouchableOpacity
                onPress={() => setView('LIST')}
                style={styles.doneButton}
              >
                <IconCheck size={14} color="#FFFFFF" />
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.cardLabel}>KEY TAKEAWAYS</Text>
              <Text style={styles.summaryText}>{summary}</Text>
            </View>

            <View style={styles.transcriptionCard}>
              <Text style={styles.cardLabel}>TRANSCRIPTION</Text>
              <Text style={styles.transcriptionText}>{transcription}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      {view === 'LIST' && renderListView()}
      {view === 'DETAIL' && renderDetailView()}
      {view === 'RECORD' && renderRecordView()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  viewContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 100,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  listTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#222222',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sermonsList: {
    flex: 1,
  },
  sermonsListContent: {
    gap: 16,
    paddingBottom: 80,
  },
  sermonCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  sermonCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  sermonIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(232, 80, 58, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sermonInfo: {
    flex: 1,
    gap: 4,
  },
  sermonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sermonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sermonDate: {
    fontSize: 12,
    color: '#999999',
  },
  sermonDot: {
    fontSize: 12,
    color: '#999999',
  },
  sermonDuration: {
    fontSize: 12,
    color: '#999999',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#E8503A',
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E8503A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
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
    paddingBottom: 24,
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8503A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E8503A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#222222',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 24,
  },
  progressFill: {
    width: '33%',
    height: '100%',
    backgroundColor: '#E8503A',
    borderRadius: 4,
  },
  summaryCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 24,
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
    color: '#FFD35A',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 22,
  },
  transcriptionText: {
    fontSize: 14,
    color: '#999999',
    lineHeight: 22,
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  recordTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  recordContent: {
    flex: 1,
  },
  recordContentPadding: {
    paddingBottom: 24,
  },
  recordingCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 24,
  },
  timerDisplay: {
    marginBottom: 48,
  },
  timerText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8503A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E8503A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  stopButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  stopIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#E8503A',
    borderRadius: 4,
  },
  recordActions: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'center',
  },
  deleteButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#222222',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processButton: {
    backgroundColor: '#E8503A',
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#E8503A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  processButtonDisabled: {
    opacity: 0.5,
  },
  processButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  errorCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
  },
  resultsContainer: {
    gap: 24,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  doneButton: {
    backgroundColor: '#E8503A',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  doneButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default RecordScreen;