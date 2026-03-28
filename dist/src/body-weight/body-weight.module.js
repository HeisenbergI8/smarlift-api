"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BodyWeightModule = void 0;
const common_1 = require("@nestjs/common");
const body_weight_controller_1 = require("./body-weight.controller");
const body_weight_service_1 = require("./body-weight.service");
let BodyWeightModule = class BodyWeightModule {
};
exports.BodyWeightModule = BodyWeightModule;
exports.BodyWeightModule = BodyWeightModule = __decorate([
    (0, common_1.Module)({
        controllers: [body_weight_controller_1.BodyWeightController],
        providers: [body_weight_service_1.BodyWeightService],
        exports: [body_weight_service_1.BodyWeightService],
    })
], BodyWeightModule);
//# sourceMappingURL=body-weight.module.js.map