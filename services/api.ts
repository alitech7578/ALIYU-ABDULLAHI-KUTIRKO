export const fetchData = async () => {
  const response = await fetch('/api/data');
  if (!response.ok) throw new Error('Failed to fetch data');
  return response.json();
};

export const saveData = async (data: any) => {
  const response = await fetch('/api/data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to save data');
  return response.json();
};
