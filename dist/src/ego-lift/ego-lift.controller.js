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
exports.EgoLiftController = void 0;
const common_1 = require("@nestjs/common");
const ego_lift_service_1 = require("./ego-lift.service");
const pagination_query_dto_1 = require("../common/dto/pagination-query.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let EgoLiftController = class EgoLiftController {
    egoLiftService;
    constructor(egoLiftService) {
        this.egoLiftService = egoLiftService;
    }
    getAlerts(userId, query) {
    }
    getAlertsByExercise(userId, exerciseId) {
    }
    dismissAlert(userId, alertId) {
    }
};
exports.EgoLiftController = EgoLiftController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, pagination_query_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", void 0)
], EgoLiftController.prototype, "getAlerts", null);
__decorate([
    (0, common_1.Get)('exercise/:exerciseId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('exerciseId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], EgoLiftController.prototype, "getAlertsByExercise", null);
__decorate([
    (0, common_1.Patch)(':id/dismiss'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], EgoLiftController.prototype, "dismissAlert", null);
exports.EgoLiftController = EgoLiftController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('ego-lift-alerts'),
    __metadata("design:paramtypes", [ego_lift_service_1.EgoLiftService])
], EgoLiftController);
//# sourceMappingURL=ego-lift.controller.js.map