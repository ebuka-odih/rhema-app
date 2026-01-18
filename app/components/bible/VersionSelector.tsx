import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';
import { BibleVersion } from '../../services/bibleService';

interface VersionSelectorProps {
    visible: boolean;
    versions: BibleVersion[];
    currentVersionId: string;
    onSelect: (version: BibleVersion) => void;
    onClose: () => void;
}

export const VersionSelector: React.FC<VersionSelectorProps> = ({
    visible,
    versions,
    currentVersionId,
    onSelect,
    onClose
}) => {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.selectorModal}>
                    <View style={styles.selectorHeader}>
                        <View style={styles.selectorTabs}>
                            <View style={styles.selectorTabActive}>
                                <Text style={styles.selectorTabTextActive}>VERSIONS</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Text style={styles.closeBtnText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={styles.listContent}>
                        {versions.map((v) => (
                            <TouchableOpacity
                                key={v.id}
                                style={[
                                    styles.selectionItem,
                                    currentVersionId === v.id && styles.selectionItemActive
                                ]}
                                onPress={() => onSelect(v)}
                            >
                                <Text style={[
                                    styles.selectionItemText,
                                    currentVersionId === v.id && styles.selectionItemTextActive
                                ]}>
                                    {v.name} ({v.short_name})
                                </Text>
                                {currentVersionId === v.id && (
                                    <View style={styles.activeIndicator} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    selectorModal: {
        backgroundColor: '#1A1A1A',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        height: '60%',
        paddingTop: 20,
    },
    selectorHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 20,
    },
    selectorTabs: {
        flexDirection: 'row',
        backgroundColor: '#0D0D0D',
        borderRadius: 12,
        padding: 4,
    },
    selectorTabActive: {
        backgroundColor: '#E8503A',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 8,
    },
    selectorTabTextActive: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    closeBtn: {
        padding: 4,
    },
    closeBtnText: {
        color: '#FFFFFF',
        fontSize: 20,
    },
    selectionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    selectionItemActive: {
        backgroundColor: 'rgba(232, 80, 58, 0.05)',
    },
    selectionItemText: {
        fontSize: 16,
        color: '#999999',
    },
    selectionItemTextActive: {
        color: '#E8503A',
        fontWeight: '700',
    },
    activeIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#E8503A',
    },
    listContent: {
        paddingBottom: 40,
    },
});
