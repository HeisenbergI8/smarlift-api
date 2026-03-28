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
exports.UpdateProfileDto = exports.TrainingMethod = exports.ActivityLevel = exports.FitnessGoal = exports.Gender = void 0;
const class_validator_1 = require("class-validator");
var Gender;
(function (Gender) {
    Gender["MALE"] = "male";
    Gender["FEMALE"] = "female";
    Gender["OTHER"] = "other";
})(Gender || (exports.Gender = Gender = {}));
var FitnessGoal;
(function (FitnessGoal) {
    FitnessGoal["LOSE_WEIGHT"] = "lose_weight";
    FitnessGoal["GAIN_MUSCLE"] = "gain_muscle";
    FitnessGoal["MAINTAIN"] = "maintain";
})(FitnessGoal || (exports.FitnessGoal = FitnessGoal = {}));
var ActivityLevel;
(function (ActivityLevel) {
    ActivityLevel["SEDENTARY"] = "sedentary";
    ActivityLevel["LIGHTLY_ACTIVE"] = "lightly_active";
    ActivityLevel["MODERATELY_ACTIVE"] = "moderately_active";
    ActivityLevel["VERY_ACTIVE"] = "very_active";
    ActivityLevel["EXTRA_ACTIVE"] = "extra_active";
})(ActivityLevel || (exports.ActivityLevel = ActivityLevel = {}));
var TrainingMethod;
(function (TrainingMethod) {
    TrainingMethod["WEIGHT_TRAINING"] = "weight_training";
    TrainingMethod["BODYWEIGHT"] = "bodyweight";
    TrainingMethod["HYBRID"] = "hybrid";
})(TrainingMethod || (exports.TrainingMethod = TrainingMethod = {}));
class UpdateProfileDto {
    heightCm;
    weightKg;
    age;
    gender;
    fitnessGoal;
    activityLevel;
    trainingMethod;
    trainingDaysPerWeek;
}
exports.UpdateProfileDto = UpdateProfileDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(50),
    (0, class_validator_1.Max)(300),
    __metadata("design:type", Number)
], UpdateProfileDto.prototype, "heightCm", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(20),
    (0, class_validator_1.Max)(500),
    __metadata("design:type", Number)
], UpdateProfileDto.prototype, "weightKg", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(13),
    (0, class_validator_1.Max)(120),
    __metadata("design:type", Number)
], UpdateProfileDto.prototype, "age", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(Gender),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "gender", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(FitnessGoal),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "fitnessGoal", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ActivityLevel),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "activityLevel", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(TrainingMethod),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "trainingMethod", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(7),
    __metadata("design:type", Number)
], UpdateProfileDto.prototype, "trainingDaysPerWeek", void 0);
//# sourceMappingURL=update-profile.dto.js.map