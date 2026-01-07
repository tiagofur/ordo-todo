import { PartialType } from '@nestjs/mapped-types';
import { CreateKBCategoryDto } from './create-category.dto';

export class UpdateKBCategoryDto extends PartialType(CreateKBCategoryDto) { }
