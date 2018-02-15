import * as mongoose from "mongoose";
import { Binary } from "bson";
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
    data: Binary;
}
export declare const LocationSchema: {
    x: {
        type: typeof mongoose.Schema.Types.Number;
        required: boolean;
    };
    y: {
        type: typeof mongoose.Schema.Types.Number;
        required: boolean;
    };
};
export declare const AttachmentSchema: {
    media: {
        type: typeof mongoose.Schema.Types.String;
        required: boolean;
    };
    data: {
        type: typeof mongoose.Schema.Types.Buffer;
        required: boolean;
    };
};
