"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const DbEntity_1 = require("./DbEntity");
exports.OrgSchema = Object.assign({}, DbEntity_1.DbSchema, { orgId: { type: mongoose.Schema.Types.ObjectId, required: true } });
//# sourceMappingURL=OrgEntity.js.map