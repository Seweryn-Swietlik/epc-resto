import { OrderStatus } from 'lib/types';

export type OrderDetails = {
  orderUUID: string;
};

export type JobData = {
  orderUUID: string;
};

export type Meal = {
  mealId: number;
  mealUUID: string;
  mealName: string;
  price: number;
  categoryId: number;
};

export type Order = {
  orderUUID: string;
  orderItems: Array<OrderItem>;
  status: OrderStatus;
};

type OrderItem = {
  mealUUID: string;
  mealName: string;
  categoryName: string;
  quantity: number;
};
