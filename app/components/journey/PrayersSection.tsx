import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, PanResponder } from 'react-native';
import { IconActivity, IconClock, IconChevronRight, IconTrash, IconCheck } from '../Icons';
import { Prayer } from '../../types';
import { commonStyles } from './JourneyStyles';

interface PrayersSectionProps {
    activePrayers: Prayer[];
    onLogPrayer: () => void;
    onTogglePrayerStatus: (id: string, currentStatus: string) => void;
    onRemovePrayer: (id: string) => void;
    onEditPrayer: (prayer: Prayer) => void;
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
                return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
            },
            onPanResponderGrant: () => {
                translateX.setOffset(_value.current);
                translateX.setValue(0);
            },
            onPanResponderMove: (_, gestureState) => {
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
                    Animated.spring(translateX, {
                        toValue: 80,
                        useNativeDriver: true,
                        bounciness: 8,
                    }).start();
                } else {
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

export const PrayersSection: React.FC<PrayersSectionProps> = ({
    activePrayers,
    onLogPrayer,
    onTogglePrayerStatus,
    onRemovePrayer,
    onEditPrayer,
}) => {
    return (
        <View style={styles.prayerListContainer}>
            <View style={commonStyles.sectionHeader}>
                <Text style={commonStyles.sectionTitle}>Prayer List</Text>
                <TouchableOpacity onPress={onLogPrayer}>
                    <Text style={commonStyles.viewAll}>+ Add New</Text>
                </TouchableOpacity>
            </View>
            {activePrayers.length === 0 ? (
                <TouchableOpacity style={commonStyles.emptyState} onPress={onLogPrayer}>
                    <IconActivity size={32} color="rgba(255, 255, 255, 0.1)" />
                    <Text style={commonStyles.emptyText}>No active prayers</Text>
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
    );
};

const styles = StyleSheet.create({
    prayerListContainer: {
        marginBottom: 32,
    },
    swipeableContainer: {
        position: 'relative',
        marginBottom: 16,
        overflow: 'hidden',
        borderRadius: 24,
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
        borderRadius: 24,
    },
    activePrayerTodo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0D0D0D',
        borderRadius: 24,
        padding: 18,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.04)',
        gap: 16,
    },
    todoCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: '#E8503A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    todoCircleChecked: {
        backgroundColor: '#E8503A',
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
    todoText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
        lineHeight: 20,
    },
    todoTextDone: {
        textDecorationLine: 'line-through',
        color: '#444444',
    },
    todoMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    todoTime: {
        fontSize: 11,
        color: '#555555',
        fontWeight: '600',
    },
    todoActionButton: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    reminderDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#E8503A',
        marginLeft: 4,
    },
});
