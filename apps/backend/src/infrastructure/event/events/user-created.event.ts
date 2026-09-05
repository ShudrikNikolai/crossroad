import { Types } from "mongoose";

export interface UserCreatedEvent {
  userId: Types.ObjectId;
  email: string;
}
