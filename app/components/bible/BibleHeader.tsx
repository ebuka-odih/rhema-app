import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { IconFont, IconSearch } from '../Icons';

interface BibleHeaderProps {
    book: string;
    chapter: number;
    shortVersion: string;
    onOpenBookSelector: () => void;
    onOpenVersionSelector: () => void;
    onToggleFontMenu: () => void;
    onOpenSearch: () => void;
}

export const BibleHeader: React.FC<BibleHeaderProps> = ({
    book,
    chapter,
    shortVersion,
    onOpenBookSelector,
    onOpenVersionSelector,
    onToggleFontMenu,
    onOpenSearch
}) => {
    const handlePress = (callback: () => void) => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        callback();
    };

    return (
        <View style={styles.topNav}>
            <View style={styles.selectorGroup}>
                <Pressable
                    style={({ pressed }) => [styles.bookSelector, pressed && styles.pressedSelector]}
                    onPress={() => handlePress(onOpenBookSelector)}
                >
                    <Text style={styles.bookHeader} numberOfLines={1} ellipsizeMode="tail">{book} {chapter}</Text>
                </Pressable>
                <View style={styles.divider} />
                <Pressable
                    style={({ pressed }) => [styles.versionBadge, pressed && styles.pressedSelector]}
                    onPress={() => handlePress(onOpenVersionSelector)}
                >
                    <Text style={styles.versionLabel}>{shortVersion}</Text>
                </Pressable>
            </View>

            <View style={styles.navIcons}>
                <Pressable
                    onPress={() => handlePress(onToggleFontMenu)}
                    style={({ pressed }) => [styles.navIcon, pressed && styles.pressedIcon]}
                >
                    <IconFont size={24} color="#FFFFFF" />
                </Pressable>
                <Pressable
                    onPress={() => handlePress(onOpenSearch)}
                    style={({ pressed }) => [styles.navIcon, pressed && styles.pressedIcon]}
                >
                    <IconSearch size={24} color="#FFFFFF" />
                </Pressable>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    topNav: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
        backgroundColor: '#0D0D0D',
    },
    selectorGroup: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A1A1A',
        borderRadius: 16,
        padding: 4,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        marginRight: 12,
    },
    bookSelector: {
        flex: 1,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
    },
    versionBadge: {
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 12,
    },
    divider: {
        width: 1,
        height: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginHorizontal: 0,
    },
    pressedSelector: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    bookHeader: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: -0.3,
    },
    versionLabel: {
        fontSize: 11,
        color: '#E8503A',
        fontWeight: '800', // Extra bold for badge
        letterSpacing: 0.5,
    },
    navIcons: {
        flexDirection: 'row',
        gap: 8,
    },
    navIcon: {
        padding: 6,
        borderRadius: 20,
    },
    pressedIcon: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
});
