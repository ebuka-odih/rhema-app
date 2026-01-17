import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface FontSettingsMenuProps {
    visible: boolean;
    fontSize: number;
    onUpdateFontSize: (size: number) => void;
}

export const FontSettingsMenu: React.FC<FontSettingsMenuProps> = ({
    visible,
    fontSize,
    onUpdateFontSize
}) => {
    if (!visible) return null;

    return (
        <View style={styles.menuOverlay}>
            <Text style={styles.menuLabel}>TEXT SIZE</Text>
            <View style={styles.fontSizeControls}>
                <TouchableOpacity
                    onPress={() => onUpdateFontSize(Math.max(14, fontSize - 2))}
                    style={styles.fontSizeBtn}
                >
                    <Text style={styles.fontSizeBtnText}>A-</Text>
                </TouchableOpacity>
                <View style={styles.fontSizeDivider} />
                <TouchableOpacity
                    onPress={() => onUpdateFontSize(Math.min(32, fontSize + 2))}
                    style={styles.fontSizeBtn}
                >
                    <Text style={styles.fontSizeBtnText}>A+</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    menuOverlay: {
        position: 'absolute',
        top: 64,
        right: 20,
        backgroundColor: '#1A1A1A',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        zIndex: 100,
        width: 200,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 20,
    },
    menuLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#999999',
        letterSpacing: 1,
        marginBottom: 16,
    },
    fontSizeControls: {
        flexDirection: 'row',
        backgroundColor: '#222222',
        borderRadius: 10,
        alignItems: 'center',
    },
    fontSizeBtn: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    fontSizeBtnText: {
        fontSize: 18,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    fontSizeDivider: {
        width: 1,
        height: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
});
