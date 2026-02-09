export const defaultDatabaseDirectory = '/sqlite';

export async function openDatabaseAsync(): Promise<never> {
  throw new Error('expo-sqlite is not available in this web build.');
}

export async function deleteDatabaseAsync(): Promise<void> {}
