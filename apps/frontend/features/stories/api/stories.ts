import { api } from '@/shared/api/axios';
import type { ApiResponse } from '@/shared/api/types';
import type {
  Story,
  CreateStoryRequest,
  UpdateStoryRequest,
  StoryGraph,
} from '../types/story.types';

export async function getStories() {
  const response = await api.get<ApiResponse<Story[]>>('/stories');
  return response.data.data;
}

export async function createStory(data: CreateStoryRequest) {
  const response = await api.post<ApiResponse<Story>>('/stories', data);
  return response.data.data;
}

export async function getStory(id: string) {
  const response = await api.get<ApiResponse<Story>>(`/stories/${id}`);
  return response.data.data;
}

export async function updateStory(id: string, data: UpdateStoryRequest) {
  const response = await api.patch<ApiResponse<Story>>(`/stories/${id}`, data);
  return response.data.data;
}

export async function publishStory(id: string) {
  const response = await api.post<ApiResponse<Story>>(`/stories/${id}/publish`);
  return response.data.data;
}

export async function getStoryGraph(id: string) {
  const response = await api.get<ApiResponse<StoryGraph>>(`/stories/${id}/graph`);
  return response.data.data;
}
