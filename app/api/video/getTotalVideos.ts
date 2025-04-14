import { API_URL } from '@/services/apiUrl';

export async function getTotalVideos(): Promise<{ totalVideos: number }> {
  const response = await fetch(`${API_URL}/course/videos/total-count`);
  if (!response.ok) {
    throw new Error('Failed to fetch total videos');
  }

  const data = await response.json();
  return { totalVideos: data.totalCount };
}
