import mongoose, { HydratedDocument, Model, Types } from 'mongoose';

type QueryFilter<T> = mongoose.QueryFilter<T>;
type UpdateQuery<T> = mongoose.UpdateQuery<T>;
type QueryOptions<T> = mongoose.QueryOptions<T>;

type response<T> = Omit<T, '_id'> & { id: string };

type BaseDoc = {
  _id: mongoose.Types.ObjectId;
  deletedAt?: Date | null;
};

export abstract class BaseRepository<T extends BaseDoc> {
  protected constructor(protected readonly model: Model<T>) {}

  async create(rawData: Partial<T>): Promise<response<T>> {
    const data = this.convertStringIdsToObjectIds(rawData);
    const document = await this.model.create(data);

    return this.mongoIdToId(document);
  }

  async findById(
    id: string,
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
    filter: QueryFilter<T>,
    options?: QueryOptions<T>,
  ): Promise<HydratedDocument<T> | null> {
    return this.model.findOne(
      { ...filter, deletedAt: null } as QueryFilter<T>,
      null,
      options,
    );
  }

  async findMany(
    filter: QueryFilter<T>,
    options?: QueryOptions<T>,
  ): Promise<HydratedDocument<T>[]> {
    return this.model.find(
      { ...filter, deletedAt: null } as QueryFilter<T>,
      null,
      options,
    );
  }

  async updateById(
    id: string | mongoose.Types.ObjectId,
    rawData: UpdateQuery<T>,
    options?: QueryOptions<T>,
  ): Promise<HydratedDocument<T> | null> {
    if (this.isInvalidId(id)) return null;
    const data = this.updDataIdsToObjectId(rawData);

    return this.model.findOneAndUpdate(
      { _id: id, deletedAt: null } as QueryFilter<T>,
      data,
      { new: true, ...options },
    );
  }

  async updateOne(
    filter: QueryFilter<T>,
    rawData: UpdateQuery<T>,
    options?: QueryOptions<T>,
  ): Promise<HydratedDocument<T> | null> {
    const data = this.updDataIdsToObjectId(rawData);
    return this.model.findOneAndUpdate(
      { ...filter, deletedAt: null } as QueryFilter<T>,
      data,
      { new: true, ...options },
    );
  }

  async softDeleteById(
    id: string | mongoose.Types.ObjectId,
  ): Promise<HydratedDocument<T> | null> {
    if (this.isInvalidId(id)) return null;
    return this.model.findOneAndUpdate(
      { _id: id, deletedAt: null } as QueryFilter<T>,
      { deletedAt: new Date() } as UpdateQuery<T>,
      { new: true },
    );
  }

  async restoreById(
    id: string | mongoose.Types.ObjectId,
  ): Promise<HydratedDocument<T> | null> {
    if (this.isInvalidId(id)) return null;
    return this.model.findOneAndUpdate(
      { _id: id, deletedAt: { $ne: null } } as QueryFilter<T>,
      { deletedAt: null } as UpdateQuery<T>,
      { new: true },
    );
  }

  async hardDeleteById(id: string | mongoose.Types.ObjectId): Promise<boolean> {
    if (this.isInvalidId(id)) return false;
    const res = await this.model.deleteOne({ _id: id } as QueryFilter<T>);
    return res.deletedCount > 0;
  }

  async exists(filter: QueryFilter<T>): Promise<boolean> {
    const res = await this.model.exists({
      ...filter,
      deletedAt: null,
    } as QueryFilter<T>);
    return res !== null;
  }

  async count(filter: QueryFilter<T> = {} as QueryFilter<T>): Promise<number> {
    return this.model.countDocuments({
      ...filter,
      deletedAt: null,
    } as QueryFilter<T>);
  }

  async paginate(
    filter: QueryFilter<T>,
    page = 1,
    limit = 20,
    options?: QueryOptions<T>,
  ): Promise<{
    items: HydratedDocument<T>[];
    total: number;
    page: number;
    pages: number;
  }> {
    const skip = (page - 1) * limit;
    const scopedFilter = { ...filter, deletedAt: null } as QueryFilter<T>;
    const [items, total] = await Promise.all([
      this.model.find(scopedFilter, null, options).skip(skip).limit(limit),
      this.model.countDocuments(scopedFilter),
    ]);
    return { items, total, page, pages: Math.ceil(total / limit) };
  }

  toObjectId(id: string): Types.ObjectId {
    return new Types.ObjectId(id);
  }

  private isInvalidId(id: string | mongoose.Types.ObjectId): boolean {
    return !mongoose.Types.ObjectId.isValid(id);
  }

  private updDataIdsToObjectId(data: UpdateQuery<T>): UpdateQuery<T> {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(
      data as Record<string, unknown>,
    )) {
      if (
        value &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        key.startsWith('$')
      ) {
        result[key] = this.convertStringIdsToObjectIds(
          value as Record<string, unknown>,
        );
      } else {
        result[key] = value;
      }
    }

    return result as UpdateQuery<T>;
  }

  private convertStringIdsToObjectIds<D extends Record<string, unknown>>(
    data: D,
  ): D {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string' && mongoose.Types.ObjectId.isValid(value)) {
        result[key] = this.toObjectId(value);
      } else {
        result[key] = value;
      }
    }

    return result as D;
  }

  private mongoIdToId(data: HydratedDocument<T>): response<T> {
    const { _id, ...rest } = data.toObject();
    return { ...rest, id: _id.toString() };
  }
}
