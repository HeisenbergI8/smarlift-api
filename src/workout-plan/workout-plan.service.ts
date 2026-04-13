import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import {
  Prisma,
  UserProfile_fitnessGoal,
  Exercise_category,
  Exercise_difficulty,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateWorkoutPlanDto,
  UpdateWorkoutPlanDto,
  GenerateWorkoutPlanDto,
} from './dto';
import { WorkoutPlanResponse } from './interfaces';

const PLAN_INCLUDE = {
  days: {
    orderBy: { dayNumber: 'asc' as const },
    include: {
      exercises: {
        orderBy: { sortOrder: 'asc' as const },
        include: { exercise: true },
      },
    },
  },
} as const;

@Injectable()
export class WorkoutPlanService {
  private readonly logger = new Logger(WorkoutPlanService.name);

  constructor(private readonly prisma: PrismaService) {}

  private mapPlan(raw: {
    id: bigint;
    userId: bigint;
    name: string;
    description: string | null;
    trainingGoal: import('@prisma/client').WorkoutPlan_trainingGoal;
    daysPerWeek: number;
    durationWeeks: number | null;
    isActive: boolean;
    source: import('@prisma/client').WorkoutPlan_source;
    startedAt: Date | null;
    endedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    days: {
      id: bigint;
      workoutPlanId: bigint;
      dayNumber: number;
      name: string | null;
      isRestDay: boolean;
      createdAt: Date;
      updatedAt: Date;
      exercises: {
        id: bigint;
        workoutPlanDayId: bigint;
        exerciseId: bigint;
        sortOrder: number;
        targetSets: number;
        targetRepsMin: number;
        targetRepsMax: number;
        targetWeightKg: Prisma.Decimal | null;
        targetRpe: Prisma.Decimal | null;
        restSeconds: number;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        exercise: {
          id: bigint;
          name: string;
          description: string | null;
          category: import('@prisma/client').Exercise_category;
          difficulty: import('@prisma/client').Exercise_difficulty;
          isBodyweight: boolean;
        };
      }[];
    }[];
  }): WorkoutPlanResponse {
    return {
      id: Number(raw.id),
      userId: Number(raw.userId),
      name: raw.name,
      description: raw.description,
      trainingGoal: raw.trainingGoal,
      daysPerWeek: raw.daysPerWeek,
      durationWeeks: raw.durationWeeks,
      isActive: raw.isActive,
      source: raw.source,
      startedAt: raw.startedAt,
      endedAt: raw.endedAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      days: raw.days.map((day) => ({
        id: Number(day.id),
        workoutPlanId: Number(day.workoutPlanId),
        dayNumber: day.dayNumber,
        name: day.name,
        isRestDay: day.isRestDay,
        createdAt: day.createdAt,
        updatedAt: day.updatedAt,
        exercises: day.exercises.map((ex) => ({
          id: Number(ex.id),
          workoutPlanDayId: Number(ex.workoutPlanDayId),
          exerciseId: Number(ex.exerciseId),
          sortOrder: ex.sortOrder,
          targetSets: ex.targetSets,
          targetRepsMin: ex.targetRepsMin,
          targetRepsMax: ex.targetRepsMax,
          targetWeightKg:
            ex.targetWeightKg !== null
              ? parseFloat(ex.targetWeightKg.toString())
              : null,
          targetRpe:
            ex.targetRpe !== null ? parseFloat(ex.targetRpe.toString()) : null,
          restSeconds: ex.restSeconds,
          notes: ex.notes,
          createdAt: ex.createdAt,
          updatedAt: ex.updatedAt,
          exercise: {
            id: Number(ex.exercise.id),
            name: ex.exercise.name,
            description: ex.exercise.description,
            category: ex.exercise.category,
            difficulty: ex.exercise.difficulty,
            isBodyweight: ex.exercise.isBodyweight,
          },
        })),
      })),
    };
  }

  async create(
    userId: number,
    dto: CreateWorkoutPlanDto,
  ): Promise<WorkoutPlanResponse> {
    const raw = await this.prisma.workoutPlan.create({
      data: {
        userId: BigInt(userId),
        createdBy: BigInt(userId),
        name: dto.name,
        description: dto.description,
        trainingGoal: dto.trainingGoal as never,
        daysPerWeek: dto.daysPerWeek,
        durationWeeks: dto.durationWeeks,
        startedAt: dto.startedAt ? new Date(dto.startedAt) : undefined,
        source: 'user',
        days: dto.days?.length
          ? {
              create: dto.days.map((day) => ({
                dayNumber: day.dayNumber,
                name: day.name,
                isRestDay: day.isRestDay ?? false,
                exercises: day.exercises?.length
                  ? {
                      create: day.exercises.map((ex) => ({
                        exerciseId: BigInt(ex.exerciseId),
                        sortOrder: ex.sortOrder ?? 1,
                        targetSets: ex.targetSets ?? 3,
                        targetRepsMin: ex.targetRepsMin ?? 8,
                        targetRepsMax: ex.targetRepsMax ?? 12,
                        targetWeightKg: ex.targetWeightKg,
                        targetRpe: ex.targetRpe,
                        restSeconds: ex.restSeconds ?? 90,
                        notes: ex.notes,
                      })),
                    }
                  : undefined,
              })),
            }
          : undefined,
      },
      include: PLAN_INCLUDE,
    });
    return this.mapPlan(raw);
  }

  async findAllByUser(userId: number): Promise<WorkoutPlanResponse[]> {
    const raws = await this.prisma.workoutPlan.findMany({
      where: { userId: BigInt(userId) },
      include: PLAN_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
    return raws.map((r) => this.mapPlan(r));
  }

  async findOne(userId: number, planId: number): Promise<WorkoutPlanResponse> {
    const plan = await this.prisma.workoutPlan.findUnique({
      where: { id: BigInt(planId) },
      include: PLAN_INCLUDE,
    });
    if (!plan || plan.userId !== BigInt(userId)) {
      throw new NotFoundException('Workout plan not found');
    }
    return this.mapPlan(plan);
  }

  async getActivePlan(userId: number): Promise<WorkoutPlanResponse> {
    const plan = await this.prisma.workoutPlan.findFirst({
      where: { userId: BigInt(userId), isActive: true },
      include: PLAN_INCLUDE,
    });
    if (!plan) {
      throw new NotFoundException('No active workout plan found');
    }
    return this.mapPlan(plan);
  }

  async update(
    userId: number,
    planId: number,
    dto: UpdateWorkoutPlanDto,
  ): Promise<WorkoutPlanResponse> {
    await this.findOne(userId, planId);

    return this.prisma.$transaction(async (tx) => {
      if (dto.days !== undefined) {
        const existingDays = await tx.workoutPlanDay.findMany({
          where: { workoutPlanId: BigInt(planId) },
          select: { id: true },
        });
        const dayIds = existingDays.map((d) => d.id);
        if (dayIds.length) {
          await tx.workoutPlanExercise.deleteMany({
            where: { workoutPlanDayId: { in: dayIds } },
          });
        }
        await tx.workoutPlanDay.deleteMany({
          where: { workoutPlanId: BigInt(planId) },
        });
      }

      const updated = await tx.workoutPlan.update({
        where: { id: BigInt(planId) },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.description !== undefined && {
            description: dto.description,
          }),
          ...(dto.trainingGoal !== undefined && {
            trainingGoal: dto.trainingGoal as never,
          }),
          ...(dto.daysPerWeek !== undefined && {
            daysPerWeek: dto.daysPerWeek,
          }),
          ...(dto.durationWeeks !== undefined && {
            durationWeeks: dto.durationWeeks,
          }),
          ...(dto.startedAt !== undefined && {
            startedAt: new Date(dto.startedAt),
          }),
          ...(dto.days?.length && {
            days: {
              create: dto.days.map((day) => ({
                dayNumber: day.dayNumber,
                name: day.name,
                isRestDay: day.isRestDay ?? false,
                exercises: day.exercises?.length
                  ? {
                      create: day.exercises.map((ex) => ({
                        exerciseId: BigInt(ex.exerciseId),
                        sortOrder: ex.sortOrder ?? 1,
                        targetSets: ex.targetSets ?? 3,
                        targetRepsMin: ex.targetRepsMin ?? 8,
                        targetRepsMax: ex.targetRepsMax ?? 12,
                        targetWeightKg: ex.targetWeightKg,
                        targetRpe: ex.targetRpe,
                        restSeconds: ex.restSeconds ?? 90,
                        notes: ex.notes,
                      })),
                    }
                  : undefined,
              })),
            },
          }),
        },
        include: PLAN_INCLUDE,
      });
      return this.mapPlan(updated);
    });
  }

  async remove(userId: number, planId: number): Promise<void> {
    await this.findOne(userId, planId);
    await this.prisma.workoutPlan.delete({ where: { id: BigInt(planId) } });
  }

  async activate(userId: number, planId: number): Promise<WorkoutPlanResponse> {
    await this.findOne(userId, planId);

    return this.prisma.$transaction(async (tx) => {
      await tx.workoutPlan.updateMany({
        where: { userId: BigInt(userId), isActive: true },
        data: { isActive: false },
      });
      const activatedRaw = await tx.workoutPlan.update({
        where: { id: BigInt(planId) },
        data: { isActive: true },
        include: PLAN_INCLUDE,
      });
      return this.mapPlan(activatedRaw);
    });
  }

  async generatePlan(
    userId: number,
    dto: GenerateWorkoutPlanDto,
  ): Promise<WorkoutPlanResponse> {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId: BigInt(userId) },
    });
    if (!profile) {
      throw new BadRequestException(
        'Complete your profile before generating a plan',
      );
    }
    if (!profile.fitnessGoal) {
      throw new BadRequestException(
        'Set a fitness goal in your profile before generating a plan',
      );
    }

    const trainingGoal: string =
      dto.trainingGoalOverride ??
      this.mapFitnessGoalToTrainingGoal(profile.fitnessGoal);
    const daysPerWeek = dto.daysPerWeekOverride ?? profile.trainingDaysPerWeek;

    const userEquipment = await this.prisma.userEquipment.findMany({
      where: { userId: BigInt(userId) },
      select: { equipmentId: true },
    });
    const equipmentIds = userEquipment.map((ue) => ue.equipmentId);

    const musclePriorities = await this.prisma.userMusclePriority.findMany({
      where: { userId: BigInt(userId) },
      select: { muscleGroupId: true, priorityLevel: true, hasImbalance: true },
    });
    const priorityMap = new Map<string, string>(
      musclePriorities.map((p) => [
        p.muscleGroupId.toString(),
        p.priorityLevel,
      ]),
    );
    const imbalanceSet = new Set<string>(
      musclePriorities
        .filter((p) => p.hasImbalance)
        .map((p) => p.muscleGroupId.toString()),
    );
    // Use habitual training frequency to proxy experience — someone training 5+
    // days/week is more experienced with exercise form than someone training once.
    // activityLevel (sedentary/active) reflects cardiovascular lifestyle, not
    // lifting experience, and is intentionally NOT used here.
    const experienceLevel = this.getExperienceLevel(
      profile.trainingDaysPerWeek,
    );

    const trainingMethod = profile.trainingMethod;
    const includeBodyweight =
      trainingMethod === 'bodyweight' || trainingMethod === 'hybrid';
    const includeWeights =
      trainingMethod === 'weight_training' || trainingMethod === 'hybrid';

    const orConditions: Prisma.ExerciseWhereInput[] = [];
    if (includeBodyweight) {
      orConditions.push({ isBodyweight: true });
    }
    if (includeWeights && equipmentIds.length) {
      orConditions.push({
        exerciseEquipment: { some: { equipmentId: { in: equipmentIds } } },
      });
    }
    if (!orConditions.length) {
      orConditions.push({ isBodyweight: true });
    }

    // Exclude exercise categories irrelevant to the training goal
    const excludedCategories: Exercise_category[] =
      trainingGoal === 'endurance'
        ? ['flexibility']
        : ['flexibility', 'cardio'];

    const availableExercises = await this.prisma.exercise.findMany({
      where: {
        AND: [
          { OR: orConditions },
          { category: { notIn: excludedCategories as never[] } },
        ],
      },
      include: {
        exerciseMuscles: {
          where: { role: 'primary' as never },
          include: { muscleGroup: { select: { bodyRegion: true } } },
        },
      },
      orderBy: [{ category: 'asc' }],
    });

    if (!availableExercises.length) {
      throw new BadRequestException(
        'No exercises found for your equipment and training method. Add equipment or update your profile.',
      );
    }

    const params = this.getGoalParams(trainingGoal);

    const scored = availableExercises
      .map((ex) => {
        const primaryMuscle = ex.exerciseMuscles[0];
        const primaryMuscleId = primaryMuscle?.muscleGroupId.toString();
        const priorityLevel = primaryMuscleId
          ? (priorityMap.get(primaryMuscleId) ?? 'normal')
          : 'normal';
        const hasImbalance = primaryMuscleId
          ? imbalanceSet.has(primaryMuscleId)
          : false;
        const compoundBonus = ex.category === 'compound' ? 10 : 0;
        // null means no exercise_muscles entry — region is unknown
        const bodyRegion = primaryMuscle?.muscleGroup?.bodyRegion ?? null;
        return {
          exercise: ex,
          score:
            this.getPriorityScore(priorityLevel, hasImbalance) +
            this.getDifficultyBonus(ex.difficulty, experienceLevel) +
            compoundBonus,
          bodyRegion,
          category: ex.category,
        };
      })
      .sort((a, b) => b.score - a.score);

    const planName =
      dto.name ??
      `Auto-Generated ${trainingGoal.charAt(0).toUpperCase() + trainingGoal.slice(1)} Plan`;

    const raw = await this.prisma.workoutPlan.create({
      data: {
        userId: BigInt(userId),
        createdBy: BigInt(userId),
        name: planName,
        trainingGoal: trainingGoal as never,
        daysPerWeek,
        source: 'system',
        days: {
          create: Array.from({ length: daysPerWeek }, (_, i) => {
            const {
              name: dayName,
              type: dayType,
              session,
              isRestDay,
            } = this.getDayTemplate(daysPerWeek, i);

            // Rest days carry no exercises — pure recovery
            if (isRestDay) {
              return {
                dayNumber: i + 1,
                name: dayName,
                isRestDay: true,
              };
            }

            const dayExercises = this.buildDayPool(
              scored,
              dayType,
              params.compoundCount,
              params.isolationCount,
              session,
            );
            return {
              dayNumber: i + 1,
              name: dayName,
              isRestDay: false,
              exercises: dayExercises.length
                ? {
                    create: dayExercises.map((ex, idx) => ({
                      exerciseId: ex.id,
                      sortOrder: idx + 1,
                      targetSets:
                        ex.category === 'compound'
                          ? params.targetSets
                          : params.isolationTargetSets,
                      targetRepsMin: params.targetRepsMin,
                      targetRepsMax: params.targetRepsMax,
                      targetRpe: params.targetRpe,
                      restSeconds: params.restSeconds,
                    })),
                  }
                : undefined,
            };
          }),
        },
      },
      include: PLAN_INCLUDE,
    });

    this.logger.log(
      `Generated "${planName}" for user ${userId} (${daysPerWeek} days, goal: ${trainingGoal})`,
    );
    return this.mapPlan(raw);
  }

  async coachCreate(
    coachId: number,
    targetUserId: number,
    dto: CreateWorkoutPlanDto,
  ): Promise<WorkoutPlanResponse> {
    const coach = await this.prisma.user.findUnique({
      where: { id: BigInt(coachId) },
      select: { isCoachMode: true },
    });
    if (!coach?.isCoachMode) {
      throw new BadRequestException(
        'Coach mode must be enabled to create plans for other users',
      );
    }

    const assignment = await this.prisma.coachAssignment.findFirst({
      where: {
        coachId: BigInt(coachId),
        userId: BigInt(targetUserId),
        status: 'active',
      },
    });
    if (!assignment) {
      throw new NotFoundException('User not found');
    }

    const raw = await this.prisma.workoutPlan.create({
      data: {
        userId: BigInt(targetUserId),
        createdBy: BigInt(coachId),
        name: dto.name,
        description: dto.description,
        trainingGoal: (dto.trainingGoal ?? 'general') as never,
        daysPerWeek: dto.daysPerWeek ?? 3,
        durationWeeks: dto.durationWeeks,
        startedAt: dto.startedAt ? new Date(dto.startedAt) : undefined,
        source: 'coach',
        days: dto.days?.length
          ? {
              create: dto.days.map((day) => ({
                dayNumber: day.dayNumber,
                name: day.name,
                isRestDay: day.isRestDay ?? false,
                exercises: day.exercises?.length
                  ? {
                      create: day.exercises.map((ex) => ({
                        exerciseId: BigInt(ex.exerciseId),
                        sortOrder: ex.sortOrder ?? 1,
                        targetSets: ex.targetSets ?? 3,
                        targetRepsMin: ex.targetRepsMin ?? 8,
                        targetRepsMax: ex.targetRepsMax ?? 12,
                        targetWeightKg: ex.targetWeightKg,
                        targetRpe: ex.targetRpe,
                        restSeconds: ex.restSeconds ?? 90,
                        notes: ex.notes,
                      })),
                    }
                  : undefined,
              })),
            }
          : undefined,
      },
      include: PLAN_INCLUDE,
    });

    this.logger.log(
      `Coach ${coachId} created plan "${dto.name}" for user ${targetUserId}`,
    );
    return this.mapPlan(raw);
  }

  /**
   * Infers exercise difficulty tier from how many days per week the user
   * habitually trains. Training frequency is a stronger proxy for lifting
   * experience than activity level, which reflects cardiovascular lifestyle
   * (e.g. a sedentary office worker may be an experienced powerlifter;
   * a daily runner may be a novice to resistance training).
   *
   * Thresholds:
   *   1–2 days/week → beginner   (learning movement patterns)
   *   3–4 days/week → intermediate  (established base, handles more variety)
   *   5–7 days/week → advanced   (high tolerance, benefits from advanced cues)
   */
  private getExperienceLevel(trainingDaysPerWeek: number): Exercise_difficulty {
    if (trainingDaysPerWeek <= 2) {
      return 'beginner';
    }
    if (trainingDaysPerWeek <= 4) {
      return 'intermediate';
    }
    return 'advanced';
  }

  /**
   * Converts a UserMusclePriority level + imbalance flag into a numeric score.
   * Muscles with documented imbalances receive an urgency bonus (+10) so they
   * are corrected before underdeveloped but balanced muscle groups.
   */
  private getPriorityScore(level: string, hasImbalance: boolean): number {
    const base = level === 'high' ? 40 : level === 'low' ? 5 : 20;
    return base + (hasImbalance ? 10 : 0);
  }

  /**
   * Rewards exercises that match the user's inferred experience level.
   * An exact difficulty match earns +15; adjacent levels earn +5; a two-tier
   * gap earns -5 (the exercise remains eligible but ranks lower, acting as a
   * natural safety net without hard-excluding movements the user may need).
   */
  private getDifficultyBonus(
    difficulty: Exercise_difficulty,
    userLevel: Exercise_difficulty,
  ): number {
    const levels: Exercise_difficulty[] = [
      'beginner',
      'intermediate',
      'advanced',
    ];
    const exerciseIdx = levels.indexOf(difficulty);
    const userIdx = levels.indexOf(userLevel);
    const gap = Math.abs(exerciseIdx - userIdx);
    if (gap === 0) return 15;
    if (gap === 1) return 5;
    return -5;
  }

  private mapFitnessGoalToTrainingGoal(
    fitnessGoal: UserProfile_fitnessGoal,
  ): string {
    const map: Record<UserProfile_fitnessGoal, string> = {
      gain_muscle: 'hypertrophy',
      lose_weight: 'endurance',
      maintain: 'general',
    };
    return map[fitnessGoal] ?? 'general';
  }

  private getGoalParams(trainingGoal: string): {
    // Compound exercises sets (high neural demand → own prescription)
    targetSets: number;
    // Isolation / accessory exercises sets (lower CNS cost → lower volume)
    isolationTargetSets: number;
    targetRepsMin: number;
    targetRepsMax: number;
    restSeconds: number;
    // How many compound movements per session (placed first — fatigue ordering)
    compoundCount: number;
    // How many isolation/accessory movements per session
    isolationCount: number;
    // RPE target — guides perceived effort, leaves room for progressive overload
    targetRpe: number;
    // Minimum weekly sets per muscle group across all sessions (reference only)
    setsPerMusclePerWeek: number;
  } {
    const params: Record<
      string,
      {
        targetSets: number;
        isolationTargetSets: number;
        targetRepsMin: number;
        targetRepsMax: number;
        restSeconds: number;
        compoundCount: number;
        isolationCount: number;
        targetRpe: number;
        setsPerMusclePerWeek: number;
      }
    > = {
      // Strength: max neural adaptation — low rep, near-maximal load, long rest, low total volume.
      // 3 big compounds (squat/bench/deadlift patterns) + 1 targeted accessory per session.
      // RPE 8.5 — 1-2 RIR: heavy but not to failure (prevents fatigue accumulation).
      strength: {
        targetSets: 5,
        isolationTargetSets: 3,
        targetRepsMin: 3,
        targetRepsMax: 6,
        restSeconds: 180,
        compoundCount: 3,
        isolationCount: 1,
        targetRpe: 8.5,
        setsPerMusclePerWeek: 10,
      },
      // Hypertrophy: metabolic stress + mechanical tension — moderate load, moderate rest.
      // 3 compounds + 2 isolations per session covers both mechanical and metabolic drivers.
      // RPE 7.5 — ~2-3 RIR: enough volume fatigue without compromising form.
      hypertrophy: {
        targetSets: 4,
        isolationTargetSets: 3,
        targetRepsMin: 8,
        targetRepsMax: 12,
        restSeconds: 90,
        compoundCount: 3,
        isolationCount: 2,
        targetRpe: 7.5,
        setsPerMusclePerWeek: 16,
      },
      // Endurance: high rep, short rest, high lactate tolerance — includes cardio-friendly moves.
      // 2 compounds (protect joints at high rep ranges) + 3 isolations/circuit moves.
      // RPE 6.5 — ~3-4 RIR: sustainable effort across long session durations.
      endurance: {
        targetSets: 3,
        isolationTargetSets: 2,
        targetRepsMin: 15,
        targetRepsMax: 20,
        restSeconds: 60,
        compoundCount: 2,
        isolationCount: 3,
        targetRpe: 6.5,
        setsPerMusclePerWeek: 12,
      },
      // General: balanced approach for maintenance / beginners — moderate everything.
      // 3 compounds + 2 isolations gives full-body stimulus without excessive specialisation.
      // RPE 7.0 — comfortable moderate effort; safe default for mixed-goal users.
      general: {
        targetSets: 3,
        isolationTargetSets: 2,
        targetRepsMin: 8,
        targetRepsMax: 15,
        restSeconds: 90,
        compoundCount: 3,
        isolationCount: 2,
        targetRpe: 7.0,
        setsPerMusclePerWeek: 12,
      },
    };
    return params[trainingGoal] ?? params['general'];
  }

  /**
   * Selects exercises for one training day from the scored pool.
   *
   * Structure: compounds are placed first (fatigue-ordering rule — priority muscles
   * are trained while freshest), then isolations, then one core exercise on upper
   * days (absorbed from the isolation slot to keep total volume constant).
   *
   * A/B session offsets are applied within each sub-pool independently so the same
   * muscle group receives genuinely different compound AND isolation stimulus on its
   * second weekly hit (accommodation prevention + exercise variation).
   *
   * Fallback chain: if a sub-pool is too small due to a limited catalogue, the
   * sibling pool fills the gap — the plan never comes back empty.
   */
  private buildDayPool(
    scored: {
      exercise: { id: bigint; category: Exercise_category };
      bodyRegion: string | null;
      category: Exercise_category;
    }[],
    dayType: 'upper' | 'lower' | 'full',
    compoundCount: number,
    isolationCount: number,
    session: 'A' | 'B' = 'A',
  ): { id: bigint; category: Exercise_category }[] {
    const total = compoundCount + isolationCount;

    if (dayType === 'full') {
      // Full-body: alternate compound-focused A vs accessory-focused B slice
      const offset = session === 'B' ? total : 0;
      const slice = scored.slice(offset, offset + total);
      const pool = slice.length >= total ? slice : scored.slice(0, total);
      return pool.map((s) => ({ id: s.exercise.id, category: s.category }));
    }

    // Strict region boundaries enforce split consistency:
    //   upper → upper_body only (core guaranteed via injection below)
    //   lower → lower_body + core + full_body (squats/deadlifts are tagged
    //           full_body in the catalogue but belong on lower days)
    // Opposite-region exercises are NEVER included, even as fallback.
    const strictRegions =
      dayType === 'upper'
        ? ['upper_body']
        : ['lower_body', 'core', 'full_body'];

    const primaryPool = scored.filter(
      (s) => s.bodyRegion !== null && strictRegions.includes(s.bodyRegion),
    );
    // null-region exercises (missing muscle mapping) used only when the
    // catalogue is too thin — still preferable to leaking the wrong region.
    const nullPool = scored.filter((s) => s.bodyRegion === null);
    const regionalPool =
      primaryPool.length >= total ? primaryPool : [...primaryPool, ...nullPool];

    // Split regional pool into compound and isolation sub-pools
    const compoundPool = regionalPool.filter((s) => s.category === 'compound');
    const isolationPool = regionalPool.filter((s) => s.category !== 'compound');

    const cOffset = session === 'B' ? compoundCount : 0;
    const iOffset = session === 'B' ? isolationCount : 0;

    // Core injection for upper-body days: carve out 1 isolation slot for a core
    // exercise. Lower days already include core via strictRegions.
    let coreExercise: { id: bigint; category: Exercise_category } | null = null;
    let effectiveIsolationCount = isolationCount;
    if (dayType === 'upper' && isolationCount > 0) {
      const corePool = scored.filter((s) => s.bodyRegion === 'core');
      if (corePool.length > 0) {
        const coreIdx = session === 'B' ? 1 : 0;
        const picked = corePool[coreIdx] ?? corePool[0];
        coreExercise = { id: picked.exercise.id, category: picked.category };
        effectiveIsolationCount = isolationCount - 1;
      }
    }

    // Pick compounds — fall back to isolation pool when compound catalogue is thin
    let compounds = compoundPool.slice(cOffset, cOffset + compoundCount);
    if (compounds.length < compoundCount) {
      compounds = compoundPool.slice(0, compoundCount);
    }
    if (compounds.length < compoundCount) {
      const needed = compoundCount - compounds.length;
      compounds = [...compounds, ...isolationPool.slice(0, needed)];
    }

    // Pick isolations — fall back to compound pool when isolation catalogue is thin
    let isolations: typeof isolationPool = [];
    if (effectiveIsolationCount > 0) {
      isolations = isolationPool.slice(
        iOffset,
        iOffset + effectiveIsolationCount,
      );
      if (isolations.length < effectiveIsolationCount) {
        isolations = isolationPool.slice(0, effectiveIsolationCount);
      }
      if (isolations.length < effectiveIsolationCount) {
        const remaining = effectiveIsolationCount - isolations.length;
        isolations = [
          ...isolations,
          ...compoundPool.slice(compounds.length, compounds.length + remaining),
        ];
      }
    }

    // Return compounds first (fatigue order), then isolations, then core
    const result: { id: bigint; category: Exercise_category }[] = [
      ...compounds.map((s) => ({
        id: s.exercise.id,
        category: s.category as Exercise_category,
      })),
      ...isolations.map((s) => ({
        id: s.exercise.id,
        category: s.category as Exercise_category,
      })),
    ];
    if (coreExercise) {
      result.push(coreExercise);
    }
    return result;
  }

  /**
   * Returns the science-based weekly split structure for 1–7 training days.
   *
   * Design rules applied:
   * - Every muscle group is hit ≥2×/week (minimum effective frequency)
   * - ≥48h rest between same-muscle sessions (recovery rule)
   * - A/B sessions for same type (variation across weekly hits)
   * - 5–7 day plans include at least 1 rest day to prevent overreaching
   * - Low days (1–2) use Full Body so all muscles get touched each session
   * - session field drives exercise variation in buildDayPool
   */
  private getDayTemplate(
    totalDays: number,
    dayIndex: number,
  ): {
    name: string;
    type: 'upper' | 'lower' | 'full';
    session: 'A' | 'B';
    isRestDay: boolean;
  } {
    type DayDef = {
      name: string;
      type: 'upper' | 'lower' | 'full';
      session: 'A' | 'B';
      isRestDay: boolean;
    };

    // Each template ensures:
    // - same muscle type never on back-to-back days
    // - A session before B session for same type (so A exercises appear first in pool)
    const templates: Record<number, DayDef[]> = {
      1: [{ name: 'Full Body', type: 'full', session: 'A', isRestDay: false }],
      // 2 days: Upper Mon / Lower Thu — 3 days gap = full recovery
      2: [
        { name: 'Upper Body', type: 'upper', session: 'A', isRestDay: false },
        { name: 'Lower Body', type: 'lower', session: 'A', isRestDay: false },
      ],
      // 3 days: Push / Pull / Legs — classic PPL, hits each muscle once
      // (2× frequency only achievable at 4+ days)
      3: [
        { name: 'Push', type: 'upper', session: 'A', isRestDay: false },
        { name: 'Pull', type: 'upper', session: 'B', isRestDay: false },
        { name: 'Legs', type: 'lower', session: 'A', isRestDay: false },
      ],
      // 4 days: Upper/Lower x2 — canonical 2×/week frequency split
      // Day order: Upper A, Lower A, rest, Upper B, Lower B
      // (rest day is 3rd slot — inserted as isRestDay flag)
      4: [
        { name: 'Upper A', type: 'upper', session: 'A', isRestDay: false },
        { name: 'Lower A', type: 'lower', session: 'A', isRestDay: false },
        { name: 'Upper B', type: 'upper', session: 'B', isRestDay: false },
        { name: 'Lower B', type: 'lower', session: 'B', isRestDay: false },
      ],
      // 5 days: Push/Pull/Legs then Upper+Lower — 2× for upper, ~1.5× lower
      5: [
        { name: 'Push A', type: 'upper', session: 'A', isRestDay: false },
        { name: 'Pull A', type: 'upper', session: 'B', isRestDay: false },
        { name: 'Legs A', type: 'lower', session: 'A', isRestDay: false },
        { name: 'Upper Body B', type: 'upper', session: 'A', isRestDay: false },
        { name: 'Lower Body B', type: 'lower', session: 'B', isRestDay: false },
      ],
      // 6 days: PPL x2 — full 2×/week frequency for all muscles
      // Rest day on day 4 (mid-week recovery between two PPL blocks)
      6: [
        { name: 'Push A', type: 'upper', session: 'A', isRestDay: false },
        { name: 'Pull A', type: 'upper', session: 'B', isRestDay: false },
        { name: 'Legs A', type: 'lower', session: 'A', isRestDay: false },
        { name: 'Push B', type: 'upper', session: 'A', isRestDay: false },
        { name: 'Pull B', type: 'upper', session: 'B', isRestDay: false },
        { name: 'Legs B', type: 'lower', session: 'B', isRestDay: false },
      ],
      // 7 days: PPL x2 + rest day on day 7
      7: [
        { name: 'Push A', type: 'upper', session: 'A', isRestDay: false },
        { name: 'Pull A', type: 'upper', session: 'B', isRestDay: false },
        { name: 'Legs A', type: 'lower', session: 'A', isRestDay: false },
        { name: 'Push B', type: 'upper', session: 'A', isRestDay: false },
        { name: 'Pull B', type: 'upper', session: 'B', isRestDay: false },
        { name: 'Legs B', type: 'lower', session: 'B', isRestDay: false },
        { name: 'Rest', type: 'full', session: 'A', isRestDay: true },
      ],
    };

    return (
      templates[totalDays]?.[dayIndex] ?? {
        name: `Day ${dayIndex + 1}`,
        type: 'full',
        session: 'A',
        isRestDay: false,
      }
    );
  }
}
