import { MigrationInterface, QueryRunner } from 'typeorm';
import { CategoryEntity } from '../lib/entities';
import { categories } from './utils/category.json';

export class AddInitialCategories1731263730952 implements MigrationInterface {
  name = 'AddInitialCategories1731263730952';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.getRepository(CategoryEntity).save(categories);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
