import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator, Alert } from 'react-native';
import { IconArrowLeft, IconUser, IconEdit, IconCheck } from '../../components/Icons';
import { useSession, authService } from '../../services/auth';

const InputField: React.FC<{
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    editable?: boolean;
}> = ({ label, value, onChangeText, placeholder, editable = true }) => (
    <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>{label}</Text>
        <View style={styles.inputWrapper}>
            <TextInput
                style={[styles.input, !editable && styles.inputDisabled]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#333333"
                editable={editable}
            />
        </View>
    </View>
);

const PersonalInfoScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { data: session } = useSession();
    const user = session?.user;

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
            setPhone(user.phone || '');
        }
    }, [user]);

    const handleUpdate = async () => {
        setLoading(true);
        const { data, error } = await authService.updateUser({ name, phone });
        setLoading(false);

        if (error) {
            Alert.alert('Error', error.message);
        } else {
            Alert.alert('Success', 'Profile updated successfully');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <IconArrowLeft size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Personal Info</Text>
                <TouchableOpacity
                    style={styles.saveHeaderButton}
                    onPress={handleUpdate}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#E8503A" />
                    ) : (
                        <Text style={styles.saveHeaderText}>Save</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Avatar Section */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatarWrapper}>
                        <View style={styles.avatarContainer}>
                            <Text style={styles.avatarText}>{name.charAt(0) || 'U'}</Text>
                        </View>
                        <TouchableOpacity style={styles.editBadge}>
                            <IconEdit size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.avatarLabel}>Change Profile Photo</Text>
                </View>

                {/* Form Section */}
                <View style={styles.section}>
                    <InputField
                        label="Full Name"
                        value={name}
                        onChangeText={setName}
                        placeholder="John Doe"
                    />
                    <InputField
                        label="Email Address"
                        value={email}
                        onChangeText={setEmail}
                        placeholder="john@example.com"
                        editable={false}
                    />
                    <InputField
                        label="Phone Number"
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="+1 234 567 8900"
                    />
                </View>

                <View style={styles.infoNote}>
                    <Text style={styles.infoNoteText}>
                        Email address cannot be changed. Contact support if you need to update it.
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.mainSaveButton}
                    onPress={handleUpdate}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.mainSaveButtonText}>Update Profile</Text>
                    )}
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
    saveHeaderButton: {
        paddingHorizontal: 12,
    },
    saveHeaderText: {
        color: '#E8503A',
        fontSize: 16,
        fontWeight: '700',
    },
    content: {
        padding: 24,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: 12,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#111111',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    avatarText: {
        fontSize: 40,
        fontWeight: '800',
        color: '#E8503A',
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#E8503A',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#000000',
    },
    avatarLabel: {
        fontSize: 14,
        color: '#E8503A',
        fontWeight: '600',
    },
    section: {
        gap: 20,
        marginBottom: 32,
    },
    inputContainer: {
        gap: 8,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666666',
        marginLeft: 4,
    },
    inputWrapper: {
        backgroundColor: '#111111',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    input: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#FFFFFF',
    },
    inputDisabled: {
        color: '#444444',
    },
    infoNote: {
        paddingHorizontal: 8,
        marginBottom: 40,
    },
    infoNoteText: {
        fontSize: 12,
        color: '#444444',
        lineHeight: 18,
        textAlign: 'center',
    },
    mainSaveButton: {
        backgroundColor: '#E8503A',
        height: 60,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainSaveButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
});

export default PersonalInfoScreen;
