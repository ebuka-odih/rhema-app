import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Animated, PanResponder } from 'react-native';
import { IconFire, IconChevronRight, IconPen, IconMic, IconActivity, IconBell, IconClock, IconCheck, IconTrash } from '../Icons';
import { JournalEntry, Prayer } from '../../types';

const { width } = Dimensions.get('window');

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
  journalEntries: JournalEntry[];
  activePrayers: Prayer[];
}

const SwipeablePrayerItem: React.FC<{
  prayer: Prayer;
  onToggleStatus: (id: string, status: string) => void;
  onRemove: (id: string) => void;
  onPress: () => void;
}> = ({ prayer, onToggleStatus, onRemove, onPress }) => {
  const translateX = React.useRef(new Animated.Value(0)).current;
  const _value = React.useRef(0);

  React.useEffect(() => {
    const listener = translateX.addListener(({ value }) => {
      _value.current = value;
    });
    return () => translateX.removeListener(listener);
  }, [translateX]);

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Detect horizontal swipe better
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderGrant: () => {
        translateX.setOffset(_value.current);
        translateX.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow movement to the right (positive dx) if starting from 0
        // Or movement to the left (negative dx) if starting from 80
        let newX = gestureState.dx;
        const currentPos = _value.current + newX;

        if (currentPos >= 0 && currentPos <= 120) {
          translateX.setValue(newX);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        translateX.flattenOffset();
        const finalValue = _value.current;

        if (finalValue > 50) {
          // Snap to open
          Animated.spring(translateX, {
            toValue: 80,
            useNativeDriver: true,
            bounciness: 8,
          }).start();
        } else {
          // Snap closed
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 8,
          }).start();
        }
      },
    })
  ).current;

  const resetSwipe = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.swipeableContainer}>
      {/* Delete Action Background */}
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => {
          onRemove(prayer.id);
          resetSwipe();
        }}
      >
        <IconTrash size={20} color="#FFFFFF" />
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.activePrayerTodo,
          { transform: [{ translateX }] }
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={[styles.todoCircle, prayer.status === 'done' && styles.todoCircleChecked]}
          onPress={() => onToggleStatus(prayer.id, prayer.status)}
        >
          {prayer.status === 'done' ? (
            <IconCheck size={12} color="#FFFFFF" />
          ) : (
            <View style={styles.todoDot} />
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.todoContent} onPress={onPress} activeOpacity={0.7}>
          <Text style={[styles.todoText, prayer.status === 'done' && styles.todoTextDone]} numberOfLines={2}>
            {prayer.request}
          </Text>
          <View style={styles.todoMeta}>
            <IconClock size={10} color="#999999" />
            <Text style={styles.todoTime}>{prayer.time}</Text>
            {prayer.reminder_enabled && (
              <View style={styles.reminderDot} />
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.todoActionButton} onPress={onPress}>
          <IconChevronRight size={18} color="#444444" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export const JourneyHome: React.FC<JourneyHomeProps> = ({
  onNavigateGlobal,
  onViewAllReflections,
  onViewGrowth,
  onNewReflection,
  onLogPrayer,
  onEditPrayer,
  onViewFasting,
  onSelectEntry,
  onTogglePrayerStatus,
  onRemovePrayer,
  journalEntries,
  activePrayers
}) => {
  const [activeTab, setActiveTab] = React.useState<'prayers' | 'reflections'>('prayers');

  return (
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
        <TouchableOpacity style={styles.actionCard} onPress={onLogPrayer}>
          <View style={[styles.actionIconContainer, { backgroundColor: '#F59E0B' }]}>
            <IconActivity size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.actionText}>Pray</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={onViewFasting}>
          <View style={[styles.actionIconContainer, { backgroundColor: '#EF4444' }]}>
            <IconClock size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.actionText}>Fasting</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={onNewReflection}>
          <View style={[styles.actionIconContainer, { backgroundColor: '#3B82F6' }]}>
            <IconPen size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.actionText}>Reflect</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'prayers' && styles.activeTab]}
          onPress={() => setActiveTab('prayers')}
        >
          <Text style={[styles.tabText, activeTab === 'prayers' && styles.activeTabText]}>Prayers</Text>
          {activeTab === 'prayers' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'reflections' && styles.activeTab]}
          onPress={() => setActiveTab('reflections')}
        >
          <Text style={[styles.tabText, activeTab === 'reflections' && styles.activeTabText]}>Reflections</Text>
          {activeTab === 'reflections' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>
      </View>

      {activeTab === 'prayers' ? (
        <View style={styles.tabContent}>
          {/* Active Prayers (Todo Style) */}
          <View style={styles.prayerListContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Prayer List</Text>
              <TouchableOpacity onPress={onLogPrayer}>
                <Text style={styles.viewAll}>+ Add New</Text>
              </TouchableOpacity>
            </View>
            {activePrayers.length === 0 ? (
              <TouchableOpacity style={styles.emptyState} onPress={onLogPrayer}>
                <IconActivity size={32} color="rgba(255, 255, 255, 0.1)" />
                <Text style={styles.emptyText}>No active prayers</Text>
              </TouchableOpacity>
            ) : (
              activePrayers.map((prayer) => (
                <SwipeablePrayerItem
                  key={prayer.id}
                  prayer={prayer}
                  onToggleStatus={onTogglePrayerStatus}
                  onRemove={onRemovePrayer}
                  onPress={() => onEditPrayer(prayer)}
                />
              ))
            )}
          </View>
        </View>
      ) : (
        <View style={styles.tabContent}>
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
                {journalEntries.slice(0, 5).map((entry, idx) => (
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
        </View>
      )}
    </ScrollView>
  );
};

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
  prayerListContainer: {
    marginBottom: 32,
  },
  todoCircleChecked: {
    backgroundColor: '#E8503A',
  },
  todoTextDone: {
    textDecorationLine: 'line-through',
    color: '#666666',
  },
  reminderDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E8503A',
    marginLeft: 4,
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

  tabContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    position: 'relative',
  },
  activeTab: {
    // Optional active tab styling
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: -1,
    width: '40%',
    height: 3,
    backgroundColor: '#E8503A',
    borderRadius: 3,
  },
  tabContent: {
    flex: 1,
  },
  swipeableContainer: {
    position: 'relative',
    marginBottom: 16,
    overflow: 'hidden',
    borderRadius: 20,
  },
  deleteAction: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 80,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
});
