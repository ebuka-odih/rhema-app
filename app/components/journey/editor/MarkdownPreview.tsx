import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../JournalEditor.styles';

import { BibleReferenceHandler } from '../../bible/BibleReferenceHandler';

interface MarkdownPreviewProps {
    content: string;
    interimText?: string;
    onPress: () => void;
    onNavigateToBible?: (book: string, chapter: number) => void;
}

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content, interimText, onPress, onNavigateToBible }) => {
    const handleReferencePress = (reference: string) => {
        if (!onNavigateToBible) return;
        const parts = reference.match(/^(.+?)\s+(\d+):(\d+)(?:-(\d+))?$/);
        if (parts) {
            const [_, book, chapter] = parts;
            onNavigateToBible(book, parseInt(chapter));
        }
    };

    if (!content && !interimText) {
        return (
            <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={styles.previewContainer}>
                <Text style={styles.placeholderText}>Start typing your reflection...</Text>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={styles.previewContainer}>
            {content.split('\n').map((line, i) => {
                if (line.startsWith('# ')) return <Text key={i} style={styles.previewTitle}>{line.substring(2)}</Text>;
                if (line.startsWith('## ')) return <Text key={i} style={styles.previewHeading}>{line.substring(3)}</Text>;
                if (line.startsWith('### ')) return <Text key={i} style={styles.previewSubheading}>{line.substring(4)}</Text>;
                if (line.startsWith('• ')) return <Text key={i} style={styles.previewListItem}>• {line.substring(2)}</Text>;
                if (line.startsWith('> ')) return (
                    <View key={i} style={styles.previewQuote}>
                        <Text style={styles.previewQuoteText}>{line.substring(2)}</Text>
                    </View>
                );

                const isLastLine = i === content.split('\n').length - 1;
                return (
                    <View key={i} style={{ marginBottom: 4 }}>
                        <BibleReferenceHandler
                            text={line || ' '}
                            onReferencePress={handleReferencePress}
                        />
                        {isLastLine && interimText ? (
                            <Text style={styles.interimPreviewText}> {interimText}</Text>
                        ) : null}
                    </View>
                );
            })}
        </TouchableOpacity>
    );
};
