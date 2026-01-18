import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
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
    if (!visible) return null;

    return (
        <View style={styles.container}>
            <View style={styles.menu}>
                <View style={styles.colorRow}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorScroll}>
                        {HIGHLIGHT_COLORS.map((color) => (
                            <TouchableOpacity
                                key={color}
                                style={[styles.colorCircle, { backgroundColor: color }]}
                                onPress={() => onSelectColor(color)}
                            />
                        ))}
                    </ScrollView>
                    <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
                        <IconTrash size={20} color="#999999" />
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <IconClose size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.actionButton}>
                        <IconShare size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={() => onSelectColor('#E8503A')}>
                        <IconStar size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <IconComment size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
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
    },
    colorCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    removeButton: {
        padding: 8,
    },
    divider: {
        width: 1,
        height: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginHorizontal: 8,
    },
    closeButton: {
        padding: 8,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 20,
        marginTop: 8,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
    },
    actionButton: {
        padding: 8,
    }
});
