import React from 'react';
import { View } from 'react-native';

type DateTimePickerProps = {
  value?: Date;
  onChange?: (event: any, date?: Date) => void;
};

export default function DateTimePicker({ value = new Date(), onChange }: DateTimePickerProps) {
  React.useEffect(() => {
    onChange?.({ type: 'set' }, value);
  }, [onChange, value]);

  return <View />;
}
