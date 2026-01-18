import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Switch, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { IconClose, IconClock, IconBell, IconCheck } from '../Icons';

interface PrayerLogProps {
    onClose: () => void;
    onSave: (status: string) => void;
    prayerRequest: string;
    setPrayerRequest: (t: string) => void;
    prayerTime: string; // "HH:MM AM/PM" format currently
    setPrayerTime: (t: string) => void;
    reminderEnabled: boolean;
    setReminderEnabled: (b: boolean) => void;
}

export const PrayerLog: React.FC<PrayerLogProps> = ({
    onClose,
    onSave,
    prayerRequest,
    setPrayerRequest,
    prayerTime,
    setPrayerTime,
    reminderEnabled,
    setReminderEnabled,
}) => {
    const [status, setStatus] = useState<'praying' | 'answered'>('praying');
    const [showTimePicker, setShowTimePicker] = useState(false);

    // Parse current prayerTime string to Date for picker
    const getInitialDate = () => {
        const date = new Date();
        try {
            const [time, period] = prayerTime.split(' ');
            let [hours, minutes] = time.split(':').map(Number);
            if (period === 'PM' && hours < 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;
            date.setHours(hours, minutes, 0, 0);
        } catch (e) {
            date.setHours(8, 0, 0, 0);
        }
        return date;
    };

    const handleTimeChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowTimePicker(false);
        }

        if (selectedDate) {
            const hours = selectedDate.getHours();
            const minutes = selectedDate.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const displayHours = hours % 12 || 12;
            const displayMinutes = minutes.toString().padStart(2, '0');
            setPrayerTime(`${displayHours}:${displayMinutes} ${ampm}`);
        }
    };

    return (
        <View style={styles.prayerLogContainer}>
            <View style={styles.prayerLogCard}>
                <View style={styles.prayerLogHeader}>
                    <Text style={styles.prayerLogTitle}>Prayer Request</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <IconClose size={24} color="#999999" />
                    </TouchableOpacity>
                </View>

                {/* TODO List Style Entry */}
                <View style={styles.todoEntryContainer}>
                    <View style={styles.todoCircle}>
                        {status === 'answered' && <IconCheck size={14} color="#FFFFFF" />}
                    </View>
                    <TextInput
                        style={styles.todoInput}
                        placeholder="What are you praying for?"
                        placeholderTextColor="#666666"
                        value={prayerRequest}
                        onChangeText={setPrayerRequest}
                        multiline
                    />
                </View>

                <View style={styles.divider} />

                <View style={styles.settingsGrid}>
                    <View style={styles.settingItem}>
                        <Text style={styles.inputLabel}>RECURRING TIME</Text>
                        <TouchableOpacity
                            style={styles.timePickerButton}
                            onPress={() => setShowTimePicker(true)}
                        >
                            <IconClock size={16} color="#E8503A" />
                            <Text style={styles.timeDisplayText}>{prayerTime || '08:00 AM'}</Text>
                        </TouchableOpacity>
                        {showTimePicker && (
                            <View>
                                <DateTimePicker
                                    value={getInitialDate()}
                                    mode="time"
                                    is24Hour={false}
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={handleTimeChange}
                                />
                                {Platform.OS === 'ios' && (
                                    <TouchableOpacity
                                        style={styles.donePickerButton}
                                        onPress={() => setShowTimePicker(false)}
                                    >
                                        <Text style={styles.donePickerText}>Done</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    </View>

                    <View style={styles.settingItem}>
                        <View style={styles.labelWithBadge}>
                            <Text style={styles.inputLabel}>REMINDER</Text>
                            {reminderEnabled && <View style={styles.activeBadge} />}
                        </View>
                        <View style={styles.reminderToggleContainer}>
                            <IconBell size={18} color={reminderEnabled ? '#E8503A' : '#444444'} />
                            <Switch
                                value={reminderEnabled}
                                onValueChange={setReminderEnabled}
                                trackColor={{ false: '#333', true: 'rgba(232, 80, 58, 0.5)' }}
                                thumbColor={reminderEnabled ? '#E8503A' : '#999'}
                                ios_backgroundColor="#333"
                            />
                        </View>
                    </View>
                </View>

                <View style={styles.statusSection}>
                    <Text style={styles.inputLabel}>MARK STATUS</Text>
                    <View style={styles.statusButtons}>
                        <TouchableOpacity
                            style={[styles.statusButton, status === 'praying' && styles.statusButtonActive]}
                            onPress={() => setStatus('praying')}
                        >
                            <Text style={[styles.statusButtonText, status === 'praying' && styles.statusButtonTextActive]}>Praying</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.statusButton, status === 'answered' && styles.statusButtonActiveAnswered]}
                            onPress={() => setStatus('answered')}
                        >
                            <Text style={[styles.statusButtonText, status === 'answered' && styles.statusButtonTextActiveAnswered]}>Answered</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.saveLogButton, !prayerRequest && styles.saveLogButtonDisabled]}
                    onPress={() => onSave(status)}
                    disabled={!prayerRequest}
                >
                    <Text style={styles.saveLogButtonText}>Set Prayer Reminder</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    prayerLogContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    prayerLogCard: {
        backgroundColor: '#161616',
        borderRadius: 24,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    prayerLogHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    prayerLogTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    todoEntryContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 16,
        paddingVertical: 12,
    },
    todoCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E8503A',
        marginTop: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    todoInput: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '500',
        minHeight: 80,
        textAlignVertical: 'top',
        paddingTop: 0,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        marginVertical: 20,
    },
    inputLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#E8503A',
        letterSpacing: 1,
        marginBottom: 10,
        textTransform: 'uppercase',
    },
    labelWithBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    activeBadge: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#E8503A',
        marginBottom: 8,
    },
    settingsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    settingItem: {
        flex: 1,
    },
    timePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0D0D0D',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        gap: 8,
    },
    timeDisplayText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    donePickerButton: {
        backgroundColor: 'rgba(232, 80, 58, 0.1)',
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: -10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(232, 80, 58, 0.3)',
    },
    donePickerText: {
        color: '#E8503A',
        fontWeight: 'bold',
        fontSize: 14,
    },
    reminderToggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#0D0D0D',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    statusSection: {
        marginBottom: 28,
    },
    statusButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    statusButton: {
        flex: 1,
        backgroundColor: '#0D0D0D',
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    statusButtonActive: {
        backgroundColor: 'rgba(232, 80, 58, 0.08)',
        borderColor: 'rgba(232, 80, 58, 0.4)',
    },
    statusButtonActiveAnswered: {
        backgroundColor: 'rgba(34, 197, 94, 0.08)',
        borderColor: 'rgba(34, 197, 94, 0.4)',
    },
    statusButtonText: {
        color: '#666666',
        fontWeight: '700',
        fontSize: 13,
    },
    statusButtonTextActive: {
        color: '#E8503A',
    },
    statusButtonTextActiveAnswered: {
        color: '#22C55E',
    },
    saveLogButton: {
        backgroundColor: '#E8503A',
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
    },
    saveLogButtonDisabled: {
        opacity: 0.5,
    },
    saveLogButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '800',
    },
});
