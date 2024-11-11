import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'lib/dto';

export class GetMealsDto extends PaginationDto {
  @IsOptional()
  @IsString()
  readonly categoryName?: string;
}
