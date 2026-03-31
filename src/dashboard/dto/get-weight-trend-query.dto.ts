import { IsOptional, IsIn } from 'class-validator';

export class GetWeightTrendQueryDto {
  @IsOptional()
  @IsIn(['week', 'month', '3months'])
  period?: 'week' | 'month' | '3months' = 'month';
}
