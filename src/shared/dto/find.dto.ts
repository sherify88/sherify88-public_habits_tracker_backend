import { IsOptional, IsString } from '@nestjs/class-validator';
import { PaginationDto } from './pagination.dto';
import { Transform } from '@nestjs/class-transformer';

export class FindDto extends PaginationDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.toString().trim().toLowerCase())
  query?: string;
}
