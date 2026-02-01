import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const commonStyles = StyleSheet.create({
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -0.5,
    },
    viewAll: {
        fontSize: 13,
        fontWeight: '700',
        color: '#E8503A',
    },
    emptyState: {
        backgroundColor: '#0D0D0D',
        borderRadius: 24,
        padding: 40,
        alignItems: 'center',
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        gap: 16,
    },
    emptyText: {
        fontSize: 14,
        color: '#555555',
        fontWeight: '600',
    },
    entriesList: {
        backgroundColor: '#0D0D0D',
        borderRadius: 24,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.04)',
    },
    entryItem: {
        paddingVertical: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    entryTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    entryMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    entryDate: {
        fontSize: 14,
        color: '#666666',
        marginRight: 10,
    },
    entryPreview: {
        flex: 1,
        fontSize: 14,
        color: '#444444',
    },
});
