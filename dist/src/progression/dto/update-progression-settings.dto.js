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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProgressionSettingsDto = exports.ProgressionTrainingGoal = exports.ProgressionFrequency = void 0;
const class_validator_1 = require("class-validator");
var ProgressionFrequency;
(function (ProgressionFrequency) {
    ProgressionFrequency["WEEKLY"] = "weekly";
    ProgressionFrequency["BIWEEKLY"] = "biweekly";
    ProgressionFrequency["MONTHLY"] = "monthly";
})(ProgressionFrequency || (exports.ProgressionFrequency = ProgressionFrequency = {}));
var ProgressionTrainingGoal;
(function (ProgressionTrainingGoal) {
    ProgressionTrainingGoal["STRENGTH"] = "strength";
    ProgressionTrainingGoal["HYPERTROPHY"] = "hypertrophy";
    ProgressionTrainingGoal["ENDURANCE"] = "endurance";
})(ProgressionTrainingGoal || (exports.ProgressionTrainingGoal = ProgressionTrainingGoal = {}));
class UpdateProgressionSettingsDto {
    isEnabled;
    progressionFrequency;
    trainingGoal;
    weightIncrementKg;
    maxRepsBeforeIncrease;
}
exports.UpdateProgressionSettingsDto = UpdateProgressionSettingsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateProgressionSettingsDto.prototype, "isEnabled", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ProgressionFrequency),
    __metadata("design:type", String)
], UpdateProgressionSettingsDto.prototype, "progressionFrequency", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ProgressionTrainingGoal),
    __metadata("design:type", String)
], UpdateProgressionSettingsDto.prototype, "trainingGoal", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateProgressionSettingsDto.prototype, "weightIncrementKg", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UpdateProgressionSettingsDto.prototype, "maxRepsBeforeIncrease", void 0);
//# sourceMappingURL=update-progression-settings.dto.js.map