"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuscleGroupModule = void 0;
const common_1 = require("@nestjs/common");
const muscle_group_controller_1 = require("./muscle-group.controller");
const muscle_group_service_1 = require("./muscle-group.service");
let MuscleGroupModule = class MuscleGroupModule {
};
exports.MuscleGroupModule = MuscleGroupModule;
exports.MuscleGroupModule = MuscleGroupModule = __decorate([
    (0, common_1.Module)({
        controllers: [muscle_group_controller_1.MuscleGroupController],
        providers: [muscle_group_service_1.MuscleGroupService],
        exports: [muscle_group_service_1.MuscleGroupService],
    })
], MuscleGroupModule);
//# sourceMappingURL=muscle-group.module.js.map