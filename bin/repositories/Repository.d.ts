import { Document, Model, SchemaDefinition } from 'mongoose';
import { DbEntity } from '../entities/DbEntity';
import { MongoClient } from '../lib/MongoClient';
export declare type Query<T> = {
    [P in keyof T]?: T[P] | {
        $regex: RegExp;
    };
};
export interface Repository<TEntity> {
    save(doc: TEntity): Promise<TEntity>;
    remove(doc: TEntity): Promise<TEntity>;
    find(query: Query<TEntity>): Promise<TEntity[]>;
    findOneById(id: string): Promise<TEntity>;
    findOneAndUpdate(query: Query<TEntity>, updates: any | TEntity): Promise<TEntity>;
}
export declare class RepositoryImpl<TEntity extends DbEntity & Document> implements Repository<TEntity> {
    protected Model: Model<TEntity>;
    constructor(mongoclient: MongoClient, name: string, schemaDefinition: SchemaDefinition);
    findOneAndUpdate(query: Query<TEntity>, updates: any | TEntity): Promise<TEntity>;
    save(doc: TEntity): Promise<TEntity>;
    remove(doc: TEntity): Promise<TEntity>;
    find(query: Query<TEntity>): Promise<TEntity[]>;
    findOneById(id: string): Promise<TEntity>;
}
