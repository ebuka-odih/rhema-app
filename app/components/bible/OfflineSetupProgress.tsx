import React from 'react';
import { View, Text, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { IconCheck, IconClose } from '../Icons';
import { SetupStep } from '../../services/offlineBibleService';

interface OfflineSetupProgressProps {
    visible: boolean;
    steps: SetupStep[];
    onClose: () => void;
}

export const OfflineSetupProgress: React.FC<OfflineSetupProgressProps> = ({ visible, steps, onClose }) => {
    const isError = steps.some(s => s.status === 'error');
    const isCompleted = steps.every(s => s.status === 'completed');

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Text style={styles.title}>SETUP PROGRESS</Text>
                    <Text style={styles.subtitle}>
                        This may take some 10 secs to 2 minutes depending on your phone capacity
                    </Text>

                    <View style={styles.stepsContainer}>
                        {steps.map((step) => (
                            <View key={step.id} style={styles.stepRow}>
                                <Text style={[
                                    styles.stepLabel,
                                    step.status === 'completed' && styles.stepLabelCompleted,
                                    step.status === 'error' && styles.stepLabelError
                                ]}>
                                    {step.label}
                                </Text>

                                <View style={[
                                    styles.statusIcon,
                                    step.status === 'completed' && styles.statusIconCompleted,
                                    step.status === 'error' && styles.statusIconError,
                                    step.status === 'loading' && styles.statusIconLoading,
                                ]}>
                                    {step.status === 'completed' ? (
                                        <IconCheck size={14} color="#FFFFFF" />
                                    ) : step.status === 'loading' ? (
                                        <ActivityIndicator size="small" color="#FFFFFF" />
                                    ) : step.status === 'error' ? (
                                        <IconClose size={14} color="#FFFFFF" />
                                    ) : (
                                        <View style={styles.dot} />
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>

                    {isError && (
                        <Text style={styles.errorText}>An error occurred during setup. Please try again later.</Text>
                    )}

                    {(isCompleted || isError) && (
                        <View style={styles.footer}>
                            <ActivityIndicator animating={!isCompleted && !isError} color="#E8503A" />
                            {isCompleted && (
                                <Text style={styles.doneText}>Setup complete! You can now use the Bible offline.</Text>
                            )}
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    container: {
        width: '100%',
        backgroundColor: '#FFFFFF', // Matching white background from user screenshot
        borderRadius: 16,
        padding: 24,
    },
    title: {
        fontSize: 18,
        fontWeight: '900',
        color: '#000000',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#333333',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 20,
    },
    stepsContainer: {
        gap: 20,
        marginBottom: 24,
    },
    stepRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    stepLabel: {
        fontSize: 16,
        color: '#666666',
        flex: 1,
    },
    stepLabelCompleted: {
        color: '#000000',
        fontWeight: '500',
    },
    stepLabelError: {
        color: '#E8503A',
    },
    statusIcon: {
        width: 24,
        height: 24,
        borderRadius: 4,
        backgroundColor: '#E5E5E5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusIconCompleted: {
        backgroundColor: '#FF4F70', // Matching pinkish color from screenshot
    },
    statusIconLoading: {
        backgroundColor: '#E8503A',
    },
    statusIconError: {
        backgroundColor: '#E8503A',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#999999',
    },
    errorText: {
        color: '#E8503A',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
    },
    footer: {
        marginTop: 24,
        alignItems: 'center',
    },
    doneText: {
        color: '#2E7D32',
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 12,
    }
});
