export declare enum BodyWeightSource {
    MANUAL = "manual",
    SMART_SCALE = "smart_scale"
}
export declare class LogBodyWeightDto {
    logDate: string;
    weightKg: number;
    source?: BodyWeightSource;
}
