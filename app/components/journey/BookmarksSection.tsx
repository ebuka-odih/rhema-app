import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { IconBell, IconTrash } from '../Icons';
import { commonStyles } from './JourneyStyles';

interface BookmarksSectionProps {
    bookmarks: any[];
    onSelectBookmark: (bookmark: any) => void;
    onRemoveBookmark: (bookmark: any) => void;
}

export const BookmarksSection: React.FC<BookmarksSectionProps> = ({
    bookmarks,
    onSelectBookmark,
    onRemoveBookmark,
}) => {
    return (
        <View style={commonStyles.section}>
            <View style={commonStyles.sectionHeader}>
                <Text style={commonStyles.sectionTitle}>Bookmarked Verses</Text>
            </View>

            {bookmarks.length === 0 ? (
                <View style={commonStyles.emptyState}>
                    <IconBell size={32} color="rgba(255, 255, 255, 0.1)" />
                    <Text style={commonStyles.emptyText}>No bookmarked verses yet</Text>
                </View>
            ) : (
                <View style={commonStyles.entriesList}>
                    {bookmarks.map((bookmark, idx) => (
                        <View
                            key={bookmark.id || idx}
                            style={[
                                commonStyles.entryItem,
                                idx === bookmarks.length - 1 && { borderBottomWidth: 0 },
                                styles.bookmarkItemContainer
                            ]}
                        >
                            <TouchableOpacity
                                style={styles.bookmarkContent}
                                onPress={() => onSelectBookmark(bookmark)}
                            >
                                <Text style={commonStyles.entryTitle}>
                                    {bookmark.book} {bookmark.chapter}:{bookmark.verse}
                                </Text>
                                <Text style={[commonStyles.entryPreview, { marginTop: 4 }]} numberOfLines={2}>
                                    {bookmark.text || 'Loading verse text...'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() => onRemoveBookmark(bookmark)}
                            >
                                <IconTrash size={18} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    bookmarkItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    bookmarkContent: {
        flex: 1,
        marginRight: 16,
    },
    deleteButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    }
});
