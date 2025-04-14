import { API_URL } from '@/services/apiUrl';

interface Group {
  id: string;
  title: string;
  description: string;
  variant: string;
  createdAt: string;
  updatedAt: string;
}

export async function getGroupsForACourse(courseId: string): Promise<{ groups: Group[] }> {
  const response = await fetch(`${API_URL}/course/${courseId}/groups`);
  if (!response.ok) {
    throw new Error('Failed to fetch groups for the course');
  }

  const data = await response.json();
  return { groups: data };
}
