import { api } from '@/shared/api/axios';
import type { ApiResponse } from '@/shared/api/types';
import type {
  CreateEdgeRequest,
  CreateNodeRequest,
  CreateVariableRequest,
  StoryEdge,
  StoryNode,
  StoryVariable,
  UpdateEdgeRequest,
  UpdateNodeRequest,
} from '../types/story.types';

export async function createNode(storyId: string, data: CreateNodeRequest) {
  const response = await api.post<ApiResponse<StoryNode>>(`/stories/${storyId}/nodes`, data);
  return response.data.data;
}

export async function updateNode(storyId: string, nodeId: string, data: UpdateNodeRequest) {
  const response = await api.patch<ApiResponse<StoryNode>>(
    `/stories/${storyId}/nodes/${nodeId}`,
    data,
  );
  return response.data.data;
}

export async function updateNodePosition(
  storyId: string,
  nodeId: string,
  position: { x: number; y: number },
) {
  const response = await api.patch<ApiResponse<StoryNode>>(
    `/stories/${storyId}/nodes/${nodeId}/position`,
    position,
  );
  return response.data.data;
}

export async function deleteNode(storyId: string, nodeId: string) {
  await api.delete(`/stories/${storyId}/nodes/${nodeId}`);
}

export async function createEdge(storyId: string, data: CreateEdgeRequest) {
  const response = await api.post<ApiResponse<StoryEdge>>(`/stories/${storyId}/edges`, data);
  return response.data.data;
}

export async function updateEdge(storyId: string, edgeId: string, data: UpdateEdgeRequest) {
  const response = await api.patch<ApiResponse<StoryEdge>>(
    `/stories/${storyId}/edges/${edgeId}`,
    data,
  );
  return response.data.data;
}

export async function deleteEdge(storyId: string, edgeId: string) {
  await api.delete(`/stories/${storyId}/edges/${edgeId}`);
}

export async function createVariable(storyId: string, data: CreateVariableRequest) {
  const response = await api.post<ApiResponse<StoryVariable>>(
    `/stories/${storyId}/variables`,
    data,
  );
  return response.data.data;
}

export async function updateVariable(
  storyId: string,
  key: string,
  data: Partial<CreateVariableRequest>,
) {
  const response = await api.patch<ApiResponse<StoryVariable>>(
    `/stories/${storyId}/variables/${encodeURIComponent(key)}`,
    data,
  );
  return response.data.data;
}

export async function deleteVariable(storyId: string, key: string) {
  await api.delete(`/stories/${storyId}/variables/${encodeURIComponent(key)}`);
}
