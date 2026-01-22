import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { JournalEntry, Prayer } from '../types';
import { authService } from '../services/auth';
import { API_BASE_URL } from '../services/apiConfig';

// Extracted Components
import { JourneyHome } from '../components/journey/JourneyHome';
import { JournalList } from '../components/journey/JournalList';
import { JournalEditor } from '../components/journey/JournalEditor';
import { GrowthTracker } from '../components/journey/GrowthTracker';
import { PrayerLog } from '../components/journey/PrayerLog';
import { Fasting } from '../components/journey/Fasting';
import { notificationService } from '../services/notificationService';

type JourneyView = 'home' | 'journal_list' | 'journal_editor' | 'growth' | 'prayer_log' | 'fasting';

interface JourneyScreenProps {
  onNavigateGlobal?: (tab: string) => void;
  onEditorStateChange?: (isOpen: boolean) => void;
}

const JourneyScreen: React.FC<JourneyScreenProps> = ({ onNavigateGlobal, onEditorStateChange }) => {
  const [currentView, setCurrentView] = useState<JourneyView>('home');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [journalTitle, setJournalTitle] = useState('');
  const [journalContent, setJournalContent] = useState('');
  const [prayerRequest, setPrayerRequest] = useState('');
  const [prayerTime, setPrayerTime] = useState('08:00 AM');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [selectedPrayer, setSelectedPrayer] = useState<Prayer | null>(null);

  const [reflections, setReflections] = useState<JournalEntry[]>([]);
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Notify parent when editor opens/closes
  useEffect(() => {
    onEditorStateChange?.(currentView === 'journal_editor');
  }, [currentView, onEditorStateChange]);

  // Fetch Data
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchReflections(),
      fetchPrayers()
    ]);
    setIsLoading(false);
  };

  const fetchReflections = async () => {
    try {
      const token = await authService.getToken();
      const response = await fetch(`${API_BASE_URL}reflections`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        const mapped = data.map((item: any) => ({
          id: item.id.toString(),
          title: item.title,
          content: item.content,
          date: new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          category: item.category || 'Devotion'
        }));
        setReflections(mapped);
      }
    } catch (err) {
      console.error('Fetch reflections error:', err);
    }
  };

  const fetchPrayers = async () => {
    try {
      const token = await authService.getToken();
      const response = await fetch(`${API_BASE_URL}prayers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPrayers(data);

        // Update specific prayer state if one is active but local state is empty
        if (data.length > 0 && !prayerRequest) {
          const active = data.find((p: Prayer) => p.status === 'active');
          if (active) {
            setPrayerRequest(active.request);
            setPrayerTime(active.time);
            setReminderEnabled(active.reminder_enabled);
          }
        }
      }
    } catch (err) {
      console.error('Fetch prayers error:', err);
    }
  };



  const handleSelectEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setJournalTitle(entry.title);
    setJournalContent(entry.content);
    setCurrentView('journal_editor');
  };

  const handleNewReflection = () => {
    setSelectedEntry(null);
    setJournalTitle('');
    setJournalContent('');
    setCurrentView('journal_editor');
  };

  const handleEditPrayer = (prayer: Prayer) => {
    setSelectedPrayer(prayer);
    setPrayerRequest(prayer.request);
    setPrayerTime(prayer.time);
    setReminderEnabled(prayer.reminder_enabled);
    setCurrentView('prayer_log');
  };

  const handleNewPrayer = () => {
    setSelectedPrayer(null);
    setPrayerRequest('');
    setPrayerTime('08:00 AM');
    setReminderEnabled(false);
    setCurrentView('prayer_log');
  };

  const handleSaveReflection = async (category: string) => {
    if (!journalTitle) {
      Alert.alert('Missing Title', 'Please provide a title for your note.');
      return;
    }

    try {
      const token = await authService.getToken();
      const isUpdate = !!selectedEntry;
      const url = isUpdate
        ? `${API_BASE_URL}reflections/${selectedEntry.id}`
        : `${API_BASE_URL}reflections`;

      const response = await fetch(url, {
        method: isUpdate ? 'PATCH' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: journalTitle,
          content: journalContent,
          category: category
        }),
      });

      if (response.ok) {
        fetchReflections();
        setCurrentView('home');
        setSelectedEntry(null);
      } else {
        Alert.alert('Error', 'Failed to save reflection.');
      }
    } catch (err) {
      console.error('Save reflection error:', err);
      Alert.alert('Error', 'Network error occurred.');
    }
  };

  const handleDeleteReflection = async () => {
    if (!selectedEntry) return;

    Alert.alert('Delete Reflection', 'Are you sure you want to permanently delete this? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await authService.getToken();
            const response = await fetch(`${API_BASE_URL}reflections/${selectedEntry.id}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
              },
            });

            if (response.ok) {
              fetchReflections();
              setCurrentView('home');
              setSelectedEntry(null);
            } else {
              Alert.alert('Error', 'Failed to delete reflection.');
            }
          } catch (err) {
            console.error('Delete reflection error:', err);
            Alert.alert('Error', 'Network error occurred.');
          }
        }
      }
    ]);
  };

  const handleSavePrayer = async (status: string) => {
    if (!prayerRequest) {
      Alert.alert('Missing Info', 'Please enter your prayer request.');
      return;
    }

    try {
      const token = await authService.getToken();
      const isUpdate = !!selectedPrayer;
      const url = isUpdate
        ? `${API_BASE_URL}prayers/${selectedPrayer.id}`
        : `${API_BASE_URL}prayers`;

      const response = await fetch(url, {
        method: isUpdate ? 'PATCH' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          request: prayerRequest,
          time: prayerTime,
          reminder_enabled: reminderEnabled,
          status: status
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok) {
        const prayerId = isUpdate ? selectedPrayer.id : result.id;

        if (reminderEnabled && status === 'active') {
          try {
            const [time, period] = prayerTime.split(' ');
            let [hour, minute] = time.split(':').map(Number);
            if (period === 'PM' && hour < 12) hour += 12;
            if (period === 'AM' && hour === 12) hour = 0;

            // Set notification with vibration and sound
            await notificationService.schedulePrayerReminder(prayerId, hour, minute, prayerRequest);
          } catch (notifErr) {
            console.error('Failed to schedule notification:', notifErr);
          }
        } else {
          // Cancel if disabled or marked as done
          await notificationService.cancelPrayerReminder(prayerId);
        }

        fetchPrayers(); // Refresh the list

        Alert.alert(
          isUpdate ? 'Prayer Reminder Updated' : 'Prayer Reminder Created',
          isUpdate ? 'Your prayer reminder has been updated.' : 'Your prayer reminder has been logged successfully.',
          [
            {
              text: 'Done',
              onPress: () => {
                setPrayerRequest('');
                setSelectedPrayer(null);
                setCurrentView('home');
              }
            },
            ...(!isUpdate ? [{
              text: 'Add Another',
              style: 'cancel' as const,
              onPress: () => {
                setPrayerRequest('');
                setSelectedPrayer(null);
              }
            }] : [])
          ]
        );
      } else {
        Alert.alert('Error', result.message || result.error || 'Failed to save prayer reminder.');
      }
    } catch (error) {
      console.error('Failed to save prayer:', error);
      Alert.alert('Error', 'Network error occurred. Please check your connection.');
    }
  };

  const handleTogglePrayerStatus = async (id: string, currentStatus: string) => {
    try {
      const token = await authService.getToken();
      const newStatus = currentStatus === 'active' ? 'done' : 'active';
      const response = await fetch(`${API_BASE_URL}prayers/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Manage notifications on toggle
        const updatedPrayer = prayers.find(p => p.id === id);
        if (updatedPrayer) {
          if (newStatus === 'done') {
            await notificationService.cancelPrayerReminder(id);
          } else if (newStatus === 'active' && updatedPrayer.reminder_enabled) {
            try {
              const [time, period] = updatedPrayer.time.split(' ');
              let [hour, minute] = time.split(':').map(Number);
              if (period === 'PM' && hour < 12) hour += 12;
              if (period === 'AM' && hour === 12) hour = 0;
              await notificationService.schedulePrayerReminder(id, hour, minute, updatedPrayer.request);
            } catch (e) {
              console.error('Toggle notification error:', e);
            }
          }
        }
        fetchPrayers();
      }
    } catch (err) {
      console.error('Toggle prayer status error:', err);
    }
  };

  const handleRemovePrayer = async (id: string | number) => {
    Alert.alert('Delete Prayer Reminder', 'Are you sure you want to delete this prayer reminder?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          // Optimistic update
          const originalPrayers = [...prayers];
          setPrayers(prev => prev.filter(p => p.id.toString() !== id.toString()));

          try {
            const token = await authService.getToken();
            const response = await fetch(`${API_BASE_URL}prayers/${id}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
              },
            });

            if (response.ok) {
              await notificationService.cancelPrayerReminder(id);
              fetchPrayers();
            } else {
              setPrayers(originalPrayers);
              Alert.alert('Error', 'Failed to delete prayer reminder. Please try again.');
            }
          } catch (err) {
            console.error('Delete prayer error:', err);
            // Rollback if failure
            setPrayers(originalPrayers);
            Alert.alert('Error', 'Network error occurred. Please check your connection.');
          }
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      {currentView === 'home' && (
        <JourneyHome
          onNavigateGlobal={onNavigateGlobal}
          onViewAllReflections={() => setCurrentView('journal_list')}
          onViewGrowth={() => setCurrentView('growth')}
          onNewReflection={handleNewReflection}
          onLogPrayer={handleNewPrayer}
          onEditPrayer={handleEditPrayer}
          onViewFasting={() => setCurrentView('fasting')}
          onSelectEntry={handleSelectEntry}
          onTogglePrayerStatus={handleTogglePrayerStatus}
          onRemovePrayer={handleRemovePrayer}
          journalEntries={reflections}
          activePrayers={prayers}
        />
      )}

      {currentView === 'journal_list' && (
        <JournalList
          entries={reflections}
          onBack={() => setCurrentView('home')}
          onSelectEntry={handleSelectEntry}
          onNewReflection={handleNewReflection}
        />
      )}

      {currentView === 'journal_editor' && (
        <JournalEditor
          selectedEntry={selectedEntry}
          onCancel={() => setCurrentView(selectedEntry ? 'journal_list' : 'home')}
          onSave={handleSaveReflection}
          onDelete={handleDeleteReflection}
          title={journalTitle}
          setTitle={setJournalTitle}
          content={journalContent}
          setContent={setJournalContent}
        />
      )}

      {currentView === 'growth' && (
        <GrowthTracker onBack={() => setCurrentView('home')} />
      )}



      {currentView === 'prayer_log' && (
        <PrayerLog
          onClose={() => setCurrentView('home')}
          onSave={handleSavePrayer}
          prayerRequest={prayerRequest}
          setPrayerRequest={setPrayerRequest}
          prayerTime={prayerTime}
          setPrayerTime={setPrayerTime}
          reminderEnabled={reminderEnabled}
          setReminderEnabled={setReminderEnabled}
        />
      )}

      {currentView === 'fasting' && (
        <Fasting onBack={() => setCurrentView('home')} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
});

export default JourneyScreen;