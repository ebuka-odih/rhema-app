import React from 'react';
import { View } from 'react-native';

type QRCodeProps = {
  size?: number;
  backgroundColor?: string;
};

const QRCode = ({ size = 120, backgroundColor = '#FFFFFF' }: QRCodeProps) => {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        backgroundColor,
        borderWidth: 1,
        borderColor: '#000000',
      }}
    />
  );
};

export default QRCode;
