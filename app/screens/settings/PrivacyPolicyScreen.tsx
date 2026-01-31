import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { IconArrowLeft } from '../../components/Icons';

const PrivacyPolicyScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <IconArrowLeft size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy Policy</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.lastUpdated}>Last Updated: January 2026</Text>

                <Text style={styles.sectionTitle}>1. Information We Collect</Text>
                <Text style={styles.text}>
                    We collect information you provide directly to us when you create an account,
                    such as your name, email address, and profile preferences. We also collect content
                    you create, such as sermon notes and prayer requests.
                </Text>

                <Text style={styles.sectionTitle}>2. How We Use Information</Text>
                <Text style={styles.text}>
                    We use the information we collect to provide, maintain, and improve our services,
                    to personalize your experience, and to communicate with you about updates and features.
                </Text>

                <Text style={styles.sectionTitle}>3. Information Sharing</Text>
                <Text style={styles.text}>
                    We do not share your personal information with third parties except as described in
                    this policy, such as with your consent or to comply with legal obligations.
                    In community features (like prayer groups), your profile information may be
                    visible to other participants based on your privacy settings.
                </Text>

                <Text style={styles.sectionTitle}>4. Data Security</Text>
                <Text style={styles.text}>
                    We take reasonable measures to protect your personal information from loss, theft,
                    misuse, and unauthorized access. However, no internet transmission is ever fully
                    secure or error-free.
                </Text>

                <Text style={styles.sectionTitle}>5. Your Choices</Text>
                <Text style={styles.text}>
                    You can access and update your account information and privacy settings within the app.
                    You may also delete your account at any time through the settings menu.
                </Text>

                <Text style={styles.sectionTitle}>6. AI and Personalization</Text>
                <Text style={styles.text}>
                    We use AI technologies to provide personalized scripture suggestions and sermon
                    transcriptions. This data is used solely to enhance your experience within
                    Rhema Daily.
                </Text>

                <Text style={styles.sectionTitle}>7. Contact Us</Text>
                <Text style={styles.text}>
                    If you have any questions about this Privacy Policy, please contact us through
                    the Help Center.
                </Text>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>BUILT BY E.E COLLECTIVE</Text>
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
    lastUpdated: {
        fontSize: 13,
        color: '#666666',
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        marginTop: 24,
        marginBottom: 12,
    },
    text: {
        fontSize: 15,
        lineHeight: 24,
        color: '#999999',
        marginBottom: 16,
    },
    footer: {
        marginTop: 40,
        paddingBottom: 40,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: '#333333',
        fontWeight: '600',
        letterSpacing: 1,
    },
});

export default PrivacyPolicyScreen;
