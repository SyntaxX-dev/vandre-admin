import { API_URL } from '@/services/apiUrl';
import { Video } from '@/types/video';

export async function getVideos(): Promise<{ videos: Video[] }> {
  const response = await fetch(`${API_URL}/course/videos`);
  if (!response.ok) {
    throw new Error('Failed to fetch videos');
  }

  const data = await response.json();
  
  if (!data.videos || !Array.isArray(data.videos)) {
    console.error('Unexpected API response format:', data);
    return { videos: [] };
  }

  const videos: Video[] = data.videos.map((item: any) => ({
    id: item.id,
    title: item.title,
    url: item.url,
    durationMinutes: item.durationMinutes,
    description: item.description,
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
    thumbnail: item.thumbnailUrl, 
    group: {
      id: item.group.id,
      title: item.group.title,
    },
  }));

  return { videos };
}
