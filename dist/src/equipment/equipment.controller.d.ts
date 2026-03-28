import { EquipmentService } from './equipment.service';
import { SyncEquipmentDto, FindEquipmentQueryDto, CreateEquipmentDto, UpdateEquipmentDto } from './dto';
export declare class EquipmentController {
    private readonly equipmentService;
    constructor(equipmentService: EquipmentService);
    findAll(query: FindEquipmentQueryDto): Promise<{
        data: {
            name: string;
            description: string | null;
            id: bigint;
            createdAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    getUserEquipment(userId: number, query: FindEquipmentQueryDto): Promise<{
        data: ({
            equipment: {
                name: string;
                description: string | null;
                id: bigint;
                createdAt: Date;
            };
        } & {
            id: bigint;
            createdAt: Date;
            userId: bigint;
            equipmentId: bigint;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    syncUserEquipment(userId: number, dto: SyncEquipmentDto): Promise<{
        data: ({
            equipment: {
                name: string;
                description: string | null;
                id: bigint;
                createdAt: Date;
            };
        } & {
            id: bigint;
            createdAt: Date;
            userId: bigint;
            equipmentId: bigint;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    create(dto: CreateEquipmentDto): Promise<{
        name: string;
        description: string | null;
        id: bigint;
        createdAt: Date;
    }>;
    update(id: number, dto: UpdateEquipmentDto): Promise<{
        name: string;
        description: string | null;
        id: bigint;
        createdAt: Date;
    }>;
    remove(id: number): Promise<void>;
}
