import { MigrationInterface, QueryRunner } from 'typeorm';
import { meals } from './utils/meals.json';
import { CategoryEntity, MealEntity } from '../lib/entities';

export class AddInitialMeals1731263730953 implements MigrationInterface {
  name = 'AddInitialMeals1731263730952';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const categories = await queryRunner.manager
      .getRepository(CategoryEntity)
      .find();

    const categoryMap = new Map<string, number>();
    categories.forEach((category) =>
      categoryMap.set(category.categoryName, category.categoryId),
    );
    const mealsWithCategories = meals.map((meal) => ({
      ...meal,
      categoryId: categoryMap.get(meal.categoryName),
    }));

    await queryRunner.manager
      .getRepository(MealEntity)
      .save(mealsWithCategories);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
