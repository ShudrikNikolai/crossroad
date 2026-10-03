import { MeDto, PublicProfileDto } from '../dtos';
import { ProfileDocument, ProfileModel } from './profile.model';
import { BaseRepository } from '@/common';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ProfileRepository extends BaseRepository<ProfileDocument> {
  constructor(
    @InjectModel(ProfileModel.name)
    model: Model<ProfileDocument>,
  ) {
    super(model);
  }

  async findByUserId(userId: string): Promise<ProfileDocument | null> {
    return this.findOne({ userId });
  }

  async createProfile(userId: string, username: string): Promise<void> {
    await this.createDocument({
      userId: userId as any,
      username,
    });
  }

  async findPublicProfile(id: string): Promise<ProfileDocument | null> {
    return this.findOne({
      id,
      isPublic: true,
    });
  }

  async updateByUserId(
    userId: string,
    data: Partial<ProfileDocument>,
  ): Promise<ProfileDocument | null> {
    return this.updateOne(
      {
        userId,
      },
      {
        ...data,
      },
    );
  }

  toProfilePublic(data: ProfileDocument): PublicProfileDto {
    return {
      id: `${data._id || data.id}`,
      username: data.username,
      displayName: data.displayName,
      bio: data.bio,
      avatarUrl: data.avatarUrl,
      languages: data.languages ?? ['ru'],
      socialLinks: data.socialLinks,
    };
  }

  toProfilePrivate(data: ProfileDocument): MeDto {
    return {
      id: data.id,
      username: data.username,
      displayName: data.displayName,
      bio: data.bio,
      avatarUrl: data.avatarUrl,
      languages: data.languages ?? ['ru'],
      socialLinks: data.socialLinks,
      isPublic: data.isPublic,
      updatedAt: data.updatedAt.toISOString(),
    };
  }
}
