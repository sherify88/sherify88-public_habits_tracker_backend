import { Type } from '@nestjs/class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, Min } from '@nestjs/class-validator';
import { ApiHideProperty } from '@nestjs/swagger';
import { SortOrder } from 'src/utils/enums';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  loadAll? = false;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: string = SortOrder.DESC;

  @IsOptional()
  @ApiHideProperty()
  route?: string;
}
