import React from 'react';
import { Modal, SafeAreaView, StyleSheet } from 'react-native';
import { PaywallTemplate } from './PaywallTemplate';

interface RecordingPaywallProps {
    visible: boolean;
    mode: 'LAST_FREE' | 'LIMIT_REACHED';
    freeLimit: number;
    usedToday: number;
    resetAt: number;
    onClose: () => void;
    onUpgrade: () => void;
    onContinueFree?: () => void;
}

export const RecordingPaywall: React.FC<RecordingPaywallProps> = ({
    visible,
    mode,
    freeLimit,
    usedToday,
    resetAt,
    onClose,
    onUpgrade,
    onContinueFree,
}) => {
    const hasLastFree = mode === 'LAST_FREE';
    const remaining = Math.max(0, freeLimit - usedToday);
    const [countdown, setCountdown] = React.useState('0h 00m 00s');

    const formatCountdown = React.useCallback((targetTs: number) => {
        const diff = Math.max(0, targetTs - Date.now());
        const totalSeconds = Math.floor(diff / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
    }, []);

    React.useEffect(() => {
        if (!visible) return;
        setCountdown(formatCountdown(resetAt));
        const timer = setInterval(() => {
            setCountdown(formatCountdown(resetAt));
        }, 1000);
        return () => clearInterval(timer);
    }, [visible, resetAt, formatCountdown]);

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="fullScreen"
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.safeArea}>
                <PaywallTemplate
                    onClose={onClose}
                    title={hasLastFree ? 'Use Your Last Free Recording Today' : 'Daily Free Limit Reached'}
                    subtitle={hasLastFree
                        ? `You have ${remaining} free recording left today. Upgrade now for more recording time and full sermon transcription.`
                        : `You have used all ${freeLimit} free recordings today.`
                    }
                    countdownText={`Next free recording in ${countdown}`}
                    benefits={[
                        'Up to 50-minute sermon recordings',
                        'AI sermon transcription and summaries',
                        'More than 3 recordings per day',
                        'Faster sermon analysis flow',
                    ]}
                    offerTitle="7-Day Free Trial"
                    offerSubtext="Start now, cancel anytime."
                    primaryLabel="Start Free Trial"
                    onPrimary={onUpgrade}
                    secondaryLabel={hasLastFree ? 'Use Last Free Recording' : 'Maybe Later'}
                    onSecondary={hasLastFree && onContinueFree ? onContinueFree : onClose}
                    footerText={`No risk, no commitment. Free plan includes ${freeLimit} recordings/day.`}
                />
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#0A0A0A',
    },
});
