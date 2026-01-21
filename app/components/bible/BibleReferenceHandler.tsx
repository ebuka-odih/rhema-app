import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';

interface BibleReferenceHandlerProps {
    text: string;
    onReferencePress: (reference: string) => void;
}

export const BibleReferenceHandler: React.FC<BibleReferenceHandlerProps> = ({ text, onReferencePress }) => {
    // Regex to match Bible references
    // Examples: John 3:16, 1 Corinthians 13:4-8, Matthew 24:14
    const referenceRegex = /\b(?:[123]\s)?[A-Z][a-z]+\.?\s\d+:\d+(?:-\d+)?\b/g;

    const parts = text.split(referenceRegex);
    const matches = text.match(referenceRegex) || [];

    return (
        <Text style={styles.textContainer}>
            {parts.map((part, i) => (
                <React.Fragment key={i}>
                    {part}
                    {matches[i] && (
                        <Text
                            style={styles.referenceText}
                            onPress={() => onReferencePress(matches[i])}
                        >
                            {matches[i]}
                        </Text>
                    )}
                </React.Fragment>
            ))}
        </Text>
    );
};

const styles = StyleSheet.create({
    textContainer: {
        fontSize: 16,
        lineHeight: 24,
        color: '#CCCCCC',
    },
    referenceText: {
        color: '#E8503A',
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
});
