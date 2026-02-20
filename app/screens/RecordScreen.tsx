import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Platform, TouchableOpacity } from 'react-native';
import { setAudioModeAsync, requestRecordingPermissionsAsync } from 'expo-audio';
import { authService } from '../services/auth';
import { API_BASE_URL } from '../services/apiConfig';
import { useRecording } from '../context/RecordingContext';
import { IconPlus } from '../components/Icons';
import { useSubscription } from '../context/SubscriptionContext';

// Types
import { ViewState, Sermon } from '../types/sermon';

// Components
import { SermonList } from '../components/sermons/SermonList';
import { SermonDetail } from '../components/sermons/SermonDetail';
import { SermonRecorder } from '../components/sermons/SermonRecorder';
import { RecordingPaywall } from '../components/sermons/RecordingPaywall';

interface RecordScreenProps {
  onNavigateToBible?: (book: string, chapter: number, verse?: number) => void;
  onNavigateToSubscription?: () => void;
}

const RecordScreen: React.FC<RecordScreenProps> = ({ onNavigateToBible, onNavigateToSubscription }) => {
  const {
    isPro,
    isRevenueCatSupported,
    isRevenueCatReady,
    presentPaywallIfNeeded,
    isPaywallPurchaseResult,
    isUserCancelled,
    getErrorMessage,
  } = useSubscription();

  const {
    recorder,
    isRecording,
    duration,
    levels,
    startRecording,
    stopRecording,
    resetRecorder,
    isNewRecording,
  } = useRecording();

  const [view, setView] = useState<ViewState>(isRecording ? 'RECORD' : 'LIST');
  const [selectedSermon, setSelectedSermon] = useState<Sermon | null>(null);

  // Limits
  const MAX_DURATION = isPro ? 3000 : 600; // 50 mins vs 10 mins
  const DAILY_LIMIT = isPro ? 5 : 3;
  const FREE_DAILY_LIMIT = 3;

  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sermonTitle, setSermonTitle] = useState('');
  const [currentSermonId, setCurrentSermonId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'SUMMARY' | 'TRANSCRIPTION'>('SUMMARY');

  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [isLoadingSermons, setIsLoadingSermons] = useState(false);
  const [paywallMode, setPaywallMode] = useState<'LAST_FREE' | 'LIMIT_REACHED' | null>(null);

  // Sync view with global recording state
  useEffect(() => {
    if (isRecording && view === 'LIST') {
      setView('RECORD');
    }
  }, [isRecording]);

  // Fetch sermons from backend
  useEffect(() => {
    if (view === 'LIST') {
      fetchSermons();
    }
  }, [view]);

  const fetchSermons = async () => {
    setIsLoadingSermons(true);
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
          createdAt: s.created_at,
          duration: s.duration_seconds ? formatTime(s.duration_seconds) : '0:00',
          transcription: s.transcription,
          summary: s.summary,
          status: s.status
        }));
        setSermons(mappedSermons);
      }
    } catch (err) {
      console.error('Failed to fetch sermons:', err);
    } finally {
      setIsLoadingSermons(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getNextFreeRecordingResetAt = () => {
    const now = new Date();
    const nextReset = new Date(now);
    nextReset.setHours(24, 0, 0, 0);
    return nextReset.getTime();
  };

  const isSermonFromToday = (sermon: Sermon) => {
    if (sermon.createdAt) {
      return new Date(sermon.createdAt).toDateString() === new Date().toDateString();
    }
    return sermon.date === new Date().toLocaleDateString();
  };

  const getTodayRecordingCount = () => sermons.filter(isSermonFromToday).length;

  const startNewRecording = () => {
    reset();
    setView('RECORD');
  };

  const navigateToSubscription = async () => {
    if (isRevenueCatSupported && isRevenueCatReady) {
      try {
        const paywallResult = await presentPaywallIfNeeded();
        if (isPaywallPurchaseResult(paywallResult)) {
          Alert.alert('Success', 'Rhema Daily Pro is now active.');
          return;
        }
      } catch (err) {
        if (!isUserCancelled(err)) {
          Alert.alert('Upgrade Error', getErrorMessage(err));
        }
      }
    }

    if (onNavigateToSubscription) {
      onNavigateToSubscription();
      return;
    }
    Alert.alert('Upgrade to Pro', 'Open Profile > Subscription Plan to upgrade and unlock more recording time.');
  };

  const showThirdRecordingPaywall = () => setPaywallMode('LAST_FREE');
  const showDailyLimitPaywall = () => setPaywallMode('LIMIT_REACHED');

  const handleCreateRecordingPress = () => {
    const todayCount = getTodayRecordingCount();

    if (!isPro) {
      if (todayCount >= FREE_DAILY_LIMIT) {
        showDailyLimitPaywall();
        return;
      }
      if (todayCount === FREE_DAILY_LIMIT - 1) {
        showThirdRecordingPaywall();
        return;
      }
    }

    if (todayCount >= DAILY_LIMIT) {
      Alert.alert('Daily Limit Reached', `You have reached your daily limit of ${DAILY_LIMIT} recordings.`);
      return;
    }

    startNewRecording();
  };

  const handleStartRecording = async () => {
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

      await startRecording();
    } catch (err) {
      console.error('Failed to start recording', err);
      setError('Failed to start recording. Please try again.');
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
      formData.append('duration_seconds', duration.toString());

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

      const newRecording: Sermon = {
        id: result.id.toString(),
        title: result.title,
        date: new Date(result.created_at).toLocaleDateString(),
        createdAt: result.created_at,
        duration: formatTime(duration),
        transcription: result.transcription,
        summary: result.summary,
        status: result.status
      };

      if (response.status === 202) {
        setSermons(prev => [newRecording, ...prev]);
        Alert.alert(
          'Processing Delayed',
          'Your audio was saved, but the analysis is taking longer than expected. You can find it in your list and try analyzing it again later.',
          [{ text: 'OK', onPress: () => setView('LIST') }]
        );
        reset();
        return;
      }

      if (!response.ok) {
        if (response.status === 403) {
          if ((result?.error || '').toLowerCase().includes('daily limit')) {
            showDailyLimitPaywall();
          } else {
            Alert.alert(result.error || 'Limit Reached', result.details);
          }
        }
        throw new Error(result.details || result.error || 'Failed to process sermon');
      }

      setTranscription(result.transcription);
      setSummary(result.summary);
      setCurrentSermonId(result.id.toString());
      setSermonTitle(result.title);

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
        body: JSON.stringify({
          title: sermonTitle,
          transcription: transcription,
          summary: summary
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        Alert.alert('Save Failed', errorData.error || 'Could not save sermon changes.');
        return;
      }

      setSermons(prev => prev.map(s =>
        s.id === currentSermonId ? {
          ...s,
          title: sermonTitle,
          transcription: transcription || s.transcription,
          summary: summary || s.summary
        } : s
      ));

      setView('LIST');
      await fetchSermons();
      reset();
      Alert.alert('Saved', 'Your sermon summary has been saved successfully.');
    } catch (err) {
      console.error('Final save error:', err);
      Alert.alert('Error', 'An unexpected error occurred while saving.');
    }
  };

  const reset = () => {
    resetRecorder();
    setTranscription(null);
    setSummary(null);
    setError(null);
    setSermonTitle('');
    setCurrentSermonId(null);
    setActiveTab('SUMMARY');
  };

  const handleDiscardRecording = async () => {
    if (!currentSermonId) {
      reset();
      return;
    }

    Alert.alert('Discard Analysis', 'Are you sure you want to delete this recording and its analysis?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await authService.getToken();
            await fetch(`${API_BASE_URL}sermons/${currentSermonId}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
              },
            });
            setSermons(prev => prev.filter(s => s.id !== currentSermonId));
            reset();
          } catch (err) {
            console.error('Discard error:', err);
            reset();
          }
        }
      }
    ]);
  };

  const handleReprocess = async (id: string) => {
    try {
      const token = await authService.getToken();
      const response = await fetch(`${API_BASE_URL}sermons/${id}/reprocess`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      const result = await response.json();
      if (response.ok) {
        const updatedSermon: Sermon = {
          id: result.id.toString(),
          title: result.title,
          date: new Date(result.created_at).toLocaleDateString(),
          duration: formatTime(result.duration_seconds),
          transcription: result.transcription,
          summary: result.summary,
          status: result.status
        };

        setSermons(prev => prev.map(s => s.id === id ? updatedSermon : s));
        setSelectedSermon(updatedSermon);
      } else {
        throw new Error(result.error || 'Reprocessing failed');
      }
    } catch (err: any) {
      console.error('Reprocess error:', err);
      throw err;
    }
  };

  const handleDelete = () => {
    if (!selectedSermon) return;
    Alert.alert('Delete Sermon', 'Are you sure you want to permanently delete this sermon?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await authService.getToken();
            const response = await fetch(`${API_BASE_URL}sermons/${selectedSermon.id}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
              },
            });

            if (response.ok) {
              setSermons(prev => prev.filter(s => s.id !== selectedSermon.id));
              setSelectedSermon(null);
              setView('LIST');
              Alert.alert('Deleted', 'Sermon has been removed.');
            } else {
              Alert.alert('Error', 'Failed to delete sermon from server.');
            }
          } catch (err) {
            console.error('Delete error:', err);
            Alert.alert('Error', 'A network error occurred.');
          }
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
            isLoading={isLoadingSermons}
            onSelectSermon={(sermon) => { setSelectedSermon(sermon); setView('DETAIL'); }}
          />
          <TouchableOpacity style={styles.fab} onPress={() => {
            handleCreateRecordingPress();
          }}>
            <IconPlus size={32} color="#FFFFFF" />
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
          onNavigateToBible={onNavigateToBible}
          onReprocess={handleReprocess}
        />
      )}

      {view === 'RECORD' && (
        <SermonRecorder
          isRecording={isRecording}
          duration={duration}
          levels={levels}
          isNewRecording={isNewRecording}
          isProcessing={isProcessing}
          transcription={transcription}
          summary={summary}
          error={error}
          sermonTitle={sermonTitle}
          activeTab={activeTab}
          maxDuration={MAX_DURATION}
          isPro={isPro}
          formatTime={formatTime}
          onStartRecording={handleStartRecording}
          onStopRecording={stopRecording}
          onReset={handleDiscardRecording}
          onProcess={handleProcess}
          onSaveAndFinish={handleSaveAndFinish}
          onTitleChange={setSermonTitle}
          onTabChange={setActiveTab}
          onBack={() => { setView('LIST'); }}
          onNavigateToBible={onNavigateToBible}
        />
      )}

      <RecordingPaywall
        visible={!!paywallMode}
        mode={paywallMode || 'LIMIT_REACHED'}
        freeLimit={FREE_DAILY_LIMIT}
        usedToday={getTodayRecordingCount()}
        resetAt={getNextFreeRecordingResetAt()}
        onClose={() => setPaywallMode(null)}
        onUpgrade={() => {
          setPaywallMode(null);
          void navigateToSubscription();
        }}
        onContinueFree={paywallMode === 'LAST_FREE'
          ? () => {
            setPaywallMode(null);
            startNewRecording();
          }
          : undefined
        }
      />
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
