import { NutritionRecommendation_source } from '@prisma/client';

// ── KPI Snapshot ──────────────────────────────────────────────────────────────

export interface KpiSnapshotResponse {
  id: number;
  userId: number;
  snapshotDate: Date;
  bodyWeightKg: number | null;
  totalSessionsWeek: number | null;
  plannedSessionsWeek: number | null;
  consistencyScore: number | null;
  strengthIndex: number | null;
  weeklyStreak: number;
  createdAt: Date;
}

export interface KpiSnapshotListResponse {
  data: KpiSnapshotResponse[];
  total: number;
  page: number;
  limit: number;
}

// ── Overview ──────────────────────────────────────────────────────────────────

export interface LatestWeightSummary {
  weightKg: number;
  logDate: Date;
}

export interface ActivePlanSummary {
  id: number;
  name: string;
  daysPerWeek: number;
}

export interface NutritionRecommendationResponse {
  id: number;
  userId: number;
  source: NutritionRecommendation_source;
  dailyCaloriesKcal: number;
  proteinG: number;
  carbohydratesG: number;
  fatsG: number;
  isActive: boolean;
  effectiveFrom: Date;
  effectiveTo: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardOverviewResponse {
  latestWeight: LatestWeightSummary | null;
  latestSnapshot: KpiSnapshotResponse | null;
  activeRecommendation: NutritionRecommendationResponse | null;
  activePlan: ActivePlanSummary | null;
  unreadNotifications: number;
  activeEgoAlerts: number;
}

// ── Strength Progress ─────────────────────────────────────────────────────────

export interface StrengthRecordItem {
  exerciseId: number;
  exerciseName: string;
  currentMaxWeightKg: number;
  achievedAt: Date;
}

export interface StrengthProgressResponse {
  records: StrengthRecordItem[];
}

// ── Weight Trend ──────────────────────────────────────────────────────────────

export interface WeightTrendEntry {
  logDate: Date;
  weightKg: number;
}

export interface WeightTrendResponse {
  entries: WeightTrendEntry[];
  startWeight: number | null;
  endWeight: number | null;
  changeKg: number;
  changePct: number;
}

// ── Workout Consistency ───────────────────────────────────────────────────────

export interface WeeklyConsistencyItem {
  weekStart: Date;
  planned: number;
  completed: number;
  consistencyPct: number;
}

export interface WorkoutConsistencyResponse {
  weeks: WeeklyConsistencyItem[];
  overallConsistencyPct: number;
  currentStreak: number;
}

// ── Nutrition Adherence ───────────────────────────────────────────────────────

export interface NutritionAdherenceEntry {
  date: Date;
  loggedCaloriesKcal: number;
  targetCaloriesKcal: number;
  adherencePct: number;
}

export interface NutritionAdherenceResponse {
  entries: NutritionAdherenceEntry[];
  avgAdherencePct: number;
}
