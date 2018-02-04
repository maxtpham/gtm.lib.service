import * as mongoose from "mongoose";
import { DbEntity } from "./DbEntity";
export interface OrgEntity extends DbEntity {
    orgId: string;
}
export declare const OrgSchema: {
    orgId: {
        type: typeof mongoose.Schema.Types.ObjectId;
        required: boolean;
    };
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
