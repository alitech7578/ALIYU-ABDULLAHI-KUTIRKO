export const fetchData = async (retries = 2) => {
  try {
    const response = await fetch('/api/data', { credentials: 'include' });
    if (!response.ok) {
      if (response.status === 401 && retries > 0) {
        // Wait a bit and retry once in case session is still being established
        await new Promise(resolve => setTimeout(resolve, 500));
        return fetchData(retries - 1);
      }
      throw new Error('Failed to fetch data');
    }
    return response.json();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return fetchData(retries - 1);
    }
    throw error;
  }
};

export const saveData = async (data: any, retries = 2): Promise<any> => {
  try {
    const response = await fetch('/api/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      if (response.status === 401 && retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return saveData(data, retries - 1);
      }
      throw new Error('Failed to save data');
    }
    return response.json();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return saveData(data, retries - 1);
    }
    throw error;
  }
};
