import { IsString, IsEmail, IsEnum, IsOptional } from 'class-validator';

export class InviteMemberDto {
    @IsEmail()
    email: string;

    @IsEnum(['ADMIN', 'MEMBER', 'VIEWER'])
    @IsOptional()
    role?: 'ADMIN' | 'MEMBER' | 'VIEWER';
}
