import { IsEnum } from 'class-validator';
import { PaginationDto } from 'lib/dto';
import { OrderStatus } from 'lib/types';

export class GetOrdersDto extends PaginationDto {
  @IsEnum(OrderStatus)
  readonly orderStatus?: OrderStatus;
}
