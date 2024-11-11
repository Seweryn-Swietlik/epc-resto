import { IsInt, IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  readonly limit: number = 25;

  @IsOptional()
  @IsInt()
  @Min(0)
  readonly offset: number = 0;
}
