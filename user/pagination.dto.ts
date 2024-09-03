import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

enum SortBy {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

class PaginationDto {
  totalRecords: number;
  currentPage: number;
  totalPages: number;
  nextPage: number | null;
  previousPage: number | null;
  pageSize: number;
}

export class PaginationQueryDto {
  @ApiProperty({
    description: 'Page number',
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiProperty({
    description: 'Limit per page',
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1_000)
  limit = 20;

  @ApiProperty({
    description: 'Sort by',
    default: 'updatedAt',
    required: false,
    enum: SortBy,
  })
  @IsEnum(SortBy)
  @IsOptional()
  sortBy = 'updatedAt';

  @ApiProperty({
    description: 'Sort order',
    default: 'DESC',
    required: false,
    enum: SortOrder,
  })
  @IsEnum(SortOrder)
  @IsOptional()
  sortOrder = 'DESC';

  @ApiProperty({
    description: 'Search',
    required: false,
  })
  @IsString()
  @MinLength(3)
  @Transform(({ value }) => value.trim())
  @IsOptional()
  search: string;

  @ApiProperty({
    required: false,
  })
  @IsDateString()
  @IsOptional()
  fromDate: string;

  @ApiProperty({
    required: false,
  })
  @IsDateString()
  @IsOptional()
  toDate: string;
}

export class PaginationResponseDto {
  @ApiProperty({
    description: 'Pagination data',
    type: PaginationDto,
  })
  @Type(() => PaginationDto)
  pagination: PaginationDto;
}
