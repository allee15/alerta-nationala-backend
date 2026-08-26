import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateAssemblyPointDto {
  @IsString()
  name!: string;

  @IsString()
  address!: string;

  @IsNumber()
  lat!: number;

  @IsNumber()
  lng!: number;

  @IsString()
  zone!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  capacity?: number;
}