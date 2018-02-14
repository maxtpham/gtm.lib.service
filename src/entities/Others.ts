import * as mongoose from "mongoose";
import { DbView } from "./DbEntity";

export interface LocationView {
    /** longitude */
    x: number;
    /** latitude */
    y: number;
}

export interface AttachmentView {
    /** HTML Content-Type: image/png, image/jpeg, image/gif,..
     * This will be return to browser client to correctly load & show the image  */
    media: string;

    /** Image raw/binary Content-Data will be stramming to browser client */
    data: Buffer;
}

export const LocationSchema = {
    x: { type: mongoose.Schema.Types.Number, required: true },
    y: { type: mongoose.Schema.Types.Number, required: true },
}

export const AttachmentSchema = {
    media: { type: mongoose.Schema.Types.String, required: true },
    data: { type: mongoose.Schema.Types.Buffer, required: true },   
}
