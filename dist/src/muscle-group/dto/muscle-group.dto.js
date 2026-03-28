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
exports.UpdateMuscleGroupDto = exports.CreateMuscleGroupDto = exports.FindMuscleGroupsQueryDto = exports.BodyRegion = void 0;
const class_validator_1 = require("class-validator");
const pagination_query_dto_1 = require("../../common/dto/pagination-query.dto");
var BodyRegion;
(function (BodyRegion) {
    BodyRegion["UPPER_BODY"] = "upper_body";
    BodyRegion["LOWER_BODY"] = "lower_body";
    BodyRegion["CORE"] = "core";
    BodyRegion["FULL_BODY"] = "full_body";
})(BodyRegion || (exports.BodyRegion = BodyRegion = {}));
class FindMuscleGroupsQueryDto extends pagination_query_dto_1.PaginationQueryDto {
    bodyRegion;
}
exports.FindMuscleGroupsQueryDto = FindMuscleGroupsQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(BodyRegion),
    __metadata("design:type", String)
], FindMuscleGroupsQueryDto.prototype, "bodyRegion", void 0);
class CreateMuscleGroupDto {
    name;
    bodyRegion;
}
exports.CreateMuscleGroupDto = CreateMuscleGroupDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateMuscleGroupDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(BodyRegion),
    __metadata("design:type", String)
], CreateMuscleGroupDto.prototype, "bodyRegion", void 0);
class UpdateMuscleGroupDto {
    name;
    bodyRegion;
}
exports.UpdateMuscleGroupDto = UpdateMuscleGroupDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], UpdateMuscleGroupDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(BodyRegion),
    __metadata("design:type", String)
], UpdateMuscleGroupDto.prototype, "bodyRegion", void 0);
//# sourceMappingURL=muscle-group.dto.js.map