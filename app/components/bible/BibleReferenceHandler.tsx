import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface BibleReferenceHandlerProps {
    text: string;
    onReferencePress: (reference: string) => void;
}

export const BibleReferenceHandler: React.FC<BibleReferenceHandlerProps> = ({ text, onReferencePress }) => {
    // Regex to match Bible references
    const referenceRegex = /\b(?:[123]\s)?[A-Z][a-z]+\.?\s\d+:\d+(?:-\d+)?\b/g;

    // Helper to parse markdown-like bolding **text**
    const renderContent = (content: string) => {
        // Split by references first
        const parts = content.split(referenceRegex);
        const matches = content.match(referenceRegex) || [];

        const elements: React.ReactNode[] = [];

        parts.forEach((part, i) => {
            // Handle bolding within the part
            const boldParts = part.split(/(\*\*.*?\*\*)/g);
            boldParts.forEach((bp, j) => {
                if (bp.startsWith('**') && bp.endsWith('**')) {
                    elements.push(
                        <Text key={`bp-${i}-${j}`} style={styles.boldText}>
                            {bp.slice(2, -2)}
                        </Text>
                    );
                } else {
                    elements.push(bp);
                }
            });

            // Add the reference if it exists
            if (matches[i]) {
                elements.push(
                    <Text
                        key={`ref-${i}`}
                        style={styles.referenceText}
                        onPress={() => onReferencePress(matches[i])}
                    >
                        {matches[i]}
                    </Text>
                );
            }
        });

        return elements;
    };

    return (
        <View style={styles.container}>
            <Text style={styles.textContainer}>
                {renderContent(text)}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    textContainer: {
        fontSize: 16,
        lineHeight: 26, // Increased line height for better readability
        color: '#CCCCCC',
    },
    boldText: {
        fontWeight: 'bold',
        color: '#FFFFFF', // Brighter white for headers
    },
    referenceText: {
        color: '#E8503A',
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
});
