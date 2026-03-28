export declare enum AccountType {
    USER = "user",
    COACH = "coach"
}
export declare class RegisterDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    isCoachMode?: boolean;
    accountType?: AccountType;
}
