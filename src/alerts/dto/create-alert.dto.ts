import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsISO8601,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { AlertSeverity, AlertType } from '../schemas/alert.schema';

export class CreateAlertDto {
  @IsEnum(AlertType)
  type!: AlertType;

  @IsEnum(AlertSeverity)
  severity!: AlertSeverity;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  message!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  zones!: string[];

  @IsOptional()
  @IsISO8601()
  startsAt?: string;

  @IsISO8601()
  endsAt!: string;
}