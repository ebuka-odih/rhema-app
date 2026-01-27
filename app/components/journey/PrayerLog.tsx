import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Switch, Platform, KeyboardAvoidingView, ScrollView, TouchableWithoutFeedback, Keyboard, Animated } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
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
    const [status, setStatus] = useState<'active' | 'done'>('active');
    const [showTimePicker, setShowTimePicker] = useState(false);

    // Animations
    const fadeAnim = useState(new Animated.Value(0))[0];
    const scaleAnim = useState(new Animated.Value(0.95))[0];

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    const handleClose = () => {
        if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 0.95, duration: 150, useNativeDriver: true })
        ]).start(() => onClose());
    };

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
            if (Platform.OS !== 'web') Haptics.selectionAsync();
            const hours = selectedDate.getHours();
            const minutes = selectedDate.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const displayHours = hours % 12 || 12;
            const displayMinutes = minutes.toString().padStart(2, '0');
            setPrayerTime(`${displayHours}:${displayMinutes} ${ampm}`);
        }

        // Auto-close sticky picker on iOS if desired, but standard pattern is to keep open until "Done".
        // However, user mentioned 'friction', so let's keep the explicitly separate 'Done' button for closing on iOS 
        // as it's already implemented in the 'Close' button logic in the JSX.
    };

    const toggleReminder = (val: boolean) => {
        if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setReminderEnabled(val);
    };

    const handleSave = () => {
        if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onSave(status);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
        >
            <Animated.View style={[styles.prayerLogContainer, { opacity: fadeAnim }]}>
                <TouchableOpacity
                    style={StyleSheet.absoluteFill}
                    onPress={Keyboard.dismiss}
                    activeOpacity={1}
                />
                <Animated.View style={[styles.prayerLogCard, { transform: [{ scale: scaleAnim }] }]}>
                    <View style={styles.prayerLogHeader}>
                        <View>
                            <Text style={styles.prayerLogTitle}>Meditate in Prayer</Text>
                            <Text style={styles.prayerLogSubtitle}>Bring your request to God</Text>
                        </View>
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <IconClose size={20} color="#999999" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode="on-drag"
                        contentContainerStyle={styles.scrollContent}
                    >
                        {/* Input Area */}
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.todoInput}
                                placeholder="Type your prayer request here..."
                                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                                value={prayerRequest}
                                onChangeText={setPrayerRequest}
                                multiline
                                maxLength={200}
                            />
                            <Text style={styles.charCount}>{prayerRequest.length}/200</Text>
                        </View>

                        <View style={styles.settingsContainer}>
                            {/* Reminder Toggle */}
                            <View style={styles.settingRow}>
                                <View style={styles.settingInfo}>
                                    <View style={styles.iconBadge}>
                                        <IconBell size={16} color={reminderEnabled ? '#FFFFFF' : '#999999'} />
                                    </View>
                                    <View>
                                        <Text style={styles.settingTitle}>Daily Reminder</Text>
                                        <Text style={styles.settingDesc}>Get notified to pray</Text>
                                    </View>
                                </View>
                                <Switch
                                    value={reminderEnabled}
                                    onValueChange={toggleReminder}
                                    trackColor={{ false: '#333', true: '#E8503A' }}
                                    thumbColor={'#FFFFFF'}
                                    ios_backgroundColor="#333"
                                />
                            </View>

                            {/* Time Picker */}
                            {reminderEnabled && (
                                <TouchableOpacity
                                    style={styles.timeSelector}
                                    onPress={() => {
                                        if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        setShowTimePicker(true)
                                    }}
                                >
                                    <Text style={styles.timeLabel}>Remind me at</Text>
                                    <View style={styles.timeValueContainer}>
                                        <IconClock size={14} color="#E8503A" />
                                        <Text style={styles.timeValue}>{prayerTime}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}

                            {showTimePicker && (
                                <View style={styles.pickerContainer}>
                                    <DateTimePicker
                                        value={getInitialDate()}
                                        mode="time"
                                        is24Hour={false}
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        onChange={handleTimeChange}
                                        textColor="#FFFFFF"
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

                        {/* Status Section */}
                        <View style={styles.statusSection}>
                            <Text style={styles.sectionLabel}>STATUS</Text>
                            <View style={styles.statusButtons}>
                                <TouchableOpacity
                                    style={[styles.statusButton, status === 'active' && styles.statusButtonActive]}
                                    onPress={() => {
                                        if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        setStatus('active');
                                    }}
                                >
                                    <View style={[styles.statusDot, status === 'active' && { backgroundColor: '#E8503A' }]} />
                                    <Text style={[styles.statusButtonText, status === 'active' && styles.statusButtonTextActive]}>Praying</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.statusButton, status === 'done' && styles.statusButtonActiveDone]}
                                    onPress={() => {
                                        if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        setStatus('done');
                                    }}
                                >
                                    {status === 'done' && <IconCheck size={14} color="#4CAF50" style={{ marginRight: 6 }} />}
                                    <Text style={[styles.statusButtonText, status === 'done' && styles.statusButtonTextActiveDone]}>Done</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.saveLogButton, !prayerRequest && styles.saveLogButtonDisabled]}
                            onPress={handleSave}
                            disabled={!prayerRequest}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.saveLogButtonText}>
                                {status === 'done' ? 'Mark as Done' : 'Save Prayer'}
                            </Text>
                        </TouchableOpacity>
                    </ScrollView>
                </Animated.View>
            </Animated.View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    keyboardView: {
        flex: 1,
    },
    prayerLogContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    prayerLogCard: {
        backgroundColor: '#1A1A1A',
        borderRadius: 28,
        padding: 0,
        width: '100%',
        maxWidth: 380,
        maxHeight: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    prayerLogHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    prayerLogTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: -0.5,
    },
    prayerLogSubtitle: {
        fontSize: 14,
        color: '#666666',
        marginTop: 4,
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#252525',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 24,
    },
    inputContainer: {
        marginBottom: 24,
    },
    todoInput: {
        backgroundColor: '#252525',
        borderRadius: 16,
        padding: 16,
        color: '#FFFFFF',
        fontSize: 16,
        lineHeight: 24,
        minHeight: 120,
        textAlignVertical: 'top',
        marginBottom: 8,
    },
    charCount: {
        alignSelf: 'flex-end',
        color: '#666666',
        fontSize: 12,
    },
    settingsContainer: {
        backgroundColor: '#252525',
        borderRadius: 20,
        padding: 16,
        marginBottom: 24,
        gap: 16,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    settingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconBadge: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: '#333333',
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    settingDesc: {
        fontSize: 12,
        color: '#888888',
        marginTop: 2,
    },
    timeSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#333333',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginTop: 4,
    },
    timeLabel: {
        color: '#AAAAAA',
        fontSize: 14,
        fontWeight: '500',
    },
    timeValueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(232, 80, 58, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    timeValue: {
        color: '#E8503A',
        fontWeight: '700',
        fontSize: 14,
    },
    pickerContainer: {
        marginTop: 10,
        backgroundColor: '#222',
        borderRadius: 12,
        overflow: 'hidden',
    },
    donePickerButton: {
        alignItems: 'center',
        padding: 12,
        borderTopWidth: 1,
        borderTopColor: '#333',
    },
    donePickerText: {
        color: '#E8503A',
        fontWeight: 'bold',
    },
    statusSection: {
        marginBottom: 24,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#666666',
        marginBottom: 12,
        letterSpacing: 1,
    },
    statusButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    statusButton: {
        flex: 1,
        backgroundColor: '#252525',
        borderRadius: 16,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
        flexDirection: 'row',
    },
    statusButtonActive: {
        backgroundColor: '#252525',
        borderColor: '#E8503A',
    },
    statusButtonActiveDone: {
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        borderColor: '#4CAF50',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#666666',
        marginRight: 8,
    },
    statusButtonText: {
        color: '#888888',
        fontSize: 14,
        fontWeight: '600',
    },
    statusButtonTextActive: {
        color: '#FFFFFF',
    },
    statusButtonTextActiveDone: {
        color: '#4CAF50',
    },
    saveLogButton: {
        backgroundColor: '#E8503A',
        borderRadius: 18,
        paddingVertical: 18,
        alignItems: 'center',
        shadowColor: '#E8503A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    saveLogButtonDisabled: {
        opacity: 0.5,
        shadowOpacity: 0,
    },
    saveLogButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
});
