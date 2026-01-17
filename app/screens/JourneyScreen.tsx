import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { JournalEntry, ActivityItem } from '../types';

// Extracted Components
import { JourneyHome } from '../components/journey/JourneyHome';
import { JournalList } from '../components/journey/JournalList';
import { JournalEditor } from '../components/journey/JournalEditor';
import { GrowthTracker } from '../components/journey/GrowthTracker';
import { ActivityTimeline } from '../components/journey/ActivityTimeline';
import { PrayerLog } from '../components/journey/PrayerLog';

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

  // Mock Data
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([
    { id: '1', title: 'Finding Peace in Chaos', content: 'Today was overwhelming, but I was reminded of Philippians 4:7...', date: 'Oct 24', category: 'Devotion' },
    { id: '2', title: 'Prayer for Clarity', content: 'Lord, guide my steps as I make this decision regarding...', date: 'Oct 22', category: 'Prayer' },
  ]);

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
          journalEntries={journalEntries}
          activityHistory={activityHistory}
        />
      )}

      {currentView === 'journal_list' && (
        <JournalList
          entries={journalEntries}
          onBack={() => setCurrentView('home')}
          onSelectEntry={handleSelectEntry}
          onNewReflection={handleNewReflection}
        />
      )}

      {currentView === 'journal_editor' && (
        <JournalEditor
          selectedEntry={selectedEntry}
          onCancel={() => setCurrentView(selectedEntry ? 'journal_list' : 'home')}
          onSave={() => { setCurrentView('home'); setSelectedEntry(null); }}
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
          onSave={() => setCurrentView('home')}
          prayerRequest={prayerRequest}
          setPrayerRequest={setPrayerRequest}
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