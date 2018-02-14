"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.LocationSchema = {
    x: { type: mongoose.Schema.Types.Number, required: true },
    y: { type: mongoose.Schema.Types.Number, required: true },
};
exports.AttachmentSchema = {
    media: { type: mongoose.Schema.Types.String, required: true },
    data: { type: mongoose.Schema.Types.Buffer, required: true },
};
//# sourceMappingURL=Others.js.map