import React from 'react';
import { View } from 'react-native';

export enum AppleAuthenticationScope {
  FULL_NAME = 0,
  EMAIL = 1,
}

export enum AppleAuthenticationButtonType {
  SIGN_IN = 0,
}

export enum AppleAuthenticationButtonStyle {
  WHITE = 0,
}

export async function isAvailableAsync(): Promise<boolean> {
  return false;
}

export async function signInAsync(): Promise<never> {
  throw new Error('Apple Sign-In is not available on web.');
}

type AppleButtonProps = {
  onPress?: () => void;
  style?: any;
};

export function AppleAuthenticationButton({ onPress, style }: AppleButtonProps) {
  return <View onTouchEnd={onPress} style={style} />;
}
