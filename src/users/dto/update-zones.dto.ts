import { ArrayMinSize, IsArray, IsString } from 'class-validator';

export class UpdateZonesDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  zones!: string[];
}