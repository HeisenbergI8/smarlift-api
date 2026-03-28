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
exports.PersonalRecordController = void 0;
const common_1 = require("@nestjs/common");
const personal_record_service_1 = require("./personal-record.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let PersonalRecordController = class PersonalRecordController {
    personalRecordService;
    constructor(personalRecordService) {
        this.personalRecordService = personalRecordService;
    }
    getUserRecords(userId) {
    }
    getRecordsByExercise(userId, exerciseId) {
    }
};
exports.PersonalRecordController = PersonalRecordController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PersonalRecordController.prototype, "getUserRecords", null);
__decorate([
    (0, common_1.Get)('exercise/:exerciseId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('exerciseId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], PersonalRecordController.prototype, "getRecordsByExercise", null);
exports.PersonalRecordController = PersonalRecordController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('personal-records'),
    __metadata("design:paramtypes", [personal_record_service_1.PersonalRecordService])
], PersonalRecordController);
//# sourceMappingURL=personal-record.controller.js.map