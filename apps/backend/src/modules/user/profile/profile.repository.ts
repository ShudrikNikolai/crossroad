import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ProfileDocument, ProfileModel } from './profile.model';
import { Model } from 'mongoose';
import { BaseRepository } from '@/common';

type TPublicProfileSchema = {
  id: string;
  username: string;
  displayName?: string;
  bio?: string;
  avatarKey?: string;
  avatarUrl?: string;
  languages: string[];
  socialLinks?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    telegram?: string;
  };
  createdAt: Date | string;
};
type TPrivateProfileSchema = TPublicProfileSchema & {
  userId: string;
  isPublic: boolean;
  updatedAt: string;
};

@Injectable()
export class ProfileRepository extends BaseRepository<ProfileDocument> {
  constructor(
    @InjectModel(ProfileModel.name)
    model: Model<ProfileDocument>,
  ) {
    super(model);
  }

  async findByUserId(uId: string): Promise<ProfileDocument | null> {
    const userId = this.toObjectId(uId);
    return this.findOne({ userId });
  }

  async createProfile(uId: string, username: string): Promise<void> {
    const userId = this.toObjectId(uId);
    await this.create({
      userId,
      username,
    });
  }

  async findPublicProfile(_id: string): Promise<ProfileDocument | null> {
    return this.findOne({
      _id,
      isPublic: true,
    });
  }

  async updateByUserId(
    uId: string,
    data: Omit<Partial<ProfileDocument>, '_id'>,
  ): Promise<ProfileDocument | null> {
    const userId = this.toObjectId(uId);
    return this.model.findOneAndUpdate(
      {
        userId,
      },
      {
        ...data,
      },
    );
  }

  toPublic(data: ProfileDocument): TPublicProfileSchema {
    return {
      id: data._id.toString(),
      username: data.username,
      displayName: data.displayName,
      bio: data.bio,
      avatarKey: data.avatarKey,
      avatarUrl: data.avatarUrl,
      languages: data.languages ?? ['ru'],
      socialLinks: data.socialLinks,
      createdAt: data.createdAt.toISOString(),
    };
  }

  toPrivate(data: ProfileDocument): TPrivateProfileSchema {
    return {
      ...this.toPublic(data),
      userId: data.userId?.toString(),
      isPublic: data.isPublic,
      updatedAt: data.updatedAt.toISOString(),
    };
  }
}
