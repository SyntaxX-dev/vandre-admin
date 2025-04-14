import { API_URL } from '@/services/apiUrl';
import { getToken } from '@/services/token/getToken';
import { Video } from '@/types/video';

interface CreateVideoParams {
    title: string;
    description?: string;
    url: string;
    durationMinutes: number;
    videoGroupId: string;
    courseId: string;
    imageId?: string;
    thumbnailId?: string;
  }

export async function createVideo(params: CreateVideoParams): Promise<{ video?: Video; error?: string }> {
  const auth = await getToken();
  const token = auth.token;
  
  try {
    const response = await fetch(`${API_URL}/course/video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error('Failed to create video');
    }

    const data = await response.json();
    return { video: data };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    } else {
      return { error: 'An unknown error occurred' };
    }
  }
}
