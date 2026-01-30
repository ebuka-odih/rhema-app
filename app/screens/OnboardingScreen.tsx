import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Dimensions,
    Animated
} from 'react-native';
import {
    IconBible,
    IconMic,
    IconClock,
    IconPen,
    IconArrowRight,
    IconCheck
} from '../components/Icons';

const { width } = Dimensions.get('window');

interface OnboardingScreenProps {
    onComplete: () => void;
    onSkip: () => void;
}

const ONBOARDING_DATA = {
    "screens": [
        {
            "id": "orientation",
            "type": "intro",
            "icon": "book-open",
            "headline": [
                { "text": "Reflect.", "emphasis": "primary" },
                { "text": "Grow.", "emphasis": "primary" },
                { "text": "Flow.", "emphasis": "accent" }
            ],
            "description": "Your digital sanctuary for Scripture, reflection, and spiritual growth.",
            "cta": "Continue"
        },
        {
            "id": "bible_and_sermons",
            "type": "feature",
            "icon": "microphone",
            "headline": [
                { "text": "Capture", "emphasis": "primary" },
                { "text": "the Word.", "emphasis": "accent" }
            ],
            "description": "Record sermons, teachings, or personal reflections — and get them transcribed automatically.",
            "supportingText": "Never lose a message that spoke to you.",
            "cta": "Next"
        },
        {
            "id": "prayer_and_discipline",
            "type": "feature",
            "icon": "clock",
            "headline": [
                { "text": "Pray.", "emphasis": "primary" },
                { "text": "Fast.", "emphasis": "primary" },
                { "text": "Stay Consistent.", "emphasis": "accent" }
            ],
            "description": "Set prayer reminders, join fasting groups, and build spiritual discipline with intention.",
            "cta": "Next"
        },
        {
            "id": "notes_and_growth",
            "type": "feature",
            "icon": "edit",
            "headline": [
                { "text": "Write.", "emphasis": "primary" },
                { "text": "Reflect.", "emphasis": "primary" },
                { "text": "Grow.", "emphasis": "accent" }
            ],
            "description": "Take notes, write reflections, and revisit insights from Scripture and sermons anytime.",
            "cta": "Begin"
        }
    ]
};

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete, onSkip }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const step = ONBOARDING_DATA.screens[currentStep];

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        // Reset animations
        fadeAnim.setValue(0);
        slideAnim.setValue(20);

        // Run animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();
    }, [currentStep]);

    const handleNext = () => {
        if (currentStep < ONBOARDING_DATA.screens.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete();
        }
    };

    const renderIcon = (iconName: string) => {
        const size = 64;
        const color = "#E8503A"; // wf-primary
        switch (iconName) {
            case 'book-open': return <IconBible size={size} color={color} />;
            case 'microphone': return <IconMic size={size} color={color} />;
            case 'clock': return <IconClock size={size} color={color} />;
            case 'edit': return <IconPen size={size} color={color} />;
            default: return <IconBible size={size} color={color} />;
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Skip Button */}
                <TouchableOpacity
                    onPress={onSkip}
                    style={styles.skipButton}
                >
                    <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>

                {/* Progress Indicator */}
                <View style={styles.progressContainer}>
                    {ONBOARDING_DATA.screens.map((_, idx) => (
                        <View
                            key={idx}
                            style={[
                                styles.progressBar,
                                idx === currentStep ? styles.progressBarActive : styles.progressBarInactive
                            ]}
                        />
                    ))}
                </View>

                {/* Content Area */}
                <Animated.View
                    style={[
                        styles.contentArea,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <View style={styles.iconWrapper}>
                        {renderIcon(step.icon)}
                    </View>

                    <View style={styles.headlineContainer}>
                        {step.headline.map((h, i) => (
                            <Text
                                key={i}
                                style={[
                                    styles.headlineText,
                                    h.emphasis === 'accent' ? styles.headlineAccent : styles.headlinePrimary
                                ]}
                            >
                                {h.text}
                            </Text>
                        ))}
                    </View>

                    <Text style={styles.descriptionText}>
                        {step.description}
                    </Text>

                    {step.supportingText && (
                        <Text style={styles.supportingText}>
                            {step.supportingText}
                        </Text>
                    )}
                </Animated.View>

                {/* Footer Action */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        onPress={handleNext}
                        style={styles.ctaButton}
                        activeOpacity={0.9}
                    >
                        <View style={styles.ctaContent}>
                            <Text style={styles.ctaText}>{step.cta}</Text>
                            {currentStep === ONBOARDING_DATA.screens.length - 1 ?
                                <IconCheck size={20} color="#000000" /> :
                                <IconArrowRight size={20} color="#000000" />
                            }
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#0D0D0D',
    },
    container: {
        flex: 1,
        paddingHorizontal: 32,
        paddingVertical: 24,
        justifyContent: 'space-between',
        position: 'relative',
    },
    skipButton: {
        position: 'absolute',
        top: 20,
        right: 32,
        zIndex: 20,
    },
    skipText: {
        color: '#666666',
        fontSize: 14,
        fontWeight: '500',
    },
    progressContainer: {
        flexDirection: 'row',
        marginTop: 40,
        marginBottom: 40,
        gap: 8,
    },
    progressBar: {
        height: 4,
        borderRadius: 2,
    },
    progressBarActive: {
        width: 32,
        backgroundColor: '#E8503A',
    },
    progressBarInactive: {
        width: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    contentArea: {
        flex: 1,
        justifyContent: 'center',
    },
    iconWrapper: {
        width: 96,
        height: 96,
        backgroundColor: 'rgba(232, 80, 58, 0.1)',
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
        borderWidth: 1,
        borderColor: 'rgba(232, 80, 58, 0.2)',
    },
    headlineContainer: {
        marginBottom: 24,
    },
    headlineText: {
        fontSize: 48,
        fontWeight: 'bold',
        lineHeight: 56,
    },
    headlinePrimary: {
        color: '#FFFFFF',
    },
    headlineAccent: {
        color: '#E8503A',
    },
    descriptionText: {
        color: '#999999',
        fontSize: 18,
        lineHeight: 28,
        maxWidth: 300,
        marginBottom: 16,
    },
    supportingText: {
        color: '#FFD35A',
        fontSize: 14,
        fontWeight: '500',
        fontStyle: 'italic',
    },
    footer: {
        marginTop: 'auto',
        marginBottom: 20,
    },
    ctaButton: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 18,
        borderRadius: 99,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    ctaContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    ctaText: {
        color: '#000000',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default OnboardingScreen;
