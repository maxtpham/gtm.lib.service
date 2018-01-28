"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
class StaticFile {
    constructor(filePath) {
        this.filePath = filePath;
    }
    get name() {
        return path.basename(this.filePath);
    }
    get handler() {
        return this._handler.bind(this);
    }
    _handler(req, res, next) {
        res.sendFile(this.filePath);
    }
}
exports.StaticFile = StaticFile;
//# sourceMappingURL=StaticFile.js.map