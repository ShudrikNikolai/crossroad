import { api } from '@/shared/api/axios';
import type { ApiResponse } from '@/shared/api/types';
import type { CreateGameRequest, GameStep, NextGameStepRequest } from '../types/game.types';

export async function startGame(data: CreateGameRequest) {
  const response = await api.post<ApiResponse<GameStep>>('/games', data);
  return response.data.data;
}

export async function getGame(id: string) {
  const response = await api.get<ApiResponse<GameStep>>(`/games/${id}`);
  return response.data.data;
}

export async function nextGameStep(id: string, data: NextGameStepRequest) {
  const response = await api.post<ApiResponse<GameStep>>(`/games/${id}/next-step`, data);
  return response.data.data;
}
