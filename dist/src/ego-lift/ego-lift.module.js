"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EgoLiftModule = void 0;
const common_1 = require("@nestjs/common");
const ego_lift_controller_1 = require("./ego-lift.controller");
const ego_lift_service_1 = require("./ego-lift.service");
let EgoLiftModule = class EgoLiftModule {
};
exports.EgoLiftModule = EgoLiftModule;
exports.EgoLiftModule = EgoLiftModule = __decorate([
    (0, common_1.Module)({
        controllers: [ego_lift_controller_1.EgoLiftController],
        providers: [ego_lift_service_1.EgoLiftService],
        exports: [ego_lift_service_1.EgoLiftService],
    })
], EgoLiftModule);
//# sourceMappingURL=ego-lift.module.js.map