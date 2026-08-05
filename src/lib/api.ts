const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Next.js App Router default fetch behavior
  const defaultOptions: RequestInit = {
    next: { revalidate: 60 }, // Revalidate every 60s by default for performance
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    if (!response.ok) {
      console.warn(`API returned ${response.status} for ${endpoint}`);
      return null as T;
    }
    const json = await response.json();
    return json.data as T;
  } catch (error) {
    console.warn(`Fetch failed for ${endpoint} (Backend might be offline)`);
    // Return empty array for list endpoints or null for object endpoints
    if (endpoint.includes('?') || endpoint === '/products' || endpoint === '/categories' || endpoint === '/blogs') {
      return [] as unknown as T;
    }
    return null as T;
  }
}
