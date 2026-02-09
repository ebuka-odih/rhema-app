export async function isAvailableAsync(): Promise<boolean> {
  return typeof navigator !== 'undefined' && typeof (navigator as any).share === 'function';
}

export async function shareAsync(url: string): Promise<void> {
  if (typeof navigator !== 'undefined' && typeof (navigator as any).share === 'function') {
    await (navigator as any).share({ url });
    return;
  }
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
