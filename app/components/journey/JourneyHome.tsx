import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { JournalEntry, Prayer } from '../../types';

// Extracted Components
import { JourneyHeader } from './JourneyHeader';
import { DashboardSection } from './DashboardSection';
import { QuickActionsSection } from './QuickActionsSection';
import { ReflectionsSection } from './ReflectionsSection';
import { PrayersSection } from './PrayersSection';
import { BookmarksSection } from './BookmarksSection';

interface JourneyHomeProps {
  onNavigateGlobal?: (tab: string) => void;
  onViewAllReflections: () => void;
  onViewGrowth: () => void;
  onNewReflection: () => void;
  onLogPrayer: () => void;
  onEditPrayer: (prayer: Prayer) => void;
  onViewFasting: () => void;
  onSelectEntry: (entry: JournalEntry) => void;
  onTogglePrayerStatus: (id: string, currentStatus: string) => void;
  onRemovePrayer: (id: string) => void;
  onSelectBookmark: (bookmark: any) => void;
  onRemoveBookmark: (bookmark: any) => void;
  journalEntries: JournalEntry[];
  activePrayers: Prayer[];
  bookmarks: any[];
}

export const JourneyHome: React.FC<JourneyHomeProps> = ({
  onViewGrowth,
  onNewReflection,
  onLogPrayer,
  onEditPrayer,
  onViewFasting,
  onSelectEntry,
  onTogglePrayerStatus,
  onRemovePrayer,
  onViewAllReflections,
  journalEntries,
  activePrayers,
  bookmarks,
  onSelectBookmark,
  onRemoveBookmark
}) => {
  const [activeTab, setActiveTab] = React.useState<'prayers' | 'reflections' | 'bookmarks'>('reflections');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <JourneyHeader onViewGrowth={onViewGrowth} />

      {/* Dashboard */}
      <DashboardSection onViewGrowth={onViewGrowth} journalEntriesCount={journalEntries.length} />

      {/* Quick Actions */}
      <QuickActionsSection
        onNewReflection={onNewReflection}
        onLogPrayer={onLogPrayer}
        onViewFasting={onViewFasting}
      />

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        {['reflections', 'prayers', 'bookmarks'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab as any)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.tabContent}>
        {activeTab === 'reflections' && (
          <ReflectionsSection
            journalEntries={journalEntries}
            onViewAllReflections={onViewAllReflections}
            onNewReflection={onNewReflection}
            onSelectEntry={onSelectEntry}
          />
        )}

        {activeTab === 'prayers' && (
          <PrayersSection
            activePrayers={activePrayers}
            onLogPrayer={onLogPrayer}
            onTogglePrayerStatus={onTogglePrayerStatus}
            onRemovePrayer={onRemovePrayer}
            onEditPrayer={onEditPrayer}
          />
        )}

        {activeTab === 'bookmarks' && (
          <BookmarksSection
            bookmarks={bookmarks}
            onSelectBookmark={onSelectBookmark}
            onRemoveBookmark={onRemoveBookmark}
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 120,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 32,
    padding: 4,
    backgroundColor: '#0D0D0D',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: '#161616',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555555',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  tabContent: {
    flex: 1,
  },
});
