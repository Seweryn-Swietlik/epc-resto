import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CategoryEntity, MealEntity } from 'lib/entities';
import { hasElements } from 'lib/utils';
import { GetMealsDto } from './dto';
import { GetMealDao } from './dao';

@Injectable()
export class MealsService {
  constructor(
    @InjectRepository(MealEntity)
    private readonly mealRepository: Repository<MealEntity>,
  ) {}

  getMeals(dto: GetMealsDto) {
    const { categoryName, offset, limit } = dto;

    const sql = this.mealRepository
      .createQueryBuilder('M')
      .select('M.mealUUID, M.mealName, M.price, C.categoryName')
      .innerJoin(CategoryEntity, 'C', 'M.categoryId = C.categoryId');

    if (categoryName) {
      sql.andWhere('C.name = :categoryName', {
        categoryName,
      });
    }

    return sql.offset(offset).limit(limit).getRawMany<GetMealDao>();
  }

  findMealsByUUID(mealsUUIDs: Array<string>) {
    if (!hasElements(mealsUUIDs)) {
      return Promise.resolve([]);
    }

    return this.mealRepository.findBy({ mealUUID: In(mealsUUIDs) });
  }
}
