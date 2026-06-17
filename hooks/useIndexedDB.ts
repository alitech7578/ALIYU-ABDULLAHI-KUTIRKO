import { useState, useEffect, Dispatch, SetStateAction, useRef } from 'react';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const DB_NAME = 'OfflineIdCardDb';
const STORE_NAME = 'KeyValueStore';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

export const getDB = (): Promise<IDBDatabase> => {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });

  return dbPromise;
};

export const dbGet = async (key: string): Promise<any> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export const dbSet = async (key: string, value: any): Promise<void> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(value, key);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export const useIndexedDB = <T,>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>, SaveStatus] => {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const isInitialMount = useRef(true);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from IndexedDB on mount with transparent fallback/migration from LocalStorage
  useEffect(() => {
    let active = true;
    dbGet(key)
      .then((value) => {
        if (!active) return;
        if (value !== undefined) {
          setStoredValue(value);
        } else {
          // If not in IndexedDB, check if there's old data in LocalStorage to migrate
          try {
            const localValue = window.localStorage.getItem(key);
            if (localValue !== null) {
              const parsed = JSON.parse(localValue);
              setStoredValue(parsed);
              // Migrate it to IndexedDB
              dbSet(key, parsed).catch(err => console.error(`Migration failed for ${key}:`, err));
            }
          } catch (localErr) {
            console.error(`Error parsing LocalStorage fallback for ${key}:`, localErr);
          }
        }
        setIsLoaded(true);
      })
      .catch((err) => {
        console.error(`Error loading key ${key} from IndexedDB:`, err);
        if (active) setIsLoaded(true);
      });

    return () => {
      active = false;
    };
  }, [key]);

  // Save to IndexedDB when value changes (after load completes)
  useEffect(() => {
    if (!isLoaded) return;

    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setSaveStatus('saving');

    const timer = setTimeout(() => {
      try {
        const valueToStore =
          typeof storedValue === 'function'
            ? (storedValue as Function)(storedValue)
            : storedValue;

        dbSet(key, valueToStore)
          .then(() => {
            setSaveStatus('saved');
            
            // Also duplicate to LocalStorage for small config keys but NOT for records which exceed the 5mb quota
            if (!key.includes('records') && !key.includes('draft')) {
              try {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
              } catch (e) {
                // Ignore silent localStorage Quota errors for other items
              }
            }
          })
          .catch((err) => {
            console.error(`Failed to save to IndexedDB for key ${key}:`, err);
            setSaveStatus('error');
          });
      } catch (error) {
        console.error(`Error writing in hook for key ${key}:`, error);
        setSaveStatus('error');
      }
    }, 200); // Fast 200ms debounce to avoid rapid disk writes

    return () => clearTimeout(timer);
  }, [key, storedValue, isLoaded]);

  useEffect(() => {
    if (saveStatus === 'saved') {
      const timer = setTimeout(() => {
        setSaveStatus('idle');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  return [storedValue, setStoredValue, saveStatus];
};
