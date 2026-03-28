import { IsArray, IsInt, ArrayMinSize } from 'class-validator';

export class SyncEquipmentDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  equipmentIds: number[];
}
