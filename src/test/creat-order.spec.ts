import { EntityTarget, DataSource } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrderEntity, OrderItemEntity } from '../lib/entities';
import { CreateOrderDto } from '../modules/orders/dto';
import { OrdersService } from '../modules/orders/orders.service';
import { MealsService } from '../modules/meals/meals.service';

describe('OrderService', () => {
  const mockMealsService = {
    findMealsByUUID: jest.fn(),
  };

  const mockOrderRepository = {
    save: jest.fn(),
  };

  const mockOrderItemRepository = {
    insert: jest.fn(),
  };

  const mockQueryRunner = {
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      getRepository: (entity: EntityTarget<OrderEntity | OrderItemEntity>) => {
        return entity === OrderEntity
          ? mockOrderRepository
          : mockOrderItemRepository;
      },
    },
  };

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
  };
  const createTestingModule = async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: MealsService, useValue: mockMealsService },
        {
          provide: getRepositoryToken(OrderEntity),
          useValue: mockOrderRepository,
        },
        {
          provide: getRepositoryToken(OrderItemEntity),
          useValue: mockOrderItemRepository,
        },
        { provide: DataSource, useValue: mockDataSource }, // Add this line
      ],
    }).compile();

    return module.get<OrdersService>(OrdersService);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create an order successfully', async () => {
    const createOrderDto: CreateOrderDto = {
      orderItems: [
        { mealUUID: 'ca2d92cb-11de-4634-9bd6-46d2f2741f9a', quantity: 2 },
        { mealUUID: 'fdd85835-0ffd-4c42-a64f-302edaa83bcf', quantity: 1 },
      ],
    };

    const meals = [
      {
        mealUUID: 'ca2d92cb-11de-4634-9bd6-46d2f2741f9a',
        mealId: 1,
        price: 10,
      },
      {
        mealUUID: 'fdd85835-0ffd-4c42-a64f-302edaa83bcf',
        mealId: 2,
        price: 15,
      },
    ];

    const savedOrder = { orderId: 1, orderUUID: 'order-uuid' };

    mockMealsService.findMealsByUUID.mockResolvedValue(meals);
    mockOrderRepository.save.mockResolvedValue(savedOrder);

    const orderService = await createTestingModule();
    const result = await orderService.createOrder(createOrderDto);

    expect(mockMealsService.findMealsByUUID).toHaveBeenCalledWith([
      'ca2d92cb-11de-4634-9bd6-46d2f2741f9a',
      'fdd85835-0ffd-4c42-a64f-302edaa83bcf',
    ]);
    expect(mockOrderRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ totalPrice: 35 }),
    );
    expect(mockOrderItemRepository.insert).toHaveBeenCalledWith([
      { orderId: 1, mealId: 1, quantity: 2 },
      { orderId: 1, mealId: 2, quantity: 1 },
    ]);
    expect(result).toEqual({ orderUUID: 'order-uuid' });
    expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
  });

  it('should throw BadRequestException if meal not found', async () => {
    const createOrderDto: CreateOrderDto = {
      orderItems: [
        { mealUUID: 'ca2d92cb-11de-4634-9bd6-46d2f2741f9a', quantity: 2 },
      ],
    };

    mockMealsService.findMealsByUUID.mockResolvedValue([]); // No meals found

    const orderService = await createTestingModule();

    await expect(orderService.createOrder(createOrderDto)).rejects.toThrow(
      BadRequestException,
    );
    expect(mockQueryRunner.startTransaction).not.toHaveBeenCalled();
    expect(mockQueryRunner.rollbackTransaction).not.toHaveBeenCalled();
  });

  it('should rollback transaction on error', async () => {
    const createOrderDto: CreateOrderDto = {
      orderItems: [
        { mealUUID: 'ca2d92cb-11de-4634-9bd6-46d2f2741f9a', quantity: 2 },
      ],
    };

    const meals = [
      {
        mealUUID: 'ca2d92cb-11de-4634-9bd6-46d2f2741f9a',
        mealId: 1,
        price: 10,
      },
    ];

    mockMealsService.findMealsByUUID.mockResolvedValue(meals);
    mockOrderRepository.save.mockRejectedValue(new Error('Database error'));

    const orderService = await createTestingModule();

    await expect(orderService.createOrder(createOrderDto)).rejects.toThrow(
      BadRequestException,
    );
    expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
  });
});
