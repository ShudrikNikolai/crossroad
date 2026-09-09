import { Types } from "mongoose";

export abstract class BaseModel {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
