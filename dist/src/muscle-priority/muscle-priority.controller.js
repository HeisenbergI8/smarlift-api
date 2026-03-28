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
exports.MusclePriorityController = void 0;
const common_1 = require("@nestjs/common");
const pagination_query_dto_1 = require("../common/dto/pagination-query.dto");
const muscle_priority_service_1 = require("./muscle-priority.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let MusclePriorityController = class MusclePriorityController {
    musclePriorityService;
    constructor(musclePriorityService) {
        this.musclePriorityService = musclePriorityService;
    }
    getUserPriorities(userId, query) {
        return this.musclePriorityService.getUserPriorities(userId, query);
    }
    upsertPriority(userId, dto) {
        return this.musclePriorityService.upsertPriority(userId, dto);
    }
    deletePriority(userId, muscleGroupId) {
        return this.musclePriorityService.deletePriority(userId, muscleGroupId);
    }
};
exports.MusclePriorityController = MusclePriorityController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, pagination_query_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", void 0)
], MusclePriorityController.prototype, "getUserPriorities", null);
__decorate([
    (0, common_1.Put)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, dto_1.UpsertMusclePriorityDto]),
    __metadata("design:returntype", void 0)
], MusclePriorityController.prototype, "upsertPriority", null);
__decorate([
    (0, common_1.Delete)(':muscleGroupId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('muscleGroupId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], MusclePriorityController.prototype, "deletePriority", null);
exports.MusclePriorityController = MusclePriorityController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('muscle-priorities'),
    __metadata("design:paramtypes", [muscle_priority_service_1.MusclePriorityService])
], MusclePriorityController);
//# sourceMappingURL=muscle-priority.controller.js.map