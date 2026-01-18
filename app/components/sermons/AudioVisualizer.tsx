import React from 'react';
import { View, StyleSheet } from 'react-native';

interface AudioVisualizerProps {
    levels: number[];
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ levels }) => {
    return (
        <View style={styles.visualizerContainer}>
            {levels.map((level, i) => {
                const normalizedLevel = Math.max(0, Math.min(1, (level + 60) / 60));
                // Center-out bias: bars in the middle are taller
                const distFromMid = Math.abs(i - 20) / 20;
                const scale = 1 - (distFromMid * 0.4);
                const height = 10 + (normalizedLevel * 160 * scale);

                return (
                    <View
                        key={i}
                        style={[
                            styles.visualizerBar,
                            {
                                height: height,
                                opacity: 0.2 + (normalizedLevel * 0.8),
                                backgroundColor: i % 2 === 0 ? '#E8503A' : '#FFD35A'
                            }
                        ]}
                    />
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    visualizerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 180,
        gap: 2,
        position: 'absolute',
        top: 40,
        left: 0,
        right: 0,
        paddingHorizontal: 10,
    },
    visualizerBar: {
        width: 6,
        borderRadius: 3,
    },
});
