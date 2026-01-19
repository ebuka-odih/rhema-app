import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Alert, ActivityIndicator, Modal } from 'react-native';
import { IconArrowLeft, IconLock, IconShield } from '../../components/Icons';
import { authService } from '../../services/auth';

const SecurityScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: '',
    });

    const handleChangePassword = async () => {
        if (passwords.new !== passwords.confirm) {
            Alert.alert('Error', 'New passwords do not match');
            return;
        }

        setLoading(true);
        const { data, error } = await authService.updatePassword({
            current_password: passwords.current,
            password: passwords.new,
            password_confirmation: passwords.confirm,
        });
        setLoading(false);

        if (error) {
            Alert.alert('Error', error.message);
        } else {
            Alert.alert('Success', 'Password updated successfully');
            setModalVisible(false);
            setPasswords({ current: '', new: '', confirm: '' });
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <IconArrowLeft size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Security</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionHeader}>Password</Text>
                <View style={styles.card}>
                    <TouchableOpacity style={styles.item} onPress={() => setModalVisible(true)}>
                        <View style={styles.itemLeft}>
                            <IconLock size={20} color="#E8503A" />
                            <Text style={styles.itemText}>Change Password</Text>
                        </View>
                        <Text style={styles.itemValue}>Update your password</Text>
                    </TouchableOpacity>
                </View>

                {/* Change Password Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Update Password</Text>

                            <TextInput
                                style={styles.modalInput}
                                placeholder="Current Password"
                                placeholderTextColor="#666"
                                secureTextEntry
                                value={passwords.current}
                                onChangeText={(text) => setPasswords({ ...passwords, current: text })}
                            />
                            <TextInput
                                style={styles.modalInput}
                                placeholder="New Password"
                                placeholderTextColor="#666"
                                secureTextEntry
                                value={passwords.new}
                                onChangeText={(text) => setPasswords({ ...passwords, new: text })}
                            />
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Confirm New Password"
                                placeholderTextColor="#666"
                                secureTextEntry
                                value={passwords.confirm}
                                onChangeText={(text) => setPasswords({ ...passwords, confirm: text })}
                            />

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.saveButton]}
                                    onPress={handleChangePassword}
                                    disabled={loading}
                                >
                                    {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Update</Text>}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                <Text style={styles.sectionHeader}>Authentication</Text>
                <View style={styles.card}>
                    <View style={styles.item}>
                        <View style={styles.itemLeft}>
                            <IconShield size={20} color="#E8503A" />
                            <View>
                                <Text style={styles.itemText}>Two-Factor Authentication</Text>
                                <Text style={styles.itemSubtext}>Add an extra layer of security</Text>
                            </View>
                        </View>
                        <Switch
                            trackColor={{ false: '#333333', true: '#E8503A' }}
                            thumbColor="#FFFFFF"
                            value={false}
                        />
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.item}>
                        <View style={styles.itemLeft}>
                            <IconShield size={20} color="#E8503A" />
                            <View>
                                <Text style={styles.itemText}>Biometric Login</Text>
                                <Text style={styles.itemSubtext}>Use FaceID or Fingerprint</Text>
                            </View>
                        </View>
                        <Switch
                            trackColor={{ false: '#333333', true: '#E8503A' }}
                            thumbColor="#FFFFFF"
                            value={true}
                        />
                    </View>
                </View>

                <Text style={styles.sectionHeader}>Device Sessions</Text>
                <View style={styles.card}>
                    <View style={styles.item}>
                        <View style={styles.itemLeft}>
                            <View style={styles.statusDot} />
                            <View>
                                <Text style={styles.itemText}>iPhone 15 Pro (This Device)</Text>
                                <Text style={styles.itemSubtext}>Lagos, Nigeria · Active Now</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <TouchableOpacity style={styles.logoutAllButton}>
                    <Text style={styles.logoutAllButtonText}>Sign Out of All Devices</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#111111',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    content: {
        padding: 24,
    },
    sectionHeader: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666666',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
        marginLeft: 4,
    },
    card: {
        backgroundColor: '#111111',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        marginBottom: 24,
    },
    item: {
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        flex: 1,
    },
    itemText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    itemSubtext: {
        fontSize: 12,
        color: '#666666',
        marginTop: 2,
    },
    itemValue: {
        fontSize: 12,
        color: '#444444',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        marginLeft: 56,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#00C853',
    },
    logoutAllButton: {
        backgroundColor: 'rgba(232, 80, 58, 0.1)',
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(232, 80, 58, 0.2)',
    },
    logoutAllButtonText: {
        color: '#E8503A',
        fontSize: 16,
        fontWeight: '700',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: '#111',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalInput: {
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        padding: 16,
        color: '#FFF',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 12,
    },
    modalButton: {
        flex: 1,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#222',
    },
    saveButton: {
        backgroundColor: '#E8503A',
    },
    cancelButtonText: {
        color: '#999',
        fontWeight: '600',
    },
    saveButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
});

export default SecurityScreen;
