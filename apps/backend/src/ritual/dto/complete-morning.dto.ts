import { ArrayMaxSize, ArrayMinSize, IsArray, IsString } from 'class-validator';

export class CompleteMorningDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  @IsString({ each: true })
  top3: string[];
}
