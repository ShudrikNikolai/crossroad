import {
  HydratedDocument,
  Model,
  Types,
  QueryFilter,
  UpdateQuery,
  QueryOptions,
} from 'mongoose';

export type Response<T> = Omit<T, '_id'> & { id: string };

export type BaseDoc = {
  _id: Types.ObjectId;
  deletedAt?: Date | null;
};

export abstract class BaseRepository<T extends BaseDoc> {
  protected constructor(protected readonly model: Model<T>) {}

  async createDocument(rawData: Partial<T>): Promise<HydratedDocument<T>> {
    const data = this.normalizeData(rawData as Record<string, unknown>);
    return this.model.create(data as any);
  }

  async findById(
    id: string | Types.ObjectId,
    options?: QueryOptions<T>,
  ): Promise<HydratedDocument<T> | null> {
    if (this.isInvalidId(id)) return null;

    return this.model.findOne(
      { _id: id, deletedAt: null } as QueryFilter<T>,
      null,
      options,
    );
  }

  async findOne(
    rawFilter: QueryFilter<T>,
    options?: QueryOptions<T>,
  ): Promise<HydratedDocument<T> | null> {
    const filter = this.normalizeFilter(rawFilter as Record<string, unknown>);

    return this.model.findOne(
      { ...filter, deletedAt: null } as QueryFilter<T>,
      null,
      options,
    );
  }

  async findMany(
    rawFilter: QueryFilter<T> = {},
    options?: QueryOptions<T>,
  ): Promise<HydratedDocument<T>[]> {
    const filter = this.normalizeFilter(rawFilter as Record<string, unknown>);

    return this.model.find(
      { ...filter, deletedAt: null } as QueryFilter<T>,
      null,
      options,
    );
  }

  async findManyLean<R = T>(
    rawFilter: QueryFilter<T> = {},
    options?: QueryOptions<T> & {
      select?: string | Record<string, 0 | 1>;
    },
  ): Promise<R[]> {
    const filter = this.normalizeFilter(rawFilter as Record<string, unknown>);

    const query = this.model
      .find({ ...filter, deletedAt: null } as QueryFilter<T>)
      .lean();

    if (options?.select) {
      query.select(options.select);
    }
    if (options?.limit) {
      query.limit(options.limit);
    }
    if (options?.skip) {
      query.skip(options.skip);
    }
    if (options?.sort) {
      query.sort(options.sort);
    }

    return query.exec() as Promise<R[]>;
  }

  async updateById(
    id: string | Types.ObjectId,
    rawData: UpdateQuery<T>,
    options?: QueryOptions<T>,
  ): Promise<HydratedDocument<T> | null> {
    if (this.isInvalidId(id)) return null;

    const data = this.normalizeData(rawData as Record<string, unknown>);

    return this.model.findOneAndUpdate(
      { _id: id, deletedAt: null } as QueryFilter<T>,
      data,
      { new: true, ...options },
    );
  }

  async updateOne(
    rawFilter: QueryFilter<T>,
    rawData: UpdateQuery<T>,
    options?: QueryOptions<T>,
  ): Promise<HydratedDocument<T> | null> {
    const filter = this.normalizeFilter(rawFilter as Record<string, unknown>);
    const data = this.normalizeData(rawData as Record<string, unknown>);

    return this.model.findOneAndUpdate(
      { ...filter, deletedAt: null } as QueryFilter<T>,
      data,
      { new: true, ...options },
    );
  }

  async updateMany(
    rawFilter: QueryFilter<T>,
    rawData: UpdateQuery<T>,
  ): Promise<number> {
    const filter = this.normalizeFilter(rawFilter as Record<string, unknown>);
    const data = this.normalizeData(rawData as Record<string, unknown>);

    const res = await this.model.updateMany(
      { ...filter, deletedAt: null } as QueryFilter<T>,
      data,
    );

    return res.modifiedCount;
  }

  async softDeleteById(
    id: string | Types.ObjectId,
  ): Promise<HydratedDocument<T> | null> {
    if (this.isInvalidId(id)) return null;

    return this.model.findOneAndUpdate(
      { _id: id, deletedAt: null } as QueryFilter<T>,
      { deletedAt: new Date() } as UpdateQuery<T>,
      { new: true },
    );
  }

  async restoreById(
    id: string | Types.ObjectId,
  ): Promise<HydratedDocument<T> | null> {
    if (this.isInvalidId(id)) return null;

    return this.model.findOneAndUpdate(
      { _id: id, deletedAt: { $ne: null } } as QueryFilter<T>,
      { deletedAt: null } as UpdateQuery<T>,
      { new: true },
    );
  }

  async hardDeleteById(id: string | Types.ObjectId): Promise<boolean> {
    if (this.isInvalidId(id)) return false;

    const res = await this.model.deleteOne({ _id: id } as QueryFilter<T>);
    return res.deletedCount > 0;
  }

  async hardDeleteOne(rawFilter: QueryFilter<T>): Promise<boolean> {
    const filter = this.normalizeFilter(rawFilter as Record<string, unknown>);
    const res = await this.model.deleteOne(filter as QueryFilter<T>);
    return res.deletedCount > 0;
  }

  async hardDeleteMany(rawFilter: QueryFilter<T>): Promise<number> {
    const filter = this.normalizeFilter(rawFilter as Record<string, unknown>);
    const res = await this.model.deleteMany(filter as QueryFilter<T>);
    return res.deletedCount;
  }

  async exists(rawFilter: QueryFilter<T>): Promise<boolean> {
    const filter = this.normalizeFilter(rawFilter as Record<string, unknown>);

    const res = await this.model.exists({
      ...filter,
      deletedAt: null,
    } as QueryFilter<T>);

    return res !== null;
  }

  async count(rawFilter: QueryFilter<T> = {}): Promise<number> {
    const filter = this.normalizeFilter(rawFilter as Record<string, unknown>);

    return this.model.countDocuments({
      ...filter,
      deletedAt: null,
    } as QueryFilter<T>);
  }

  async paginate(
    rawFilter: QueryFilter<T> = {},
    page = 1,
    limit = 20,
    options?: QueryOptions<T>,
  ): Promise<{
    items: HydratedDocument<T>[];
    total: number;
    page: number;
    pages: number;
  }> {
    const filter = this.normalizeFilter(rawFilter as Record<string, unknown>);
    const skip = (page - 1) * limit;
    const scoped = { ...filter, deletedAt: null } as QueryFilter<T>;

    const [items, total] = await Promise.all([
      this.model.find(scoped, null, options).skip(skip).limit(limit),
      this.model.countDocuments(scoped),
    ]);

    return {
      items,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
    };
  }

  toPublic(doc: HydratedDocument<T>): Response<T> {
    const { _id, ...rest } = doc.toObject();
    return { ...rest, id: _id.toString() } as Response<T>;
  }

  toObjectId(id: string | Types.ObjectId): Types.ObjectId {
    return typeof id === 'string' ? new Types.ObjectId(id) : id;
  }

  private isInvalidId(id: string | Types.ObjectId): boolean {
    return !Types.ObjectId.isValid(id);
  }

  private isObjectIdLike(value: unknown): value is string | Types.ObjectId {
    return (
      (typeof value === 'string' && Types.ObjectId.isValid(value)) ||
      value instanceof Types.ObjectId
    );
  }

  private normalizeFilter(
    filter: Record<string, unknown>,
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(filter)) {
      if (key === 'id' && this.isObjectIdLike(value)) {
        result['_id'] = this.toObjectId(value);
        continue;
      }

      if (this.isObjectIdLike(value)) {
        result[key] = this.toObjectId(value);
        continue;
      }

      if (Array.isArray(value)) {
        result[key] = value.map((v) =>
          this.isObjectIdLike(v) ? this.toObjectId(v) : v,
        );
        continue;
      }

      if (value && typeof value === 'object' && !(value instanceof Date)) {
        result[key] = this.normalizeFilter(value as Record<string, unknown>);
        continue;
      }

      result[key] = value;
    }

    return result;
  }

  private normalizeData<D extends Record<string, unknown>>(data: D): D {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data)) {
      if (
        key.startsWith('$') &&
        value &&
        typeof value === 'object' &&
        !Array.isArray(value)
      ) {
        result[key] = this.normalizeData(value as Record<string, unknown>);
        continue;
      }

      if (this.isObjectIdLike(value)) {
        result[key] = this.toObjectId(value);
        continue;
      }

      if (Array.isArray(value)) {
        result[key] = value.map((v) =>
          this.isObjectIdLike(v) ? this.toObjectId(v) : v,
        );
        continue;
      }

      result[key] = value;
    }

    return result as D;
  }
}
