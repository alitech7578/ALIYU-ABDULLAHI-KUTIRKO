import { useState, useEffect, Dispatch, SetStateAction, useRef } from 'react';

type SaveStatus = 'idle' | 'saving' | 'saved';

export const useLocalStorage = <T,>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>, SaveStatus] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
    }

    setSaveStatus('saving');
    
    const timer = setTimeout(() => {
        try {
          const valueToStore =
            typeof storedValue === 'function'
              ? storedValue(storedValue)
              : storedValue;
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          setSaveStatus('saved');
        } catch (error) {
          console.error(error);
          setSaveStatus('idle'); // Or an 'error' state
        }
    }, 300); // Small delay to show "Saving..."

    return () => clearTimeout(timer);
    
  }, [key, storedValue]);

  useEffect(() => {
      // When status becomes 'saved', set a timer to revert it to 'idle'
      if (saveStatus === 'saved') {
          const timer = setTimeout(() => {
              setSaveStatus('idle');
          }, 2000); // Show "Saved" for 2 seconds
          return () => clearTimeout(timer);
      }
  }, [saveStatus]);

  return [storedValue, setStoredValue, saveStatus];
};