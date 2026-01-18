import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { IconFire, IconChevronRight, IconPen, IconMic, IconActivity, IconBell, IconClock } from '../Icons';
import { JournalEntry, ActivityItem } from '../../types';

const { width } = Dimensions.get('window');

interface JourneyHomeProps {
  onNavigateGlobal?: (tab: string) => void;
  onViewAllReflections: () => void;
  onViewGrowth: () => void;
  onViewTimeline: () => void;
  onNewReflection: () => void;
  onLogPrayer: () => void;
  onViewFasting: () => void;
  onSelectEntry: (entry: JournalEntry) => void;
  journalEntries: JournalEntry[];
  activityHistory: ActivityItem[];
  prayerRequest?: string;
  prayerTime?: string;
  reminderEnabled?: boolean;
}

export const JourneyHome: React.FC<JourneyHomeProps> = ({
  onNavigateGlobal,
  onViewAllReflections,
  onViewGrowth,
  onViewTimeline,
  onNewReflection,
  onLogPrayer,
  onViewFasting,
  onSelectEntry,
  journalEntries,
  activityHistory,
  prayerRequest,
  prayerTime,
  reminderEnabled
}) => (
  <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    {/* Header */}
    <View style={styles.header}>
      <View>
        <Text style={styles.welcomeText}>Grace & Peace,</Text>
        <Text style={styles.headerTitle}>Your Journey</Text>
      </View>
      <TouchableOpacity style={styles.profileButton} onPress={onViewGrowth}>
        <View style={styles.profileCircle}>
          <Text style={styles.profileInitial}>J</Text>
        </View>
      </TouchableOpacity>
    </View>

    {/* Streak Card */}
    <TouchableOpacity
      style={styles.streakCard}
      onPress={onViewGrowth}
      activeOpacity={0.9}
    >
      <View style={styles.streakGradient}>
        <View style={styles.streakHeader}>
          <View style={styles.streakHeaderLeft}>
            <View style={styles.fireIconContainer}>
              <IconFire size={22} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.streakTitle}>Faith Consistency</Text>
              <Text style={styles.streakSubtitle}>Keep your spirit alive!</Text>
            </View>
          </View>
          <View style={styles.streakBadge}>
            <Text style={styles.streakBadgeText}>Active</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>-</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{journalEntries.length}</Text>
            <Text style={styles.statLabel}>Reflections</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>-</Text>
            <Text style={styles.statLabel}>Fasts</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>

    {/* Quick Actions */}
    <View style={styles.quickActions}>
      <TouchableOpacity style={styles.actionCard} onPress={onNewReflection}>
        <View style={[styles.actionIconContainer, { backgroundColor: '#3B82F6' }]}>
          <IconPen size={20} color="#FFFFFF" />
        </View>
        <Text style={styles.actionText}>Reflect</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionCard} onPress={onViewFasting}>
        <View style={[styles.actionIconContainer, { backgroundColor: '#EF4444' }]}>
          <IconClock size={20} color="#FFFFFF" />
        </View>
        <Text style={styles.actionText}>Fasting</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionCard} onPress={onLogPrayer}>
        <View style={[styles.actionIconContainer, { backgroundColor: '#F59E0B' }]}>
          <IconActivity size={20} color="#FFFFFF" />
        </View>
        <Text style={styles.actionText}>Pray</Text>
      </TouchableOpacity>
    </View>

    {/* Active Prayer Reminder Section (Todo Style) */}
    {reminderEnabled && (
      <View style={styles.activePrayerTodo}>
        <View style={styles.todoCircle}>
          <View style={styles.todoDot} />
        </View>
        <View style={styles.todoContent}>
          <Text style={styles.todoLabel}>Active Prayer Task</Text>
          <Text style={styles.todoText} numberOfLines={1}>{prayerRequest || 'Time for daily prayer'}</Text>
          <View style={styles.todoMeta}>
            <IconClock size={10} color="#999999" />
            <Text style={styles.todoTime}>{prayerTime || '08:00 AM'}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.todoActionButton} onPress={onLogPrayer}>
          <IconChevronRight size={18} color="#444444" />
        </TouchableOpacity>
      </View>
    )}

    {/* Recent Reflections */}
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Reflections</Text>
        <TouchableOpacity onPress={onViewAllReflections}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      {journalEntries.length === 0 ? (
        <TouchableOpacity style={styles.emptyState} onPress={onNewReflection}>
          <IconPen size={32} color="rgba(255, 255, 255, 0.1)" />
          <Text style={styles.emptyText}>Start your first reflection</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.entriesList}>
          {journalEntries.slice(0, 2).map((entry, idx) => (
            <TouchableOpacity
              key={entry.id}
              style={[styles.entryCard, { borderLeftColor: idx % 2 === 0 ? '#FFD35A' : '#3B82F6' }]}
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
        <Text style={styles.sectionTitle}>Activity Timeline</Text>
        <TouchableOpacity onPress={onViewTimeline}>
          <Text style={styles.viewAll}>Details</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.timelineCard}>
        {activityHistory.slice(0, 3).map((item, idx) => (
          <View key={idx} style={[styles.timelineItem, idx === 2 && styles.lastTimelineItem]}>
            <View style={styles.timelineLeft}>
              <View style={styles.timelineDot} />
              {idx !== 2 && <View style={styles.timelineLine} />}
            </View>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeText: {
    fontSize: 14,
    color: '#999999',
    fontWeight: '500',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    padding: 2,
    backgroundColor: 'rgba(232, 80, 58, 0.2)',
  },
  profileCircle: {
    flex: 1,
    borderRadius: 22,
    backgroundColor: '#E8503A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  streakCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    marginBottom: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  streakGradient: {
    padding: 24,
  },
  streakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  streakHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  fireIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#E8503A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E8503A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  streakTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  streakSubtitle: {
    fontSize: 13,
    color: '#999999',
    fontWeight: '500',
  },
  streakBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  streakBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#666666',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  actionCard: {
    width: (width - 64) / 3,
    backgroundColor: '#161616',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  activePrayerTodo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161616',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 32,
    gap: 16,
  },
  todoCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E8503A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  todoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E8503A',
  },
  todoContent: {
    flex: 1,
  },
  todoLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#E8503A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  todoText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  todoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  todoTime: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  todoActionButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  viewAll: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E8503A',
  },
  emptyState: {
    backgroundColor: '#161616',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '600',
  },
  entriesList: {
    gap: 12,
  },
  entryCard: {
    backgroundColor: '#161616',
    borderRadius: 20,
    padding: 20,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  entryCategory: {
    fontSize: 11,
    fontWeight: '800',
    color: '#999999',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  entryDate: {
    fontSize: 12,
    color: '#444444',
    fontWeight: '600',
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  entryPreview: {
    fontSize: 14,
    color: '#999999',
    lineHeight: 22,
  },
  timelineCard: {
    backgroundColor: '#161616',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 16,
    paddingBottom: 24,
  },
  lastTimelineItem: {
    paddingBottom: 0,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 12,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E8503A',
    zIndex: 1,
  },
  timelineLine: {
    position: 'absolute',
    top: 12,
    bottom: -12,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  timelineContent: {
    flex: 1,
    paddingTop: -2,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  timelineTime: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
});
