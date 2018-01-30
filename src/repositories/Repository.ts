import { injectable, inject, unmanaged } from 'inversify';
import { Document, Model, Schema, SchemaDefinition } from 'mongoose';
import { DbEntity } from '../entities/DbEntity';
import { MongoClient, MongoClientTYPE } from '../lib/MongoClient';

export type Query<T> = {
    [P in keyof T]?: T[P] | { $regex: RegExp };
};

export interface Repository<TEntity> {
    save(doc: TEntity): Promise<TEntity>;
    remove(doc: TEntity): Promise<TEntity>;
    find(query: Query<TEntity>): Promise<TEntity[]>;
    findOneById(id: string): Promise<TEntity>;
    findOneAndUpdate(query: Query<TEntity>, updates: any | TEntity): Promise<TEntity>;
    findSpecified(query: Query<TEntity>, specifiedQuery: any | TEntity): Promise<TEntity[]>;
    update(condition: any | TEntity, updates: any | TEntity): Promise<TEntity>;
    findOne(condition: any | TEntity): Promise<TEntity>;
    findPagination(query: Query<TEntity>, pageNumber: number, itemPerPage: number): Promise<TEntity[]>;
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
                }
                resolve(res);
            });
        });
    }

    public async remove(doc: TEntity): Promise<TEntity> {
        return new Promise<TEntity>((resolve, reject) => {
            const instance = new this.Model(doc);
            instance.remove((err, res) => {
                if (err) {
                    reject(err);
                }
                resolve(res);
            });
        });
    }

    public async find(query: Query<TEntity>): Promise<TEntity[]> {
        return new Promise<TEntity[]>((resolve, reject) => {
            this.Model.find(query as any, (err, res) => {
                if (err) {
                    reject(err);
                }
                resolve(res);
            });

            this.Model.findOneAndUpdate()
        });
    }

    public async findOneById(id: string): Promise<TEntity> {
        return new Promise<TEntity>((resolve, reject) => {
            this.Model.findById(id, (err, res) => {
                if (err) {
                    reject(err);
                }
                if (res === null) {
                    reject();
                } else {
                    resolve(res);
                }
            });
        });
    }

    public async findSpecified(query: Query<TEntity>, specifiedQuery: any): Promise<TEntity[]> {
        return new Promise<TEntity[]>((resolve, reject) => {
            this.Model.find(query as any, specifiedQuery as any, (err, res) => {
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

    public async findOne(condition: any): Promise<TEntity> {
        return new Promise<TEntity>((resolve, reject) => {
            this.Model.findOne(condition, (err, res) => {
                if (err) {
                    reject(err);
                }
                if (res === null) {
                    reject();
                } else {
                    resolve(res);
                }
            });
        });
    }

    findPagination(query: Query<TEntity>, pageNumber: number, itemPerPage: number): Promise<TEntity[]> {
        return new Promise<TEntity[]>((resolve, reject) => {
            this.Model.find(query as any).skip((pageNumber - 1) * itemPerPage).limit(itemPerPage).exec((err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            })
        });
    }
}