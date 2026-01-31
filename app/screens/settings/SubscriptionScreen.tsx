import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { IconArrowLeft, IconCheck, IconStar, IconFire, IconMic, IconBible } from '../../components/Icons';

const BenefitItem: React.FC<{ text: string }> = ({ text }) => (
    <View style={styles.benefitItem}>
        <View style={styles.checkBadge}>
            <IconCheck size={14} color="#FFFFFF" />
        </View>
        <Text style={styles.benefitText}>{text}</Text>
    </View>
);

const SubscriptionScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <IconArrowLeft size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Subscription</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <View style={styles.heroBadge}>
                        <IconStar size={16} color="#E8503A" />
                        <Text style={styles.heroBadgeText}>GO PRO</Text>
                    </View>
                    <Text style={styles.heroTitle}>Level Up Your{'\n'}Spiritual Journey</Text>
                    <Text style={styles.heroSubtitle}>
                        Unlock full access to advanced spiritual tools and exclusive content.
                    </Text>
                </View>

                {/* Pro Card */}
                <View style={styles.proCard}>
                    <View style={styles.cardHeader}>
                        <View>
                            <Text style={styles.planName}>Rhema Daily Pro</Text>
                            <Text style={styles.planPrice}>$9.99<Text style={styles.planPeriod}> / month</Text></Text>
                        </View>
                        <View style={styles.proLabel}>
                            <Text style={styles.proLabelText}>MOST POPULAR</Text>
                        </View>
                    </View>

                    <View style={styles.benefitsList}>
                        <BenefitItem text="AI-Powered Sermon Transcriptions" />
                        <BenefitItem text="Unlimited Prayer Groups & Logs" />
                        <BenefitItem text="Exclusive Guided Audio Meditations" />
                        <BenefitItem text="Advanced Growth Analytics" />
                        <BenefitItem text="Cloud Sync Across All Devices" />
                        <BenefitItem text="Priority Email Support" />
                    </View>

                    <TouchableOpacity style={styles.subscribeButton} activeOpacity={0.8}>
                        <Text style={styles.subscribeButtonText}>Start 7-Day Free Trial</Text>
                    </TouchableOpacity>
                    <Text style={styles.cancelAnytime}>Cancel anytime. No commitment.</Text>
                </View>

                {/* Free Card */}
                <View style={styles.freeCard}>
                    <Text style={styles.freeTitle}>Current Plan: Free</Text>
                    <Text style={styles.freeDesc}>You are currently on the basic plan with limited features.</Text>
                </View>

                <TouchableOpacity style={styles.restoreButton}>
                    <Text style={styles.restoreButtonText}>Restore Purchase</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Recurring billing. Terms and Privacy apply.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#111111',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    content: {
        padding: 24,
    },
    heroSection: {
        alignItems: 'center',
        marginBottom: 32,
        textAlign: 'center',
    },
    heroBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(232, 80, 58, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 16,
    },
    heroBadgeText: {
        color: '#E8503A',
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1,
    },
    heroTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#FFFFFF',
        textAlign: 'center',
        letterSpacing: -1,
        lineHeight: 38,
        marginBottom: 12,
    },
    heroSubtitle: {
        fontSize: 15,
        color: '#999999',
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 10,
    },
    proCard: {
        backgroundColor: '#111111',
        borderRadius: 28,
        padding: 32,
        borderWidth: 1,
        borderColor: '#E8503A',
        shadowColor: '#E8503A',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        marginBottom: 24,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 32,
    },
    planName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#999999',
        marginBottom: 4,
    },
    planPrice: {
        fontSize: 36,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    planPeriod: {
        fontSize: 16,
        fontWeight: '400',
        color: '#666666',
    },
    proLabel: {
        backgroundColor: '#E8503A',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    proLabelText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '900',
    },
    benefitsList: {
        gap: 16,
        marginBottom: 32,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    checkBadge: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#E8503A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    benefitText: {
        fontSize: 15,
        color: '#FFFFFF',
        fontWeight: '500',
    },
    subscribeButton: {
        backgroundColor: '#E8503A',
        height: 60,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    subscribeButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
    cancelAnytime: {
        fontSize: 13,
        color: '#666666',
        textAlign: 'center',
    },
    freeCard: {
        backgroundColor: '#111111',
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        marginBottom: 24,
        opacity: 0.8,
    },
    freeTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    freeDesc: {
        fontSize: 14,
        color: '#999999',
        lineHeight: 20,
    },
    restoreButton: {
        alignSelf: 'center',
        padding: 12,
        marginBottom: 40,
    },
    restoreButtonText: {
        color: '#666666',
        fontSize: 14,
        fontWeight: '600',
    },
    footer: {
        alignItems: 'center',
        paddingBottom: 40,
    },
    footerText: {
        fontSize: 12,
        color: '#333333',
        textAlign: 'center',
    },
});

export default SubscriptionScreen;
