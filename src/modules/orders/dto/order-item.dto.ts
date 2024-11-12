import { IsInt, IsPositive, IsUUID } from 'class-validator';

export class OrderItemDto {
  @IsPositive()
  @IsInt()
  readonly quantity: number;

  @IsUUID()
  readonly mealUUID: string;
}
