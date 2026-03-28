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
exports.CreateWorkoutPlanDto = exports.CreatePlanDayDto = exports.CreatePlanExerciseDto = exports.WorkoutTrainingGoal = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var WorkoutTrainingGoal;
(function (WorkoutTrainingGoal) {
    WorkoutTrainingGoal["STRENGTH"] = "strength";
    WorkoutTrainingGoal["HYPERTROPHY"] = "hypertrophy";
    WorkoutTrainingGoal["ENDURANCE"] = "endurance";
    WorkoutTrainingGoal["GENERAL"] = "general";
})(WorkoutTrainingGoal || (exports.WorkoutTrainingGoal = WorkoutTrainingGoal = {}));
class CreatePlanExerciseDto {
    exerciseId;
    sortOrder;
    targetSets;
    targetRepsMin;
    targetRepsMax;
    targetWeightKg;
    targetRpe;
    restSeconds;
    notes;
}
exports.CreatePlanExerciseDto = CreatePlanExerciseDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreatePlanExerciseDto.prototype, "exerciseId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreatePlanExerciseDto.prototype, "sortOrder", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreatePlanExerciseDto.prototype, "targetSets", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreatePlanExerciseDto.prototype, "targetRepsMin", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreatePlanExerciseDto.prototype, "targetRepsMax", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePlanExerciseDto.prototype, "targetWeightKg", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(10),
    __metadata("design:type", Number)
], CreatePlanExerciseDto.prototype, "targetRpe", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreatePlanExerciseDto.prototype, "restSeconds", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePlanExerciseDto.prototype, "notes", void 0);
class CreatePlanDayDto {
    dayNumber;
    name;
    isRestDay;
    exercises;
}
exports.CreatePlanDayDto = CreatePlanDayDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreatePlanDayDto.prototype, "dayNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePlanDayDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePlanDayDto.prototype, "isRestDay", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreatePlanExerciseDto),
    __metadata("design:type", Array)
], CreatePlanDayDto.prototype, "exercises", void 0);
class CreateWorkoutPlanDto {
    name;
    description;
    trainingGoal;
    daysPerWeek;
    durationWeeks;
    startedAt;
    days;
}
exports.CreateWorkoutPlanDto = CreateWorkoutPlanDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWorkoutPlanDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWorkoutPlanDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(WorkoutTrainingGoal),
    __metadata("design:type", String)
], CreateWorkoutPlanDto.prototype, "trainingGoal", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(7),
    __metadata("design:type", Number)
], CreateWorkoutPlanDto.prototype, "daysPerWeek", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateWorkoutPlanDto.prototype, "durationWeeks", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateWorkoutPlanDto.prototype, "startedAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreatePlanDayDto),
    __metadata("design:type", Array)
], CreateWorkoutPlanDto.prototype, "days", void 0);
//# sourceMappingURL=create-workout-plan.dto.js.map