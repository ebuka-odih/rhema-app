import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { IconArrowLeft, IconHelp, IconMessage, IconStar, IconChevronRight } from '../../components/Icons';

const SupportItem: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
}> = ({ icon, title, description }) => (
    <TouchableOpacity
        style={styles.supportItem}
        onPress={() => Alert.alert("Coming Soon", `Support for ${title} will be available in a future update.`)}
    >
        <View style={styles.supportLeft}>
            <View style={styles.supportIconContainer}>{icon}</View>
            <View style={styles.supportTextContainer}>
                <Text style={styles.supportTitle}>{title}</Text>
                <Text style={styles.supportDescription}>{description}</Text>
            </View>
        </View>
        <IconChevronRight size={20} color="#333333" />
    </TouchableOpacity>
);

const HelpSupportScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <IconArrowLeft size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help & Support</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.searchSection}>
                    <Text style={styles.heroText}>How can we help you today?</Text>
                    <View style={styles.searchBar}>
                        <TextInput
                            placeholder="Search for articles, guides..."
                            placeholderTextColor="#666666"
                            style={styles.searchInput}
                        />
                    </View>
                </View>

                <Text style={styles.sectionHeader}>Quick Links</Text>
                <View style={styles.card}>
                    <SupportItem
                        icon={<IconHelp size={20} color="#FFFFFF" />}
                        title="FAQ"
                        description="Find answers to common questions"
                    />
                    <View style={styles.divider} />
                    <SupportItem
                        icon={<IconMessage size={20} color="#FFFFFF" />}
                        title="Live Chat"
                        description="Talk to our support team"
                    />
                    <View style={styles.divider} />
                    <SupportItem
                        icon={<IconStar size={20} color="#FFFFFF" />}
                        title="Submit Feedback"
                        description="Help us improve Rhema Daily"
                    />
                </View>

                <Text style={styles.sectionHeader}>Important Articles</Text>
                <View style={styles.card}>
                    <TouchableOpacity
                        style={styles.articleItem}
                        onPress={() => Alert.alert("Coming Soon", "Help articles are being prepared.")}
                    >
                        <Text style={styles.articleTitle}>Getting started with Rhema Daily</Text>
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity
                        style={styles.articleItem}
                        onPress={() => Alert.alert("Coming Soon", "Help articles are being prepared.")}
                    >
                        <Text style={styles.articleTitle}>Managing your Pro subscription</Text>
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity
                        style={styles.articleItem}
                        onPress={() => Alert.alert("Coming Soon", "Help articles are being prepared.")}
                    >
                        <Text style={styles.articleTitle}>How to use the Sermon Recorder</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.socialSection}>
                    <Text style={styles.socialTitle}>Follow our community</Text>
                    <View style={styles.socialIcons}>
                        {/* These would be social icons */}
                        <View style={styles.socialPlaceholder} />
                        <View style={styles.socialPlaceholder} />
                        <View style={styles.socialPlaceholder} />
                    </View>
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
    searchSection: {
        marginBottom: 40,
    },
    heroText: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 20,
        letterSpacing: -0.5,
    },
    searchBar: {
        backgroundColor: '#111111',
        borderRadius: 16,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    searchInput: {
        height: 50,
        color: '#FFFFFF',
        fontSize: 15,
    },
    sectionHeader: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666666',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
        marginLeft: 4,
    },
    card: {
        backgroundColor: '#111111',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        marginBottom: 24,
    },
    supportItem: {
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    supportLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        flex: 1,
    },
    supportIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#1A1A1A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    supportTextContainer: {
        flex: 1,
    },
    supportTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    supportDescription: {
        fontSize: 12,
        color: '#666666',
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        marginLeft: 20,
    },
    articleItem: {
        padding: 20,
    },
    articleTitle: {
        fontSize: 15,
        color: '#FFFFFF',
        fontWeight: '500',
    },
    socialSection: {
        alignItems: 'center',
        marginTop: 20,
        paddingBottom: 40,
    },
    socialTitle: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 16,
    },
    socialIcons: {
        flexDirection: 'row',
        gap: 20,
    },
    socialPlaceholder: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#111111',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
});

export default HelpSupportScreen;
