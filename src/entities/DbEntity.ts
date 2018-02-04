import * as mongoose from "mongoose";
import { Entity } from "./Entity";

export const DefaultMongoClientTYPE = Symbol("DefaultMongoClient");

export interface DbEntity extends Entity {
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