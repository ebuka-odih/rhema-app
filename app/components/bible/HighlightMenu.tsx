import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Animated, Pressable, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { IconShare, IconComment, IconTrash, IconClose, IconStar } from '../Icons';

export const HIGHLIGHT_COLORS = [
    '#FDE047', // Yellow
    '#86EFAC', // Green
    '#93C5FD', // Blue
    '#F9A8D4', // Pink
    '#C4B5FD', // Purple
    '#FDA4AF', // Rose
];

interface HighlightMenuProps {
    visible: boolean;
    onSelectColor: (color: string) => void;
    onRemove: () => void;
    onClose: () => void;
}

export const HighlightMenu: React.FC<HighlightMenuProps> = ({
    visible,
    onSelectColor,
    onRemove,
    onClose
}) => {
    const slideAnim = useRef(new Animated.Value(50)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                })
            ]).start();
        } else {
            // Reset for next time (handled by unmounting usually, but good practice)
            slideAnim.setValue(50);
            opacityAnim.setValue(0);
        }
    }, [visible, slideAnim, opacityAnim]);

    const handleAction = (callback: () => void, type: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium) => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(type);
        }
        callback();
    };

    if (!visible) return null;

    return (
        <Animated.View style={[
            styles.container,
            {
                opacity: opacityAnim,
                transform: [{ translateY: slideAnim }]
            }
        ]}>
            <View style={styles.menu}>
                <View style={styles.colorRow}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorScroll}>
                        {HIGHLIGHT_COLORS.map((color) => (
                            <Pressable
                                key={color}
                                style={({ pressed }) => [
                                    styles.colorCircle,
                                    { backgroundColor: color },
                                    pressed && styles.pressedCircle
                                ]}
                                onPress={() => handleAction(() => onSelectColor(color), Haptics.ImpactFeedbackStyle.Light)}
                            />
                        ))}
                    </ScrollView>
                    <Pressable
                        style={({ pressed }) => [styles.iconBtn, pressed && styles.pressedIcon]}
                        onPress={() => handleAction(onRemove, Haptics.ImpactFeedbackStyle.Medium)}
                    >
                        <IconTrash size={20} color="#999999" />
                    </Pressable>
                    <View style={styles.divider} />
                    <Pressable
                        style={({ pressed }) => [styles.iconBtn, pressed && styles.pressedIcon]}
                        onPress={() => handleAction(onClose, Haptics.ImpactFeedbackStyle.Light)}
                    >
                        <IconClose size={20} color="#FFFFFF" />
                    </Pressable>
                </View>

                <View style={styles.actionRow}>
                    <Pressable style={({ pressed }) => [styles.actionButton, pressed && styles.pressedAction]}>
                        <IconShare size={20} color="#FFFFFF" />
                    </Pressable>
                    <Pressable
                        style={({ pressed }) => [styles.actionButton, pressed && styles.pressedAction]}
                        onPress={() => handleAction(() => onSelectColor('#E8503A'), Haptics.ImpactFeedbackStyle.Medium)}
                    >
                        <IconStar size={20} color="#FFFFFF" />
                    </Pressable>
                    <Pressable style={({ pressed }) => [styles.actionButton, pressed && styles.pressedAction]}>
                        <IconComment size={20} color="#FFFFFF" />
                    </Pressable>
                </View>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 100,
        left: 20,
        right: 20,
        zIndex: 1000,
    },
    menu: {
        backgroundColor: '#1A1A1A',
        borderRadius: 20,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 10,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    colorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    colorScroll: {
        gap: 12,
        paddingRight: 12,
        alignItems: 'center',
    },
    colorCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    pressedCircle: {
        transform: [{ scale: 0.9 }],
        opacity: 0.8,
    },
    iconBtn: {
        padding: 8,
        borderRadius: 20,
    },
    pressedIcon: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    divider: {
        width: 1,
        height: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginHorizontal: 8,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 32,
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
    },
    actionButton: {
        padding: 12,
        backgroundColor: '#2A2A2A',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    pressedAction: {
        backgroundColor: '#333333',
        transform: [{ scale: 0.95 }],
    },
});
