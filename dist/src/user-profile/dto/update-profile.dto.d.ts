export declare enum Gender {
    MALE = "male",
    FEMALE = "female",
    OTHER = "other"
}
export declare enum FitnessGoal {
    LOSE_WEIGHT = "lose_weight",
    GAIN_MUSCLE = "gain_muscle",
    MAINTAIN = "maintain"
}
export declare enum ActivityLevel {
    SEDENTARY = "sedentary",
    LIGHTLY_ACTIVE = "lightly_active",
    MODERATELY_ACTIVE = "moderately_active",
    VERY_ACTIVE = "very_active",
    EXTRA_ACTIVE = "extra_active"
}
export declare enum TrainingMethod {
    WEIGHT_TRAINING = "weight_training",
    BODYWEIGHT = "bodyweight",
    HYBRID = "hybrid"
}
export declare class UpdateProfileDto {
    heightCm?: number;
    weightKg?: number;
    age?: number;
    gender?: Gender;
    fitnessGoal?: FitnessGoal;
    activityLevel?: ActivityLevel;
    trainingMethod?: TrainingMethod;
    trainingDaysPerWeek?: number;
}
