import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { JournalEntry, ActivityItem } from '../types';
import { authService } from '../services/auth';
import { API_BASE_URL } from '../services/apiConfig';

// Extracted Components
import { JourneyHome } from '../components/journey/JourneyHome';
import { JournalList } from '../components/journey/JournalList';
import { JournalEditor } from '../components/journey/JournalEditor';
import { GrowthTracker } from '../components/journey/GrowthTracker';
import { ActivityTimeline } from '../components/journey/ActivityTimeline';
import { PrayerLog } from '../components/journey/PrayerLog';
import { notificationService } from '../services/notificationService';

type JourneyView = 'home' | 'journal_list' | 'journal_editor' | 'growth' | 'timeline' | 'prayer_log';

interface JourneyScreenProps {
  onNavigateGlobal?: (tab: string) => void;
}

const JourneyScreen: React.FC<JourneyScreenProps> = ({ onNavigateGlobal }) => {
  const [currentView, setCurrentView] = useState<JourneyView>('home');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [journalTitle, setJournalTitle] = useState('');
  const [journalContent, setJournalContent] = useState('');
  const [prayerRequest, setPrayerRequest] = useState('');
  const [prayerTime, setPrayerTime] = useState('08:00 AM');
  const [reminderEnabled, setReminderEnabled] = useState(false);

  const [reflections, setReflections] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Data
  useEffect(() => {
    fetchReflections();
  }, []);

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
    } finally {
      setIsLoading(false);
    }
  };

  const activityHistory: ActivityItem[] = [
    { id: '1', type: 'devotion', title: 'Completed "Morning Grace"', timestamp: '2h ago' },
    { id: '2', type: 'journal', title: 'Wrote a Reflection', timestamp: '5h ago' },
    { id: '3', type: 'sermon', title: 'Recorded Sermon', timestamp: 'Yesterday' },
    { id: '4', type: 'fasting', title: 'Completed Day 3 Fast', timestamp: 'Yesterday' },
  ];

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

  const handleSaveReflection = async (category: string) => {
    if (!journalTitle || !journalContent) {
      Alert.alert('Missing Info', 'Please provide a title and content.');
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
      const response = await fetch(`${API_BASE_URL}prayers`, {
        method: 'POST',
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

      if (response.ok) {
        if (reminderEnabled) {
          const [time, period] = prayerTime.split(' ');
          let [hour, minute] = time.split(':').map(Number);
          if (period === 'PM' && hour < 12) hour += 12;
          if (period === 'AM' && hour === 12) hour = 0;
          await notificationService.schedulePrayerReminder(hour, minute, prayerRequest);
        }
        setPrayerRequest('');
        setCurrentView('home');
      } else {
        Alert.alert('Error', 'Failed to save prayer.');
      }
    } catch (error) {
      console.error('Failed to save prayer:', error);
      Alert.alert('Error', 'Network error occurred.');
    }
  };

  return (
    <View style={styles.container}>
      {currentView === 'home' && (
        <JourneyHome
          onNavigateGlobal={onNavigateGlobal}
          onViewAllReflections={() => setCurrentView('journal_list')}
          onViewGrowth={() => setCurrentView('growth')}
          onViewTimeline={() => setCurrentView('timeline')}
          onNewReflection={handleNewReflection}
          onLogPrayer={() => setCurrentView('prayer_log')}
          onSelectEntry={handleSelectEntry}
          journalEntries={reflections}
          activityHistory={activityHistory}
          prayerRequest={prayerRequest}
          prayerTime={prayerTime}
          reminderEnabled={reminderEnabled}
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

      {currentView === 'timeline' && (
        <ActivityTimeline
          onBack={() => setCurrentView('home')}
          activities={activityHistory}
        />
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