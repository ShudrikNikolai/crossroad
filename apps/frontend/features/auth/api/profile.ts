import { getProfile } from '@/features/user/api/profile';
import type { UserProfile } from '@/features/user/types/user.types';

export async function getMe(): Promise<UserProfile | undefined> {
  return getProfile();
}
