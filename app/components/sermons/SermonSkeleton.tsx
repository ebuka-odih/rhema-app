import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';

export const SermonSkeleton = () => {
    const animatedValue = new Animated.Value(0);

    React.useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const opacity = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.dateSkeleton, { opacity }]} />
            <Animated.View style={[styles.titleSkeleton, { opacity }]} />
            <View style={styles.footer}>
                <Animated.View style={[styles.durationSkeleton, { opacity }]} />
                <Animated.View style={[styles.buttonSkeleton, { opacity }]} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1A1A1A',
        borderRadius: 16,
        padding: 16,
        gap: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    dateSkeleton: {
        width: 60,
        height: 12,
        backgroundColor: '#333',
        borderRadius: 6,
    },
    titleSkeleton: {
        width: '80%',
        height: 20,
        backgroundColor: '#333',
        borderRadius: 10,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    durationSkeleton: {
        width: 40,
        height: 12,
        backgroundColor: '#333',
        borderRadius: 6,
    },
    buttonSkeleton: {
        width: 80,
        height: 24,
        backgroundColor: '#333',
        borderRadius: 12,
    },
});
