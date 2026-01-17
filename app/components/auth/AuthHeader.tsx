import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { IconArrowLeft } from '../Icons';

interface AuthHeaderProps {
    onBack: () => void;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ onBack }) => (
    <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <IconArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
    </View>
);

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: -8,
    },
});
