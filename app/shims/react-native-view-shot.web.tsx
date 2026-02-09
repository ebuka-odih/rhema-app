import React, { forwardRef } from 'react';
import { View } from 'react-native';

type CaptureOptions = {
  format?: 'png' | 'jpg' | 'webm';
  quality?: number;
  result?: 'tmpfile' | 'base64' | 'data-uri';
};

const EMPTY_PNG_DATA_URI =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAF/gL+7f6uVwAAAABJRU5ErkJggg==';

export async function captureRef(_ref: unknown, _options?: CaptureOptions): Promise<string> {
  return EMPTY_PNG_DATA_URI;
}

const ViewShot = forwardRef<View, React.ComponentProps<typeof View>>(({ children, ...props }, ref) => {
  return (
    <View ref={ref} {...props}>
      {children}
    </View>
  );
});

ViewShot.displayName = 'ViewShot';

export default ViewShot;
