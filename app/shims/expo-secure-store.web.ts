const memoryStore = new Map<string, string>();

const safeGet = (key: string) => {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
  } catch {}
  return memoryStore.get(key) ?? null;
};

const safeSet = (key: string, value: string) => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
      return;
    }
  } catch {}
  memoryStore.set(key, value);
};

const safeDelete = (key: string) => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
      return;
    }
  } catch {}
  memoryStore.delete(key);
};

export async function setItemAsync(key: string, value: string): Promise<void> {
  safeSet(key, value);
}

export async function getItemAsync(key: string): Promise<string | null> {
  return safeGet(key);
}

export async function deleteItemAsync(key: string): Promise<void> {
  safeDelete(key);
}
