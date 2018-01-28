"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const inversify_1 = require("inversify");
let Controller = class Controller {
};
Controller = __decorate([
    inversify_1.injectable()
], Controller);
exports.Controller = Controller;
let ApiController = class ApiController extends Controller {
};
ApiController = __decorate([
    inversify_1.injectable()
], ApiController);
exports.ApiController = ApiController;
let WebController = class WebController extends Controller {
};
WebController = __decorate([
    inversify_1.injectable()
], WebController);
exports.WebController = WebController;
//# sourceMappingURL=Controller.js.map