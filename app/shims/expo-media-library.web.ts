type PermissionResponse = {
  status: 'granted' | 'denied';
  granted: boolean;
  canAskAgain: boolean;
};

export async function requestPermissionsAsync(): Promise<PermissionResponse> {
  return {
    status: 'granted',
    granted: true,
    canAskAgain: true,
  };
}

export async function saveToLibraryAsync(_uri: string): Promise<void> {}
