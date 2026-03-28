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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuscleGroupController = void 0;
const common_1 = require("@nestjs/common");
const muscle_group_service_1 = require("./muscle-group.service");
const dto_1 = require("./dto");
const common_2 = require("../common");
let MuscleGroupController = class MuscleGroupController {
    muscleGroupService;
    constructor(muscleGroupService) {
        this.muscleGroupService = muscleGroupService;
    }
    findAll(query) {
        return this.muscleGroupService.findAll(query);
    }
    create(dto) {
        return this.muscleGroupService.create(dto);
    }
    update(id, dto) {
        return this.muscleGroupService.update(id, dto);
    }
    remove(id) {
        return this.muscleGroupService.remove(id);
    }
};
exports.MuscleGroupController = MuscleGroupController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.FindMuscleGroupsQueryDto]),
    __metadata("design:returntype", void 0)
], MuscleGroupController.prototype, "findAll", null);
__decorate([
    (0, common_1.UseGuards)(common_2.JwtAuthGuard, common_2.RolesGuard),
    (0, common_2.Roles)('admin'),
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateMuscleGroupDto]),
    __metadata("design:returntype", void 0)
], MuscleGroupController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(common_2.JwtAuthGuard, common_2.RolesGuard),
    (0, common_2.Roles)('admin'),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, dto_1.UpdateMuscleGroupDto]),
    __metadata("design:returntype", void 0)
], MuscleGroupController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(common_2.JwtAuthGuard, common_2.RolesGuard),
    (0, common_2.Roles)('admin'),
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], MuscleGroupController.prototype, "remove", null);
exports.MuscleGroupController = MuscleGroupController = __decorate([
    (0, common_1.Controller)('muscle-groups'),
    __metadata("design:paramtypes", [muscle_group_service_1.MuscleGroupService])
], MuscleGroupController);
//# sourceMappingURL=muscle-group.controller.js.map