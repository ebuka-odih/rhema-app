import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Platform, TouchableOpacity } from 'react-native';
import { useAudioRecorder, useAudioRecorderState, RecordingPresets, setAudioModeAsync, requestRecordingPermissionsAsync } from 'expo-audio';
import { authService } from '../services/auth';
import { API_BASE_URL } from '../services/apiConfig';
import { IconMic } from '../components/Icons';

// Types
import { ViewState, Sermon } from '../types/sermon';

// Components
import { SermonList } from '../components/sermons/SermonList';
import { SermonDetail } from '../components/sermons/SermonDetail';
import { SermonRecorder } from '../components/sermons/SermonRecorder';

const RecordScreen: React.FC = () => {
  const [view, setView] = useState<ViewState>('LIST');
  const [selectedSermon, setSelectedSermon] = useState<Sermon | null>(null);

  // Recorder State
  const recorder = useAudioRecorder({
    ...RecordingPresets.HIGH_QUALITY,
    isMeteringEnabled: true,
  });
  const recorderState = useAudioRecorderState(recorder, 50);
  const [levels, setLevels] = useState<number[]>(new Array(40).fill(-60));
  const [duration, setDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isNewRecording, setIsNewRecording] = useState(true);
  const [sermonTitle, setSermonTitle] = useState('');
  const [currentSermonId, setCurrentSermonId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'SUMMARY' | 'TRANSCRIPTION'>('SUMMARY');

  const [sermons, setSermons] = useState<Sermon[]>([]);

  // Fetch sermons from backend
  useEffect(() => {
    fetchSermons();
  }, []);

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
          duration: '0:00', // Backend doesn't store duration yet
          transcription: s.transcription,
          summary: s.summary
        }));
        setSermons(mappedSermons);
      }
    } catch (err) {
      console.error('Failed to fetch sermons:', err);
    }
  };

  // Update local duration and levels from recorder state
  useEffect(() => {
    if (recorderState.isRecording) {
      setDuration(Math.floor(recorderState.durationMillis / 1000));
      if (recorderState.metering !== undefined) {
        setLevels(prev => {
          const newLevel = recorderState.metering!;
          const next = [...prev];
          next.shift();
          next.push(newLevel);
          return next;
        });
      }
    } else {
      setLevels(new Array(40).fill(-60));
    }
  }, [recorderState.durationMillis, recorderState.isRecording, recorderState.metering]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      setError(null);
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
        interruptionMode: 'doNotMix',
      });

      const status = await requestRecordingPermissionsAsync();
      if (!status.granted) {
        setError('Microphone permission denied');
        return;
      }

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
        throw new Error(result.details || result.error || 'Failed to process sermon');
      }

      setTranscription(result.transcription);
      setSummary(result.summary);
      setCurrentSermonId(result.id.toString());
      setSermonTitle(result.title);

      const newRecording: Sermon = {
        id: result.id.toString(),
        title: result.title,
        date: new Date(result.created_at).toLocaleDateString(),
        duration: formatTime(duration),
        transcription: result.transcription,
        summary: result.summary
      };
      setSermons(prev => [newRecording, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Failed to process audio.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveAndFinish = async () => {
    if (!currentSermonId) {
      setView('LIST');
      return;
    }
    try {
      const token = await authService.getToken();
      const response = await fetch(`${API_BASE_URL}sermons/${currentSermonId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: sermonTitle }),
      });

      if (response.ok) {
        setSermons(prev => prev.map(s =>
          s.id === currentSermonId ? { ...s, title: sermonTitle } : s
        ));
      }

      setView('LIST');
      reset();
      fetchSermons(); // Re-sync
    } catch (err) {
      setView('LIST');
      reset();
    }
  };

  const reset = () => {
    setDuration(0);
    setTranscription(null);
    setSummary(null);
    setError(null);
    setIsNewRecording(true);
    setSermonTitle('');
    setCurrentSermonId(null);
    setActiveTab('SUMMARY');
  };

  const handleDelete = () => {
    if (!selectedSermon) return;
    Alert.alert('Delete Sermon', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setSermons(sermons.filter(s => s.id !== selectedSermon.id));
          setSelectedSermon(null);
          setView('LIST');
          // Should also call backend delete here eventually
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      {view === 'LIST' && (
        <View style={{ flex: 1 }}>
          <SermonList
            sermons={sermons}
            onSelectSermon={(sermon) => { setSelectedSermon(sermon); setView('DETAIL'); }}
          />
          <TouchableOpacity style={styles.fab} onPress={() => { reset(); setView('RECORD'); }}>
            <IconMic size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      {view === 'DETAIL' && selectedSermon && (
        <SermonDetail
          sermon={selectedSermon}
          activeTab={activeTab}
          onBack={() => setView('LIST')}
          onDelete={handleDelete}
          onTabChange={setActiveTab}
        />
      )}

      {view === 'RECORD' && (
        <SermonRecorder
          isRecording={recorderState.isRecording}
          duration={duration}
          levels={levels}
          isNewRecording={isNewRecording}
          isProcessing={isProcessing}
          transcription={transcription}
          summary={summary}
          error={error}
          sermonTitle={sermonTitle}
          activeTab={activeTab}
          formatTime={formatTime}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
          onReset={reset}
          onProcess={handleProcess}
          onSaveAndFinish={handleSaveAndFinish}
          onTitleChange={setSermonTitle}
          onTabChange={setActiveTab}
          onBack={() => { stopRecording(); setView('LIST'); }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
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
});

export default RecordScreen;