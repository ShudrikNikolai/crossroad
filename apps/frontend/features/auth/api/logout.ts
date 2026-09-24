import { api } from '@/shared/api/axios';

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}
