import * as mongoose from "mongoose";
import { View, Entity } from "./Entity";

export const DefaultMongoClientTYPE = Symbol("DefaultMongoClient");

export interface DbView extends View {

}

export interface DbEntity extends Entity, DbView {
    _id: any;
    created?: number;
    updated?: number;
    deleted?: number;
}

export const DbSchema = {
    created: { type: mongoose.Schema.Types.Number, required: true, default: Date.now },
    updated: { type: mongoose.Schema.Types.Number, required: true, default: Date.now },
    deleted: { type: mongoose.Schema.Types.Number, required: false },
};

export module DbEntity {
    export function toView(entity: DbEntity): DbView {
        const { _id, __v, created, deleted, updated, ...view } = !!(<mongoose.Document><any>entity).toObject ? (<mongoose.Document><any>entity).toObject() : entity;
        return view;
    }
}