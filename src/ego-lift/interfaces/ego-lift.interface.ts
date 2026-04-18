/**
 * Shape of the current WorkoutSet passed into analyzeSet().
 * Cross-module contract: workout-log.service constructs objects
 * matching this shape when calling EgoLiftService.analyzeSet().
 */
export interface CurrentSetInput {
  id: bigint;
  exerciseId: bigint;
  workoutSessionId: bigint;
  reps: number;
  weightKg: { toNumber(): number } | null;
}

/**
 * Valid training goals used by the ego-lift detection algorithm.
 */
export type TrainingGoal = 'strength' | 'hypertrophy' | 'endurance';

/**
 * Weight-increase and rep-drop thresholds for a specific training goal.
 */
export interface ThresholdRule {
  weightIncreaseMin: number;
  repDropMin: number;
}
