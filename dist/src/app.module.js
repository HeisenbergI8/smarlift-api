"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const user_profile_module_1 = require("./user-profile/user-profile.module");
const equipment_module_1 = require("./equipment/equipment.module");
const muscle_group_module_1 = require("./muscle-group/muscle-group.module");
const exercise_module_1 = require("./exercise/exercise.module");
const muscle_priority_module_1 = require("./muscle-priority/muscle-priority.module");
const workout_plan_module_1 = require("./workout-plan/workout-plan.module");
const workout_log_module_1 = require("./workout-log/workout-log.module");
const progression_module_1 = require("./progression/progression.module");
const ego_lift_module_1 = require("./ego-lift/ego-lift.module");
const nutrition_module_1 = require("./nutrition/nutrition.module");
const body_weight_module_1 = require("./body-weight/body-weight.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const health_module_1 = require("./health/health.module");
const notification_module_1 = require("./notification/notification.module");
const milestone_module_1 = require("./milestone/milestone.module");
const personal_record_module_1 = require("./personal-record/personal-record.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    name: 'default',
                    ttl: 60_000,
                    limit: 60,
                },
            ]),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            user_profile_module_1.UserProfileModule,
            equipment_module_1.EquipmentModule,
            muscle_group_module_1.MuscleGroupModule,
            exercise_module_1.ExerciseModule,
            muscle_priority_module_1.MusclePriorityModule,
            workout_plan_module_1.WorkoutPlanModule,
            workout_log_module_1.WorkoutLogModule,
            progression_module_1.ProgressionModule,
            ego_lift_module_1.EgoLiftModule,
            nutrition_module_1.NutritionModule,
            body_weight_module_1.BodyWeightModule,
            dashboard_module_1.DashboardModule,
            health_module_1.HealthModule,
            notification_module_1.NotificationModule,
            milestone_module_1.MilestoneModule,
            personal_record_module_1.PersonalRecordModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map