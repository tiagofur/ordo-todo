import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateKBArticleDto {
    @IsString()
    @IsNotEmpty()
    slug: string;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsString()
    @IsOptional()
    excerpt?: string;

    @IsString()
    @IsNotEmpty()
    categoryId: string;

    @IsBoolean()
    @IsOptional()
    published?: boolean;
}
