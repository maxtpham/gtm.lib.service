"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.DefaultMongoClientTYPE = Symbol("DefaultMongoClient");
exports.DbSchema = {
    created: { type: mongoose.Schema.Types.Number, required: true, default: Date.now },
    updated: { type: mongoose.Schema.Types.Number, required: true, default: Date.now },
    deleted: { type: mongoose.Schema.Types.Number, required: false },
};
//# sourceMappingURL=DbEntity.js.map