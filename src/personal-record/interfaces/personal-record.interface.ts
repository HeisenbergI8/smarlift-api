/**
 * Shape of a WorkoutSet passed into evaluateAndUpdateRecords().
 * Used by workout-log.service when calling the personal-record service
 * after logging a set, so the contract is explicit across modules.
 */
export interface WorkoutSetInput {
  id: bigint;
  exerciseId: bigint;
  reps: number;
  weightKg: { toNumber(): number } | null;
  performedAt: Date;
}
