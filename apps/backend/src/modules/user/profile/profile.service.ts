import { ProfileRepository } from './profile.repository';
import {
  TMeProfileSchema,
  TPublicProfileSchema,
  TUpdateProfileSchema,
} from '@crossroad/schemas';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    try {
      const me = await this.repository.findByUserId(userId);

      if (!me) {
        throw new NotFoundException('Profile not found');
      }

      return this.repository.toProfilePrivate(me);
    } catch (err) {
      this.logger.error(`Failed to get profile for ${userId}`, err as Error);
      throw err;
    }
  }

  async updateMe(
    userId: string,
    data: TUpdateProfileSchema,
  ): Promise<TMeProfileSchema> {
    try {
      const updMe = await this.repository.updateByUserId(userId, data);
      if (!updMe) {
        throw new NotFoundException('Profile not updated');
      }
      return this.repository.toProfilePrivate(updMe);
    } catch (err) {
      this.logger.error(`Failed to update profile for ${userId}`, err as Error);
      throw err;
    }
  }

  async getPublicProfile(profileId: string): Promise<TPublicProfileSchema> {
    const profile = await this.repository.findPublicProfile(profileId);
    if (!profile) {
      throw new NotFoundException('Public profile not found');
    }

    return this.repository.toProfilePublic(profile);
  }
}
