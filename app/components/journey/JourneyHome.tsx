import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { IconFire, IconChevronRight, IconPen, IconMic, IconActivity } from '../Icons';
import { JournalEntry, ActivityItem } from '../../types';

interface JourneyHomeProps {
  onNavigateGlobal?: (tab: string) => void;
  onViewAllReflections: () => void;
  onViewGrowth: () => void;
  onViewTimeline: () => void;
  onNewReflection: () => void;
  onLogPrayer: () => void;
  onSelectEntry: (entry: JournalEntry) => void;
  journalEntries: JournalEntry[];
  activityHistory: ActivityItem[];
}

export const JourneyHome: React.FC<JourneyHomeProps> = ({
  onNavigateGlobal,
  onViewAllReflections,
  onViewGrowth,
  onViewTimeline,
  onNewReflection,
  onLogPrayer,
  onSelectEntry,
  journalEntries,
  activityHistory
}) => (
  <ScrollView style={styles.container} contentContainerStyle={styles.content}>
    {/* Header */}
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Your Journey</Text>
      <Text style={styles.headerSubtitle}>Reflect. Grow. Stay Consistent.</Text>
    </View>

    {/* Streak Card */}
    <TouchableOpacity
      style={styles.streakCard}
      onPress={onViewGrowth}
    >
      <View style={styles.streakHeader}>
        <View style={styles.streakHeaderLeft}>
          <IconFire size={20} color="#E8503A" />
          <Text style={styles.streakTitle}>Daily Streak</Text>
        </View>
        <IconChevronRight size={16} color="#999999" />
      </View>
      <View style={styles.streakGrid}>
        <View style={styles.streakBox}>
          <Text style={styles.streakValue}>12</Text>
          <Text style={styles.streakLabel}>DAYS</Text>
        </View>
        <View style={styles.streakBox}>
          <Text style={styles.streakValue}>3</Text>
          <Text style={styles.streakLabel}>FASTS</Text>
        </View>
        <View style={styles.streakBox}>
          <Text style={styles.streakValue}>45m</Text>
          <Text style={styles.streakLabel}>PRAYED</Text>
        </View>
        <View style={styles.streakBox}>
          <Text style={styles.streakValue}>2</Text>
          <Text style={styles.streakLabel}>SERMONS</Text>
        </View>
      </View>
    </TouchableOpacity>

    {/* Quick Actions */}
    <View style={styles.quickActions}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={onNewReflection}
      >
        <View style={[styles.actionIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
          <IconPen size={20} color="#3B82F6" />
        </View>
        <Text style={styles.actionLabel}>Reflect</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => onNavigateGlobal && onNavigateGlobal('Record')}
      >
        <View style={[styles.actionIcon, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
          <IconMic size={20} color="#EF4444" />
        </View>
        <Text style={styles.actionLabel}>Record</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={onLogPrayer}
      >
        <View style={[styles.actionIcon, { backgroundColor: 'rgba(234, 179, 8, 0.1)' }]}>
          <IconActivity size={20} color="#EAB308" />
        </View>
        <Text style={styles.actionLabel}>Log Prayer</Text>
      </TouchableOpacity>
    </View>

    {/* Recent Reflections */}
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Reflections</Text>
        <TouchableOpacity onPress={onViewAllReflections}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      {journalEntries.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>You haven't written any reflections yet.</Text>
          <TouchableOpacity onPress={onNewReflection}>
            <Text style={styles.emptyLink}>Write your first reflection</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.entriesList}>
          {journalEntries.slice(0, 3).map(entry => (
            <TouchableOpacity
              key={entry.id}
              style={styles.entryCard}
              onPress={() => onSelectEntry(entry)}
            >
              <View style={styles.entryHeader}>
                <Text style={styles.entryCategory}>{entry.category}</Text>
                <Text style={styles.entryDate}>{entry.date}</Text>
              </View>
              <Text style={styles.entryTitle}>{entry.title}</Text>
              <Text style={styles.entryPreview} numberOfLines={2}>{entry.content}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>

    {/* Recent Activity */}
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <TouchableOpacity onPress={onViewTimeline}>
          <Text style={styles.viewAll}>View Timeline</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.timeline}>
        {activityHistory.slice(0, 5).map((item, idx) => (
          <View key={idx} style={styles.timelineItem}>
            <View style={styles.timelineDot} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>{item.title}</Text>
              <Text style={styles.timelineTime}>{item.timestamp}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#999999',
  },
  streakCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  streakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  streakHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  streakGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  streakBox: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
  },
  streakValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  streakLabel: {
    fontSize: 10,
    color: '#999999',
    letterSpacing: 0.5,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  viewAll: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#E8503A',
  },
  emptyState: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 12,
  },
  emptyLink: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E8503A',
  },
  entriesList: {
    gap: 12,
  },
  entryCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD35A',
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryCategory: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFD35A',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  entryDate: {
    fontSize: 12,
    color: '#999999',
  },
  entryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  entryPreview: {
    fontSize: 12,
    color: '#999999',
    lineHeight: 18,
  },
  timeline: {
    paddingLeft: 16,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.1)',
    gap: 24,
  },
  timelineItem: {
    position: 'relative',
  },
  timelineDot: {
    position: 'absolute',
    left: -21,
    top: 4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E8503A',
    borderWidth: 2,
    borderColor: '#0D0D0D',
  },
  timelineContent: {
    gap: 4,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  timelineTime: {
    fontSize: 12,
    color: '#999999',
  },
});
