/**
 * Authentication-related types and DTOs
 */
export interface RegisterDto {
    email: string;
    username: string;
    password: string;
    name?: string;
}
export interface LoginDto {
    email: string;
    password: string;
}
export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
        username: string;
        name: string | null;
    };
}
export interface RefreshTokenDto {
    refreshToken: string;
}
//# sourceMappingURL=auth.types.d.ts.map