import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { IconFont, IconSearch } from '../Icons';

interface BibleHeaderProps {
    book: string;
    chapter: number;
    shortVersion: string;
    onOpenBookSelector: () => void;
    onOpenVersionSelector: () => void;
    onToggleFontMenu: () => void;
}

export const BibleHeader: React.FC<BibleHeaderProps> = ({
    book,
    chapter,
    shortVersion,
    onOpenBookSelector,
    onOpenVersionSelector,
    onToggleFontMenu
}) => (
    <View style={styles.topNav}>
        <View style={styles.selectorGroup}>
            <TouchableOpacity
                style={styles.bookSelector}
                onPress={onOpenBookSelector}
            >
                <Text style={styles.bookHeader}>{book} {chapter}</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.versionBadge}
                onPress={onOpenVersionSelector}
            >
                <Text style={styles.versionLabel}>{shortVersion}</Text>
            </TouchableOpacity>
        </View>

        <View style={styles.navIcons}>
            <TouchableOpacity onPress={onToggleFontMenu} style={styles.navIcon}>
                <IconFont size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navIcon}>
                <IconSearch size={22} color="#FFFFFF" />
            </TouchableOpacity>
        </View>
    </View>
);

const styles = StyleSheet.create({
    topNav: {
        height: 64,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
        backgroundColor: '#0D0D0D',
    },
    selectorGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A1A1A',
        borderRadius: 20,
        paddingRight: 4,
    },
    bookSelector: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    versionBadge: {
        backgroundColor: 'rgba(232, 80, 58, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 4,
    },
    bookHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    versionLabel: {
        fontSize: 12,
        color: '#E8503A',
        fontWeight: '700',
    },
    navIcons: {
        flexDirection: 'row',
        gap: 20,
    },
    navIcon: {
        padding: 4,
    },
});
