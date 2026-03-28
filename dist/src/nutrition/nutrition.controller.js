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
exports.NutritionController = void 0;
const common_1 = require("@nestjs/common");
const nutrition_service_1 = require("./nutrition.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let NutritionController = class NutritionController {
    nutritionService;
    constructor(nutritionService) {
        this.nutritionService = nutritionService;
    }
    getActiveRecommendation(userId) {
    }
    createRecommendation(userId, dto) {
    }
    generateSmartRecommendation(userId) {
    }
    logDailyNutrition(userId, dto) {
    }
    getDailyLogs(userId, startDate, endDate) {
    }
    getAdjustmentHistory(userId) {
    }
    detectPlateauAndAdjust(userId) {
    }
};
exports.NutritionController = NutritionController;
__decorate([
    (0, common_1.Get)('recommendation'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], NutritionController.prototype, "getActiveRecommendation", null);
__decorate([
    (0, common_1.Post)('recommendation'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, dto_1.CreateNutritionRecDto]),
    __metadata("design:returntype", void 0)
], NutritionController.prototype, "createRecommendation", null);
__decorate([
    (0, common_1.Post)('recommendation/generate'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], NutritionController.prototype, "generateSmartRecommendation", null);
__decorate([
    (0, common_1.Post)('daily-log'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, dto_1.LogDailyNutritionDto]),
    __metadata("design:returntype", void 0)
], NutritionController.prototype, "logDailyNutrition", null);
__decorate([
    (0, common_1.Get)('daily-logs'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", void 0)
], NutritionController.prototype, "getDailyLogs", null);
__decorate([
    (0, common_1.Get)('adjustments'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], NutritionController.prototype, "getAdjustmentHistory", null);
__decorate([
    (0, common_1.Post)('detect-plateau'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], NutritionController.prototype, "detectPlateauAndAdjust", null);
exports.NutritionController = NutritionController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('nutrition'),
    __metadata("design:paramtypes", [nutrition_service_1.NutritionService])
], NutritionController);
//# sourceMappingURL=nutrition.controller.js.map