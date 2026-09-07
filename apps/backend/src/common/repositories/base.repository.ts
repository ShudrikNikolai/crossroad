import mongoose, { Model, HydratedDocument } from 'mongoose';

type QueryFilter<T> = mongoose.QueryFilter<T>;
type UpdateQuery<T> = mongoose.UpdateQuery<T>;
type QueryOptions<T> = mongoose.QueryOptions<T>;

export abstract class BaseRepository<T> {
  protected constructor(protected readonly model: Model<T>) {}

  async create(data: Partial<T>): Promise<HydratedDocument<T>> {
    return this.model.create(data);
  }

  async findById(
    id: string | mongoose.Types.ObjectId,
    options?: QueryOptions<T>,
  ): Promise<HydratedDocument<T> | null> {
    if (this.isValid(id)) return null;
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
    data: UpdateQuery<T>,
    options?: QueryOptions<T>,
  ): Promise<HydratedDocument<T> | null> {
    if (this.isValid(id)) return null;
    return this.model.findOneAndUpdate(
      { _id: id, deletedAt: null } as QueryFilter<T>,
      data,
      { new: true, ...options },
    );
  }

  async updateOne(
    filter: QueryFilter<T>,
    data: UpdateQuery<T>,
    options?: QueryOptions<T>,
  ): Promise<HydratedDocument<T> | null> {
    return this.model.findOneAndUpdate(
      { ...filter, deletedAt: null } as QueryFilter<T>,
      data,
      { new: true, ...options },
    );
  }

  async softDeleteById(
    id: string | mongoose.Types.ObjectId,
  ): Promise<HydratedDocument<T> | null> {
    if (this.isValid(id)) return null;
    return this.model.findOneAndUpdate(
      { _id: id, deletedAt: null } as QueryFilter<T>,
      { deletedAt: new Date() } as UpdateQuery<T>,
      { new: true },
    );
  }

  async restoreById(
    id: string | mongoose.Types.ObjectId,
  ): Promise<HydratedDocument<T> | null> {
    if (this.isValid(id)) return null;
    return this.model.findOneAndUpdate(
      { _id: id, deletedAt: { $ne: null } } as QueryFilter<T>,
      { deletedAt: null } as UpdateQuery<T>,
      { new: true },
    );
  }

  async hardDeleteById(id: string | mongoose.Types.ObjectId): Promise<boolean> {
    if (this.isValid(id)) return false;
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

  private isValid(id: string | mongoose.Types.ObjectId): boolean {
    return !mongoose.Types.ObjectId.isValid(id);
  }
}
