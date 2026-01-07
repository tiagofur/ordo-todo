import { PartialType } from '@nestjs/mapped-types';
import { CreateKBArticleDto } from './create-article.dto';

export class UpdateKBArticleDto extends PartialType(CreateKBArticleDto) { }
