import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProfileRepository } from './profile.repository';
import {
  TAvatarUploadSchema,
  TMeProfileSchema,
  TPublicProfileSchema,
  TUpdateProfileSchema,
} from '@crossroad/schemas';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class ProfileService {
  constructor(
    private readonly repository: ProfileRepository,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(ProfileService.name);
  }

  async create(userId: string, username: string): Promise<void> {
    const existing = await this.repository.findOne({ username });
    if (existing) {
      throw new ConflictException(`Username "${username}" is already taken`);
    }

    try {
      await this.repository.createProfile(userId, username);
      this.logger.info(`Profile created for user ${userId}`);
    } catch (err) {
      this.logger.error(`Failed to create profile for ${userId}`, err as Error);
      throw err;
    }
  }

  async getMe(userId: string): Promise<TMeProfileSchema> {
    const me = await this.repository.findOne({
      userId,
    });

    if (!me) {
      this.logger.warn(`Profile not found for user ${userId}`);
      throw new NotFoundException('Profile not found');
    }

    return me.toPrivate();
  }

  async updateMe(
    userId: string,
    data: TUpdateProfileSchema,
  ): Promise<TMeProfileSchema> {
    const updated = await this.repository.updateByUserId(userId, data);
    if (!updated) throw new NotFoundException('Profile not found');
    return updated.toPrivate();
  }

  async getPublicProfile(profileId: string): Promise<TPublicProfileSchema> {
    const profile = await this.repository.findPublicProfile(profileId);
    if (!profile) {
      throw new NotFoundException('Public profile not found');
    }

    return profile.toPublic();
  }

  async uploadAvatar(
    userId: string,
    data: TAvatarUploadSchema,
  ): Promise<TMeProfileSchema> {
    throw new Error('Method not implemented.');
  }
}
