import { injectable, inject, unmanaged } from 'inversify';
import { Document, Model, Schema, SchemaDefinition } from 'mongoose';
import { DbEntity } from '../entities/DbEntity';
import { MongoClient, MongoClientTYPE } from '../lib/MongoClient';

export type Query<T> = {
    [P in keyof T]?: T[P] | { $regex: RegExp };
};

export type SortType = 1 | -1;

export type Sort = {
    name: string;
    type: SortType;
};

export interface Repository<TEntity> {
    save(doc: TEntity): Promise<TEntity>;
    remove(doc: TEntity): Promise<TEntity>;
    find(query: any | Query<TEntity>): Promise<TEntity[]>;
    findOneOrCreate(condition: any | TEntity, creator: () => Promise<TEntity>): Promise<TEntity>;
    findOneById(id: string): Promise<TEntity>;
    findOneAndUpdate(query: Query<TEntity>, updates: any | TEntity): Promise<TEntity>;
    findSpecified(query: Query<TEntity>, specifiedQuery: any | TEntity): Promise<TEntity[]>;
    update(condition: any | TEntity, updates: any | TEntity): Promise<TEntity>;
    findOne(condition: any | TEntity): Promise<TEntity>;
    findPagination(query: any | TEntity, pageNumber: number, itemPerPage: number, sort?: Sort): Promise<TEntity[]>;
    count(condition: any | TEntity): Promise<number>;
    findAndGetOneById(id: string, filedName: string): Promise<TEntity>;
}

@injectable()
export class RepositoryImpl<TEntity extends DbEntity & Document> implements Repository<TEntity> {
    protected Model: Model<TEntity>;

    constructor(
        @inject(MongoClientTYPE) mongoclient: MongoClient,
        @unmanaged() name: string,
        @unmanaged() schemaDefinition: SchemaDefinition) {
        this.Model = mongoclient.model<TEntity>(name, new Schema(schemaDefinition, { collection: name }));
    }

    public async findOneAndUpdate(query: Query<TEntity>, updates: any | TEntity) {
        return new Promise<TEntity>((resolve, reject) => {
            this.Model.findOneAndUpdate(query as any, updates, { upsert: false }, (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
    }

    public async save(doc: TEntity): Promise<TEntity> {
        return new Promise<TEntity>((resolve, reject) => {
            const instance = new this.Model(doc);
            instance.save((err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
    }

    public async remove(doc: TEntity): Promise<TEntity> {
        return new Promise<TEntity>((resolve, reject) => {
            const instance = new this.Model(doc);
            instance.remove((err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
    }

    public async find(query: Query<TEntity>): Promise<TEntity[]> {
        return new Promise<TEntity[]>((resolve, reject) => {
            this.Model.find(query as any).sort({ updated: -1 }).exec((err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
    }

    public async findOneById(id: string): Promise<TEntity> {
        return new Promise<TEntity>((resolve, reject) => {
            this.Model.findById(id, (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
    }

    public async findSpecified(query: Query<TEntity>, specifiedQuery: any): Promise<TEntity[]> {
        return new Promise<TEntity[]>((resolve, reject) => {
            this.Model.find(query as any, specifiedQuery as any).sort({ updated: -1 }).exec((err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            })
        })
    }

    public async update(condition: TEntity, updates: any): Promise<TEntity> {
        return new Promise<TEntity>((resolve, reject) => {
            this.Model.update(condition, updates, (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            })
        });
    }

    public async findOneOrCreate(condition: any | TEntity, creator: () => Promise<TEntity>): Promise<TEntity> {
        return new Promise<TEntity>((resolve, reject) => {
            this.Model.findOne(condition, async (err, res) => {
                if (err) {
                    reject(err);
                }
                if (!res) {
                    res = await this.save(await creator());
                } else {
                    resolve(res);
                }
            });
        });
    }

    public async findOne(condition: any): Promise<TEntity> {
        return new Promise<TEntity>((resolve, reject) => {
            this.Model.findOne(condition, (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
    }

    public async findPagination(query: Query<TEntity>, pageNumber: number, itemPerPage: number, sort?: Sort): Promise<TEntity[]> {
        return new Promise<TEntity[]>((resolve, reject) => {
            let sortObj = sort && sort.name ? { [sort.name]: sort.type, "updated": sort.type } : { "updated": sort.type };
            this.Model.find(query as any).sort(sortObj).skip((pageNumber - 1) * itemPerPage).limit(itemPerPage).exec((err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
    }

    public async count(condition: any): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            this.Model.count(condition, (err, count) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(count);
                }
            });
        });
    }

    public async findAndGetOneById(id: string, filedName: string): Promise<TEntity> {
        return new Promise<TEntity>((resolve, reject) => {
            this.Model.findById(id).select(filedName).exec((err, res) => {
                if (err) {
                    reject(err);
                }
                resolve(res);
            });
        });
    }
}