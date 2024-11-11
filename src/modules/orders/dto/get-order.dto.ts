import { IsUUID } from 'class-validator';

export class GetOrderDto {
  @IsUUID(4)
  readonly orderUUID!: string;
}
