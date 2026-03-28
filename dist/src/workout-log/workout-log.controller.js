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
exports.WorkoutLogController = void 0;
const common_1 = require("@nestjs/common");
const workout_log_service_1 = require("./workout-log.service");
const dto_1 = require("./dto");
const pagination_query_dto_1 = require("../common/dto/pagination-query.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let WorkoutLogController = class WorkoutLogController {
    workoutLogService;
    constructor(workoutLogService) {
        this.workoutLogService = workoutLogService;
    }
    startSession(userId, dto) {
        return this.workoutLogService.startSession(userId, dto);
    }
    getHistory(userId, query) {
        return this.workoutLogService.getSessionHistory(userId, query.page ?? 1, query.limit ?? 20);
    }
    getSession(userId, sessionId) {
        return this.workoutLogService.getSessionById(userId, sessionId);
    }
    logSet(userId, sessionId, dto) {
        return this.workoutLogService.logSet(userId, sessionId, dto);
    }
    completeSession(userId, sessionId, dto) {
        return this.workoutLogService.completeSession(userId, sessionId, dto);
    }
    deleteSession(userId, sessionId) {
        return this.workoutLogService.deleteSession(userId, sessionId);
    }
};
exports.WorkoutLogController = WorkoutLogController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, dto_1.StartSessionDto]),
    __metadata("design:returntype", void 0)
], WorkoutLogController.prototype, "startSession", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, pagination_query_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", void 0)
], WorkoutLogController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], WorkoutLogController.prototype, "getSession", null);
__decorate([
    (0, common_1.Post)(':id/sets'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, dto_1.LogSetDto]),
    __metadata("design:returntype", void 0)
], WorkoutLogController.prototype, "logSet", null);
__decorate([
    (0, common_1.Patch)(':id/complete'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, dto_1.CompleteSessionDto]),
    __metadata("design:returntype", void 0)
], WorkoutLogController.prototype, "completeSession", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], WorkoutLogController.prototype, "deleteSession", null);
exports.WorkoutLogController = WorkoutLogController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('workout-sessions'),
    __metadata("design:paramtypes", [workout_log_service_1.WorkoutLogService])
], WorkoutLogController);
//# sourceMappingURL=workout-log.controller.js.map