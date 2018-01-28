import * as mongoose from "mongoose";
import { DbEntity, DbSchema } from "./DbEntity"

export interface OrgEntity extends DbEntity {
    orgId: string;
}

export const OrgSchema = {
    ...DbSchema,
    orgId: { type: mongoose.Schema.Types.ObjectId, required: true },
};