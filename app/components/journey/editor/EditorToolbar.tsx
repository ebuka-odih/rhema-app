import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { IconFormat, IconBold, IconItalic, IconListBullet, IconMic } from '../../Icons';
import { styles } from '../JournalEditor.styles';
import { FormatType } from '../../../hooks/journey/useTextFormatting';

interface EditorToolbarProps {
    categories: string[];
    activeCategory: string;
    setActiveCategory: (cat: string) => void;
    showFormatMenu: boolean;
    setShowFormatMenu: (show: boolean) => void;
    applyFormat: (type: FormatType) => void;
    toggleVoiceTyping: () => void;
    isListening: boolean;
    voiceLevel: number;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
    categories,
    activeCategory,
    setActiveCategory,
    showFormatMenu,
    setShowFormatMenu,
    applyFormat,
    toggleVoiceTyping,
    isListening,
    voiceLevel
}) => {
    return (
        <View style={styles.toolbarContainer}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroller}
                contentContainerStyle={styles.categoryScrollerContent}
            >
                {categories.map(cat => (
                    <TouchableOpacity
                        key={cat}
                        onPress={() => setActiveCategory(cat)}
                        style={[
                            styles.categoryChip,
                            activeCategory === cat && styles.categoryChipActive
                        ]}
                    >
                        <Text style={[
                            styles.categoryChipText,
                            activeCategory === cat && styles.categoryChipTextActive
                        ]}>
                            {cat}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <View style={styles.toolbarDivider} />

            <View style={styles.formatIconRow}>
                <TouchableOpacity
                    style={[styles.toolBtn, showFormatMenu && styles.toolBtnActive]}
                    onPress={() => setShowFormatMenu(true)}
                >
                    <IconFormat size={20} color="#FFFFFF" />
                </TouchableOpacity>

                <View style={styles.formatIconGroup}>
                    <TouchableOpacity style={styles.toolBtn} onPress={() => applyFormat('bold')}>
                        <IconBold size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.toolBtn} onPress={() => applyFormat('italic')}>
                        <IconItalic size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.toolBtn} onPress={() => applyFormat('bullet')}>
                        <IconListBullet size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                <View style={{ flex: 1 }} />
                <View style={styles.verticalDivider} />

                <TouchableOpacity
                    style={[
                        styles.micBtn,
                        isListening && styles.micBtnActive,
                        isListening && { transform: [{ scale: 1 + (voiceLevel * 0.2) }] }
                    ]}
                    onPress={toggleVoiceTyping}
                >
                    <IconMic size={22} color={isListening ? '#FF4444' : '#FFFFFF'} />
                    {isListening && (
                        <View style={[
                            styles.micPulse,
                            {
                                transform: [{ scale: 1 + (voiceLevel * 1.5) }],
                                opacity: 0.5 - (voiceLevel * 0.3)
                            }
                        ]} />
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};
