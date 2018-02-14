"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.DefaultMongoClientTYPE = Symbol("DefaultMongoClient");
exports.DbSchema = {
    created: { type: mongoose.Schema.Types.Number, required: true, default: Date.now },
    updated: { type: mongoose.Schema.Types.Number, required: true, default: Date.now },
    deleted: { type: mongoose.Schema.Types.Number, required: false },
};
var DbEntity;
(function (DbEntity) {
    function toView(entity) {
        const _a = !!entity.toObject ? entity.toObject() : entity, { _id, __v, created, deleted, updated } = _a, view = __rest(_a, ["_id", "__v", "created", "deleted", "updated"]);
        return view;
    }
    DbEntity.toView = toView;
})(DbEntity = exports.DbEntity || (exports.DbEntity = {}));
//# sourceMappingURL=DbEntity.js.map