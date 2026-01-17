import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { IconClose } from '../Icons';

interface PrayerLogProps {
    onClose: () => void;
    onSave: () => void;
    prayerRequest: string;
    setPrayerRequest: (t: string) => void;
}

export const PrayerLog: React.FC<PrayerLogProps> = ({
    onClose,
    onSave,
    prayerRequest,
    setPrayerRequest
}) => (
    <View style={styles.prayerLogContainer}>
        <View style={styles.prayerLogCard}>
            <View style={styles.prayerLogHeader}>
                <Text style={styles.prayerLogTitle}>Log Prayer</Text>
                <TouchableOpacity onPress={onClose}>
                    <IconClose size={24} color="#999999" />
                </TouchableOpacity>
            </View>

            <View style={styles.prayerLogContent}>
                <Text style={styles.inputLabel}>PRAYER REQUEST</Text>
                <TextInput
                    style={styles.prayerInput}
                    placeholder="What are you praying for today?"
                    placeholderTextColor="#666666"
                    value={prayerRequest}
                    onChangeText={setPrayerRequest}
                    multiline
                    textAlignVertical="top"
                />
            </View>

            <View style={styles.statusSection}>
                <Text style={styles.inputLabel}>STATUS</Text>
                <View style={styles.statusButtons}>
                    <TouchableOpacity style={styles.statusButtonActive}>
                        <Text style={styles.statusButtonTextActive}>Praying</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.statusButtonInactive}>
                        <Text style={styles.statusButtonTextInactive}>Answered</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity
                style={styles.saveLogButton}
                onPress={onSave}
            >
                <Text style={styles.saveLogButtonText}>Save Log</Text>
            </TouchableOpacity>
        </View>
    </View>
);

const styles = StyleSheet.create({
    prayerLogContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    prayerLogCard: {
        backgroundColor: '#1A1A1A',
        borderRadius: 24,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    prayerLogHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    prayerLogTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    prayerLogContent: {
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#999999',
        letterSpacing: 1,
        marginBottom: 12,
    },
    prayerInput: {
        backgroundColor: '#0D0D0D',
        borderRadius: 12,
        padding: 16,
        color: '#FFFFFF',
        fontSize: 16,
        minHeight: 120,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    statusSection: {
        marginBottom: 32,
    },
    statusButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    statusButtonActive: {
        flex: 1,
        backgroundColor: 'rgba(232, 80, 58, 0.1)',
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E8503A',
    },
    statusButtonTextActive: {
        color: '#E8503A',
        fontWeight: 'bold',
    },
    statusButtonInactive: {
        flex: 1,
        backgroundColor: '#0D0D0D',
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    statusButtonTextInactive: {
        color: '#666666',
        fontWeight: 'bold',
    },
    saveLogButton: {
        backgroundColor: '#E8503A',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        shadowColor: '#E8503A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    saveLogButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
