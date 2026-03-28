-- CreateTable
CREATE TABLE `roles` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `description` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `roles_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `role_id` BIGINT UNSIGNED NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `is_coach_mode` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `email_verified` BOOLEAN NOT NULL DEFAULT false,
    `last_login_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_profiles` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `height_cm` DECIMAL(5, 1) NULL,
    `weight_kg` DECIMAL(5, 1) NULL,
    `age` TINYINT UNSIGNED NULL,
    `gender` ENUM('male', 'female', 'other') NULL,
    `fitness_goal` ENUM('lose_weight', 'gain_muscle', 'maintain') NULL,
    `activity_level` ENUM('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active') NULL,
    `training_method` ENUM('weight_training', 'bodyweight', 'hybrid') NOT NULL DEFAULT 'hybrid',
    `training_days_per_week` TINYINT UNSIGNED NOT NULL DEFAULT 3,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_profiles_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `coach_assignments` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `coach_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `status` ENUM('active', 'paused', 'ended') NOT NULL DEFAULT 'active',
    `assigned_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ended_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `coach_assignments_coach_id_user_id_status_key`(`coach_id`, `user_id`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `equipment` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `equipment_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_equipment` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `equipment_id` BIGINT UNSIGNED NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `user_equipment_user_id_equipment_id_key`(`user_id`, `equipment_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `muscle_groups` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `body_region` ENUM('upper_body', 'lower_body', 'core', 'full_body') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `muscle_groups_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exercises` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,
    `description` TEXT NULL,
    `category` ENUM('compound', 'isolation', 'cardio', 'flexibility') NOT NULL DEFAULT 'compound',
    `difficulty` ENUM('beginner', 'intermediate', 'advanced') NOT NULL DEFAULT 'beginner',
    `is_bodyweight` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `exercises_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exercise_muscles` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `exercise_id` BIGINT UNSIGNED NOT NULL,
    `muscle_group_id` BIGINT UNSIGNED NOT NULL,
    `role` ENUM('primary', 'secondary') NOT NULL DEFAULT 'primary',

    INDEX `exercise_muscles_muscle_group_id_idx`(`muscle_group_id`),
    UNIQUE INDEX `exercise_muscles_exercise_id_muscle_group_id_key`(`exercise_id`, `muscle_group_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exercise_equipment` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `exercise_id` BIGINT UNSIGNED NOT NULL,
    `equipment_id` BIGINT UNSIGNED NOT NULL,

    INDEX `exercise_equipment_equipment_id_idx`(`equipment_id`),
    UNIQUE INDEX `exercise_equipment_exercise_id_equipment_id_key`(`exercise_id`, `equipment_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_muscle_priorities` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `muscle_group_id` BIGINT UNSIGNED NOT NULL,
    `priority_level` ENUM('low', 'normal', 'high') NOT NULL DEFAULT 'normal',
    `has_imbalance` BOOLEAN NOT NULL DEFAULT false,
    `notes` VARCHAR(500) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_muscle_priorities_user_id_muscle_group_id_key`(`user_id`, `muscle_group_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workout_plans` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `created_by` BIGINT UNSIGNED NULL,
    `name` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `training_goal` ENUM('strength', 'hypertrophy', 'endurance', 'general') NOT NULL DEFAULT 'general',
    `days_per_week` TINYINT UNSIGNED NOT NULL DEFAULT 3,
    `duration_weeks` TINYINT UNSIGNED NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `source` ENUM('system', 'coach', 'user') NOT NULL DEFAULT 'system',
    `started_at` DATE NULL,
    `ended_at` DATE NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `workout_plans_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workout_plan_days` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `workout_plan_id` BIGINT UNSIGNED NOT NULL,
    `day_number` TINYINT UNSIGNED NOT NULL,
    `name` VARCHAR(100) NULL,
    `is_rest_day` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `workout_plan_days_workout_plan_id_day_number_key`(`workout_plan_id`, `day_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workout_plan_exercises` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `workout_plan_day_id` BIGINT UNSIGNED NOT NULL,
    `exercise_id` BIGINT UNSIGNED NOT NULL,
    `sort_order` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `target_sets` TINYINT UNSIGNED NOT NULL DEFAULT 3,
    `target_reps_min` TINYINT UNSIGNED NOT NULL DEFAULT 8,
    `target_reps_max` TINYINT UNSIGNED NOT NULL DEFAULT 12,
    `target_weight_kg` DECIMAL(6, 2) NULL,
    `target_rpe` DECIMAL(3, 1) NULL,
    `rest_seconds` SMALLINT UNSIGNED NOT NULL DEFAULT 90,
    `notes` VARCHAR(500) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `workout_plan_exercises_workout_plan_day_id_idx`(`workout_plan_day_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workout_sessions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `workout_plan_day_id` BIGINT UNSIGNED NULL,
    `status` ENUM('in_progress', 'completed', 'skipped') NOT NULL DEFAULT 'in_progress',
    `started_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completed_at` DATETIME(3) NULL,
    `duration_minutes` SMALLINT UNSIGNED NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `workout_sessions_user_id_idx`(`user_id`),
    INDEX `workout_sessions_started_at_idx`(`started_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workout_sets` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `workout_session_id` BIGINT UNSIGNED NOT NULL,
    `exercise_id` BIGINT UNSIGNED NOT NULL,
    `set_number` TINYINT UNSIGNED NOT NULL,
    `reps` TINYINT UNSIGNED NOT NULL,
    `weight_kg` DECIMAL(6, 2) NULL,
    `rpe` DECIMAL(3, 1) NULL,
    `is_warmup` BOOLEAN NOT NULL DEFAULT false,
    `notes` VARCHAR(500) NULL,
    `performed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `workout_sets_workout_session_id_idx`(`workout_session_id`),
    INDEX `workout_sets_exercise_id_idx`(`exercise_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `progression_settings` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `is_enabled` BOOLEAN NOT NULL DEFAULT true,
    `progression_frequency` ENUM('weekly', 'biweekly', 'monthly') NOT NULL DEFAULT 'weekly',
    `training_goal` ENUM('strength', 'hypertrophy', 'endurance') NOT NULL DEFAULT 'hypertrophy',
    `weight_increment_kg` DECIMAL(4, 2) NOT NULL DEFAULT 2.50,
    `max_reps_before_increase` TINYINT UNSIGNED NOT NULL DEFAULT 12,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `progression_settings_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `progression_history` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `exercise_id` BIGINT UNSIGNED NOT NULL,
    `adjustment_type` ENUM('weight_increase', 'weight_decrease', 'reps_increase', 'sets_increase', 'deload') NOT NULL,
    `previous_value` DECIMAL(6, 2) NOT NULL,
    `new_value` DECIMAL(6, 2) NOT NULL,
    `reason` VARCHAR(500) NULL,
    `source` ENUM('system', 'coach') NOT NULL DEFAULT 'system',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `progression_history_user_id_idx`(`user_id`),
    INDEX `progression_history_exercise_id_idx`(`exercise_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ego_lift_alerts` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `exercise_id` BIGINT UNSIGNED NOT NULL,
    `workout_set_id` BIGINT UNSIGNED NULL,
    `severity` ENUM('info', 'warning', 'critical') NOT NULL DEFAULT 'warning',
    `message` VARCHAR(500) NOT NULL,
    `previous_weight_kg` DECIMAL(6, 2) NOT NULL,
    `flagged_weight_kg` DECIMAL(6, 2) NOT NULL,
    `previous_reps` TINYINT UNSIGNED NOT NULL,
    `flagged_reps` TINYINT UNSIGNED NOT NULL,
    `training_goal` ENUM('strength', 'hypertrophy', 'endurance') NOT NULL,
    `is_dismissed` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ego_lift_alerts_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nutrition_recommendations` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `source` ENUM('system', 'coach') NOT NULL DEFAULT 'system',
    `created_by` BIGINT UNSIGNED NULL,
    `daily_calories_kcal` SMALLINT UNSIGNED NOT NULL,
    `protein_g` SMALLINT UNSIGNED NOT NULL,
    `carbohydrates_g` SMALLINT UNSIGNED NOT NULL,
    `fats_g` SMALLINT UNSIGNED NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `effective_from` DATE NOT NULL,
    `effective_to` DATE NULL,
    `notes` VARCHAR(500) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `nutrition_recommendations_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `daily_nutrition_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `log_date` DATE NOT NULL,
    `total_calories_kcal` SMALLINT UNSIGNED NULL,
    `protein_g` SMALLINT UNSIGNED NULL,
    `carbohydrates_g` SMALLINT UNSIGNED NULL,
    `fats_g` SMALLINT UNSIGNED NULL,
    `notes` VARCHAR(500) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `daily_nutrition_logs_user_id_log_date_key`(`user_id`, `log_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `body_weight_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `log_date` DATE NOT NULL,
    `weight_kg` DECIMAL(5, 1) NOT NULL,
    `source` ENUM('manual', 'smart_scale', 'coach') NOT NULL DEFAULT 'manual',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `body_weight_logs_user_id_log_date_idx`(`user_id`, `log_date`),
    UNIQUE INDEX `body_weight_logs_user_id_log_date_key`(`user_id`, `log_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nutrition_adjustments` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `nutrition_recommendation_id` BIGINT UNSIGNED NOT NULL,
    `trigger_reason` ENUM('plateau_detected', 'weight_trend', 'goal_change', 'coach_override') NOT NULL,
    `previous_calories_kcal` SMALLINT UNSIGNED NOT NULL,
    `new_calories_kcal` SMALLINT UNSIGNED NOT NULL,
    `previous_protein_g` SMALLINT UNSIGNED NULL,
    `new_protein_g` SMALLINT UNSIGNED NULL,
    `previous_carbohydrates_g` SMALLINT UNSIGNED NULL,
    `new_carbohydrates_g` SMALLINT UNSIGNED NULL,
    `previous_fats_g` SMALLINT UNSIGNED NULL,
    `new_fats_g` SMALLINT UNSIGNED NULL,
    `weekly_avg_weight_kg` DECIMAL(5, 1) NULL,
    `notes` VARCHAR(500) NULL,
    `source` ENUM('system', 'coach') NOT NULL DEFAULT 'system',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `nutrition_adjustments_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kpi_snapshots` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `snapshot_date` DATE NOT NULL,
    `body_weight_kg` DECIMAL(5, 1) NULL,
    `total_sessions_week` TINYINT UNSIGNED NULL,
    `planned_sessions_week` TINYINT UNSIGNED NULL,
    `consistency_score` DECIMAL(5, 2) NULL,
    `strength_index` DECIMAL(8, 2) NULL,
    `weekly_streak` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `kpi_snapshots_user_id_snapshot_date_key`(`user_id`, `snapshot_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `milestones` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,
    `description` VARCHAR(500) NULL,
    `category` ENUM('strength', 'consistency', 'weight', 'nutrition', 'general') NOT NULL,
    `criteria_json` JSON NULL,
    `icon_url` VARCHAR(500) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `milestones_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_milestones` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `milestone_id` BIGINT UNSIGNED NOT NULL,
    `achieved_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `user_milestones_user_id_milestone_id_key`(`user_id`, `milestone_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `personal_records` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `exercise_id` BIGINT UNSIGNED NOT NULL,
    `record_type` ENUM('max_weight', 'max_reps', 'max_volume') NOT NULL,
    `value` DECIMAL(8, 2) NOT NULL,
    `achieved_at` DATE NOT NULL,
    `workout_set_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `personal_records_user_id_exercise_id_record_type_key`(`user_id`, `exercise_id`, `record_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `type` ENUM('workout_reminder', 'missed_session', 'nutrition_reminder', 'ego_lift_warning', 'progression_update', 'milestone', 'general') NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `message` TEXT NOT NULL,
    `reference_type` VARCHAR(50) NULL,
    `reference_id` BIGINT UNSIGNED NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `read_at` DATETIME(3) NULL,
    `scheduled_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notifications_user_id_idx`(`user_id`),
    INDEX `notifications_user_id_is_read_idx`(`user_id`, `is_read`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification_preferences` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `type` ENUM('workout_reminder', 'missed_session', 'nutrition_reminder', 'ego_lift_warning', 'progression_update', 'milestone', 'general') NOT NULL,
    `is_enabled` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `notification_preferences_user_id_type_key`(`user_id`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `coach_overrides` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `coach_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `override_type` ENUM('PLAN', 'EXERCISE', 'SET', 'PROGRESSION', 'NUTRITION') NOT NULL,
    `reference_type` VARCHAR(50) NOT NULL,
    `reference_id` BIGINT UNSIGNED NOT NULL,
    `reason` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `coach_overrides_coach_id_idx`(`coach_id`),
    INDEX `coach_overrides_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_profiles` ADD CONSTRAINT `user_profiles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `coach_assignments` ADD CONSTRAINT `coach_assignments_coach_id_fkey` FOREIGN KEY (`coach_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `coach_assignments` ADD CONSTRAINT `coach_assignments_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_equipment` ADD CONSTRAINT `user_equipment_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_equipment` ADD CONSTRAINT `user_equipment_equipment_id_fkey` FOREIGN KEY (`equipment_id`) REFERENCES `equipment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exercise_muscles` ADD CONSTRAINT `exercise_muscles_exercise_id_fkey` FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exercise_muscles` ADD CONSTRAINT `exercise_muscles_muscle_group_id_fkey` FOREIGN KEY (`muscle_group_id`) REFERENCES `muscle_groups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exercise_equipment` ADD CONSTRAINT `exercise_equipment_exercise_id_fkey` FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exercise_equipment` ADD CONSTRAINT `exercise_equipment_equipment_id_fkey` FOREIGN KEY (`equipment_id`) REFERENCES `equipment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_muscle_priorities` ADD CONSTRAINT `user_muscle_priorities_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_muscle_priorities` ADD CONSTRAINT `user_muscle_priorities_muscle_group_id_fkey` FOREIGN KEY (`muscle_group_id`) REFERENCES `muscle_groups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workout_plans` ADD CONSTRAINT `workout_plans_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workout_plans` ADD CONSTRAINT `workout_plans_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workout_plan_days` ADD CONSTRAINT `workout_plan_days_workout_plan_id_fkey` FOREIGN KEY (`workout_plan_id`) REFERENCES `workout_plans`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workout_plan_exercises` ADD CONSTRAINT `workout_plan_exercises_workout_plan_day_id_fkey` FOREIGN KEY (`workout_plan_day_id`) REFERENCES `workout_plan_days`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workout_plan_exercises` ADD CONSTRAINT `workout_plan_exercises_exercise_id_fkey` FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workout_sessions` ADD CONSTRAINT `workout_sessions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workout_sessions` ADD CONSTRAINT `workout_sessions_workout_plan_day_id_fkey` FOREIGN KEY (`workout_plan_day_id`) REFERENCES `workout_plan_days`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workout_sets` ADD CONSTRAINT `workout_sets_workout_session_id_fkey` FOREIGN KEY (`workout_session_id`) REFERENCES `workout_sessions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workout_sets` ADD CONSTRAINT `workout_sets_exercise_id_fkey` FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `progression_settings` ADD CONSTRAINT `progression_settings_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `progression_history` ADD CONSTRAINT `progression_history_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `progression_history` ADD CONSTRAINT `progression_history_exercise_id_fkey` FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ego_lift_alerts` ADD CONSTRAINT `ego_lift_alerts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ego_lift_alerts` ADD CONSTRAINT `ego_lift_alerts_exercise_id_fkey` FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ego_lift_alerts` ADD CONSTRAINT `ego_lift_alerts_workout_set_id_fkey` FOREIGN KEY (`workout_set_id`) REFERENCES `workout_sets`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nutrition_recommendations` ADD CONSTRAINT `nutrition_recommendations_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nutrition_recommendations` ADD CONSTRAINT `nutrition_recommendations_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `daily_nutrition_logs` ADD CONSTRAINT `daily_nutrition_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `body_weight_logs` ADD CONSTRAINT `body_weight_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nutrition_adjustments` ADD CONSTRAINT `nutrition_adjustments_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nutrition_adjustments` ADD CONSTRAINT `nutrition_adjustments_nutrition_recommendation_id_fkey` FOREIGN KEY (`nutrition_recommendation_id`) REFERENCES `nutrition_recommendations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kpi_snapshots` ADD CONSTRAINT `kpi_snapshots_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_milestones` ADD CONSTRAINT `user_milestones_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_milestones` ADD CONSTRAINT `user_milestones_milestone_id_fkey` FOREIGN KEY (`milestone_id`) REFERENCES `milestones`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `personal_records` ADD CONSTRAINT `personal_records_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `personal_records` ADD CONSTRAINT `personal_records_exercise_id_fkey` FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `personal_records` ADD CONSTRAINT `personal_records_workout_set_id_fkey` FOREIGN KEY (`workout_set_id`) REFERENCES `workout_sets`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification_preferences` ADD CONSTRAINT `notification_preferences_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `coach_overrides` ADD CONSTRAINT `coach_overrides_coach_id_fkey` FOREIGN KEY (`coach_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `coach_overrides` ADD CONSTRAINT `coach_overrides_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

