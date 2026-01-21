import React from 'react';
import { View, Text, Modal, TouchableWithoutFeedback, TouchableOpacity } from 'react-native';
import { IconBold, IconItalic, IconUnderline, IconStrikethrough } from '../../Icons';
import { styles } from '../JournalEditor.styles';
import { FormatType } from '../../../hooks/journey/useTextFormatting';

interface FormatMenuModalProps {
    visible: boolean;
    onClose: () => void;
    onApply: (type: FormatType) => void;
}

export const FormatMenuModal: React.FC<FormatMenuModalProps> = ({ visible, onClose, onApply }) => {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.modalOverlay}>
                    <View style={styles.formatMenu}>
                        <View style={styles.menuHeader}>
                            <TouchableOpacity onPress={() => onApply('bold')} style={styles.headerTool}>
                                <IconBold size={18} color="#FFF" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => onApply('italic')} style={styles.headerTool}>
                                <IconItalic size={18} color="#FFF" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => onApply('underline')} style={styles.headerTool}>
                                <IconUnderline size={18} color="#FFF" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => onApply('strike')} style={styles.headerTool}>
                                <IconStrikethrough size={18} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.menuDivider} />
                        <TouchableOpacity onPress={() => onApply('title')} style={styles.menuItem}>
                            <Text style={styles.menuItemTitle}>Title</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onApply('heading')} style={styles.menuItem}>
                            <Text style={styles.menuItemHeading}>Heading</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onApply('subheading')} style={styles.menuItem}>
                            <Text style={styles.menuItemSubheading}>Subheading</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onApply('body')} style={styles.menuItem}>
                            <Text style={styles.menuItemBody}>Body</Text>
                        </TouchableOpacity>
                        <View style={styles.menuDivider} />
                        <TouchableOpacity onPress={() => onApply('bullet')} style={styles.menuItem}>
                            <Text style={styles.menuItemText}>• Bulleted List</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onApply('numbered')} style={styles.menuItem}>
                            <Text style={styles.menuItemText}>1. Numbered List</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};
