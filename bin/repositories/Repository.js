"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const inversify_1 = require("inversify");
const mongoose_1 = require("mongoose");
const MongoClient_1 = require("../lib/MongoClient");
let RepositoryImpl = class RepositoryImpl {
    constructor(mongoclient, name, schemaDefinition) {
        this.Model = mongoclient.model(name, new mongoose_1.Schema(schemaDefinition, { collection: name }));
    }
    findOneAndUpdate(query, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.Model.findOneAndUpdate(query, updates, { upsert: false }, (err, res) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(res);
                    }
                });
            });
        });
    }
    save(doc) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const instance = new this.Model(doc);
                instance.save((err, res) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(res);
                    }
                });
            });
        });
    }
    remove(doc) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const instance = new this.Model(doc);
                instance.remove((err, res) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(res);
                    }
                });
            });
        });
    }
    find(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.Model.find(query).sort({ updated: -1 }).exec((err, res) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(res);
                    }
                });
            });
        });
    }
    findOneById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.Model.findById(id, (err, res) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(res);
                    }
                });
            });
        });
    }
    findSpecified(query, specifiedQuery) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.Model.find(query, specifiedQuery).sort({ updated: -1 }).exec((err, res) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(res);
                    }
                });
            });
        });
    }
    update(condition, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.Model.update(condition, updates, (err, res) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(res);
                    }
                });
            });
        });
    }
    findOneOrCreate(condition, creator) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.Model.findOne(condition, (err, res) => __awaiter(this, void 0, void 0, function* () {
                    if (err) {
                        reject(err);
                    }
                    if (!res) {
                        res = yield this.save(yield creator());
                    }
                    else {
                        resolve(res);
                    }
                }));
            });
        });
    }
    findOne(condition) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.Model.findOne(condition, (err, res) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(res);
                    }
                });
            });
        });
    }
    findPagination(query, pageNumber, itemPerPage) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.Model.find(query).skip((pageNumber - 1) * itemPerPage).limit(itemPerPage).sort({ updated: -1 }).exec((err, res) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(res);
                    }
                });
            });
        });
    }
    count(condition) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.Model.count(condition, (err, count) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(count);
                    }
                });
            });
        });
    }
    findAndGetOneById(id, filedName) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.Model.findById(id).select(filedName).exec((err, res) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(res);
                });
            });
        });
    }
};
RepositoryImpl = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(MongoClient_1.MongoClientTYPE)),
    __param(1, inversify_1.unmanaged()),
    __param(2, inversify_1.unmanaged()),
    __metadata("design:paramtypes", [Object, String, Object])
], RepositoryImpl);
exports.RepositoryImpl = RepositoryImpl;
//# sourceMappingURL=Repository.js.map