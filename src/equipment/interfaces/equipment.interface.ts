export interface EquipmentResponse {
  id: number;
  name: string;
  description: string | null;
  createdAt: Date;
}

export interface UserEquipmentResponse {
  id: number;
  userId: number;
  equipmentId: number;
  createdAt: Date;
  equipment: EquipmentResponse;
}

export interface PaginatedEquipmentResponse {
  data: EquipmentResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface PaginatedUserEquipmentResponse {
  data: UserEquipmentResponse[];
  total: number;
  page: number;
  limit: number;
}
