import * as mongoose from "mongoose";
import { Entity } from "./Entity";
export declare const DefaultMongoClientTYPE: symbol;
export interface DbEntity extends Entity {
    _id: any;
    created?: Date;
    updated?: Date;
    deleted?: Date;
}
export declare const DbSchema: {
    created: {
        type: typeof mongoose.Schema.Types.Date;
        required: boolean;
        default: () => number;
    };
    updated: {
        type: typeof mongoose.Schema.Types.Date;
        required: boolean;
        default: () => number;
    };
    deleted: {
        type: typeof mongoose.Schema.Types.Date;
        required: boolean;
    };
};
