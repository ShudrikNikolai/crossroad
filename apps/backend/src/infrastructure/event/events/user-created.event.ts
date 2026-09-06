import { Types } from 'mongoose';

export interface UserCreatedEvent {
  userId: Types.ObjectId;
  email: string;
}

/**
 * TODO переделать по формат
 * export const USER_CREATED_EVENT = 'user.created';

 export interface UserCreatedEvent {
   userId: string;
   email: string;
 }
 */
