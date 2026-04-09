export interface AuthUserResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isCoachMode: boolean;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUserResponse;
}

export interface MeResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isCoachMode: boolean;
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  role: string;
}
