import {
  IsString,
  IsBoolean,
  IsOptional,
  IsArray,
  IsInt,
  IsUrl,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({
    example: 'my-first-blog-post',
    description: 'Unique slug for the blog post',
  })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({
    example: 'My First Blog Post',
    description: 'Title of the blog post',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    example: 'This is a summary of the post...',
    description: 'Short excerpt',
  })
  @IsOptional()
  @IsString()
  excerpt?: string;

  @ApiProperty({
    example: '# Hello World\nThis is the content...',
    description: 'Main content in Markdown or HTML',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    example: 'https://example.com/image.jpg',
    description: 'Cover image URL',
  })
  @IsOptional()
  @IsUrl()
  coverImage?: string;

  @ApiPropertyOptional({
    default: false,
    description: 'Whether the post is published',
  })
  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @ApiPropertyOptional({
    example: 'SEO Title',
    description: 'Meta title for SEO',
  })
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @ApiPropertyOptional({
    example: 'SEO Description',
    description: 'Meta description for SEO',
  })
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @ApiPropertyOptional({ example: 'John Doe', description: 'Author name' })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiPropertyOptional({ example: 'Technology', description: 'Category name' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: ['tech', 'news'], description: 'Tags' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    example: 5,
    description: 'Estimated read time in minutes',
  })
  @IsOptional()
  @IsInt()
  readTime?: number;
}
