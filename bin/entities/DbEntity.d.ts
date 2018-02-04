import * as mongoose from "mongoose";
import { Entity } from "./Entity";
export declare const DefaultMongoClientTYPE: unique symbol;
export interface DbEntity extends Entity {
    _id: any;
    created?: number;
    updated?: number;
    deleted?: number;
}
export declare const DbSchema: {
    created: {
        type: typeof mongoose.Schema.Types.Number;
        required: boolean;
        default: () => number;
    };
    updated: {
        type: typeof mongoose.Schema.Types.Number;
        required: boolean;
        default: () => number;
    };
    deleted: {
        type: typeof mongoose.Schema.Types.Number;
        required: boolean;
    };
};
