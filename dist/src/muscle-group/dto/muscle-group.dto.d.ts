import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
export declare enum BodyRegion {
    UPPER_BODY = "upper_body",
    LOWER_BODY = "lower_body",
    CORE = "core",
    FULL_BODY = "full_body"
}
export declare class FindMuscleGroupsQueryDto extends PaginationQueryDto {
    bodyRegion?: BodyRegion;
}
export declare class CreateMuscleGroupDto {
    name: string;
    bodyRegion: BodyRegion;
}
export declare class UpdateMuscleGroupDto {
    name?: string;
    bodyRegion?: BodyRegion;
}
