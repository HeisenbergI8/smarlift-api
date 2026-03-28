import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserProfileModule } from './user-profile/user-profile.module';
import { EquipmentModule } from './equipment/equipment.module';
import { MuscleGroupModule } from './muscle-group/muscle-group.module';
import { ExerciseModule } from './exercise/exercise.module';
import { MusclePriorityModule } from './muscle-priority/muscle-priority.module';
import { WorkoutPlanModule } from './workout-plan/workout-plan.module';
import { WorkoutLogModule } from './workout-log/workout-log.module';
import { ProgressionModule } from './progression/progression.module';
import { EgoLiftModule } from './ego-lift/ego-lift.module';
import { NutritionModule } from './nutrition/nutrition.module';
import { BodyWeightModule } from './body-weight/body-weight.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { HealthModule } from './health/health.module';
import { NotificationModule } from './notification/notification.module';
import { MilestoneModule } from './milestone/milestone.module';
import { PersonalRecordModule } from './personal-record/personal-record.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60_000,
        limit: 60,
      },
    ]),
    PrismaModule,
    AuthModule,
    UserProfileModule,
    EquipmentModule,
    MuscleGroupModule,
    ExerciseModule,
    MusclePriorityModule,
    WorkoutPlanModule,
    WorkoutLogModule,
    ProgressionModule,
    EgoLiftModule,
    NutritionModule,
    BodyWeightModule,
    DashboardModule,
    HealthModule,
    NotificationModule,
    MilestoneModule,
    PersonalRecordModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
