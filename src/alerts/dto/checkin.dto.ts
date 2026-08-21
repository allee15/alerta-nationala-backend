import { IsISO8601 } from 'class-validator';

export class CheckInDto {
  @IsISO8601()
  clientTimestamp!: string;
}