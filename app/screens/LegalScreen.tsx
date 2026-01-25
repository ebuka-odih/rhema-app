import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconArrowLeft } from '../components/Icons';

type Tab = 'TERMS' | 'PRIVACY';

interface LegalScreenProps {
    onBack: () => void;
}

const LegalScreen: React.FC<LegalScreenProps> = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState<Tab>('TERMS');

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <IconArrowLeft size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Legal</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'TERMS' && styles.activeTab]}
                    onPress={() => setActiveTab('TERMS')}
                >
                    <Text style={[styles.tabText, activeTab === 'TERMS' && styles.activeTabText]}>
                        Terms of Service
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'PRIVACY' && styles.activeTab]}
                    onPress={() => setActiveTab('PRIVACY')}
                >
                    <Text style={[styles.tabText, activeTab === 'PRIVACY' && styles.activeTabText]}>
                        Privacy Policy
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                {activeTab === 'TERMS' ? (
                    <View>
                        <Text style={styles.sectionTitle}>1. Introduction</Text>
                        <Text style={styles.paragraph}>
                            Welcome to WordFlow. By accessing or using our app, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the app.
                        </Text>

                        <Text style={styles.sectionTitle}>2. Use of the App</Text>
                        <Text style={styles.paragraph}>
                            You agree to use the app only for lawful purposes and in accordance with these Terms. You are responsible for your own communications and for any consequences thereof.
                        </Text>

                        <Text style={styles.sectionTitle}>3. User Accounts</Text>
                        <Text style={styles.paragraph}>
                            To access certain features, you may need to create an account. You agree to provide accurate, current, and complete information during the registration process.
                        </Text>

                        <Text style={styles.sectionTitle}>4. Intellectual Property</Text>
                        <Text style={styles.paragraph}>
                            The app and its original content, features, and functionality are owned by WordFlow and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
                        </Text>

                        <Text style={styles.sectionTitle}>5. Termination</Text>
                        <Text style={styles.paragraph}>
                            We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                        </Text>

                        <Text style={styles.sectionTitle}>6. Changes</Text>
                        <Text style={styles.paragraph}>
                            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion.
                        </Text>
                    </View>
                ) : (
                    <View>
                        <Text style={styles.sectionTitle}>1. Information We Collect</Text>
                        <Text style={styles.paragraph}>
                            We collect information you provide directly to us, such as when you create an account, update your profile, or communicate with us. This may include your name, email address, and other contact information.
                        </Text>

                        <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
                        <Text style={styles.paragraph}>
                            We use the information we collect to provide, maintain, and improve our services, to develop new ones, and to protect us and our users. We also use this information to offer you tailored content.
                        </Text>

                        <Text style={styles.sectionTitle}>3. Sharing of Information</Text>
                        <Text style={styles.paragraph}>
                            We do not share your personal information with companies, organizations, or individuals outside of WordFlow unless one of the following circumstances applies: with your consent, for legal reasons, or for external processing.
                        </Text>

                        <Text style={styles.sectionTitle}>4. Data Security</Text>
                        <Text style={styles.paragraph}>
                            We work hard to protect WordFlow and our users from unauthorized access to or unauthorized alteration, disclosure, or destruction of information we hold.
                        </Text>

                        <Text style={styles.sectionTitle}>5. Your Choices</Text>
                        <Text style={styles.paragraph}>
                            You may update, correct, or delete information about you at any time by logging into your online account or by contacting us.
                        </Text>
                    </View>
                )}
                <View style={styles.bottomSpacer} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D0D0D',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    placeholder: {
        width: 40,
    },
    tabContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    tab: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#E8503A',
    },
    tabText: {
        color: '#666666',
        fontSize: 16,
        fontWeight: '600',
    },
    activeTabText: {
        color: '#E8503A',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginTop: 24,
        marginBottom: 12,
    },
    paragraph: {
        fontSize: 16,
        color: '#CCCCCC',
        lineHeight: 24,
        marginBottom: 16,
    },
    bottomSpacer: {
        height: 48,
    },
});

export default LegalScreen;
