import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1731263730951 implements MigrationInterface {
  name = 'Initial1731263730951';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."order_status_enum" AS ENUM('new', 'in_the_kitchen', 'in_delivery', 'done')`,
    );
    await queryRunner.query(
      `CREATE TABLE "order" ("orderId" SERIAL NOT NULL, "orderUUID" uuid NOT NULL DEFAULT uuid_generate_v4(), "orderStatus" "public"."order_status_enum" NOT NULL DEFAULT 'new', "totalPrice" numeric NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(), "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(), CONSTRAINT "PK_b075313d4d7e1c12f1a6e6359e8" PRIMARY KEY ("orderId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "order_item" ("orderItemId" SERIAL NOT NULL, "orderItemUUID" uuid NOT NULL DEFAULT uuid_generate_v4(), "quantity" integer NOT NULL, "mealId" integer NOT NULL, "orderId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(), "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(), CONSTRAINT "PK_84644a0a548aa24c2591fe51967" PRIMARY KEY ("orderItemId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "meal" ("mealId" SERIAL NOT NULL, "mealUUID" uuid NOT NULL DEFAULT uuid_generate_v4(), "mealName" character varying NOT NULL, "price" numeric NOT NULL, "categoryId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(), "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(), CONSTRAINT "PK_8e76db520b509de94755628a195" PRIMARY KEY ("mealId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "category" ("categoryId" SERIAL NOT NULL, "categoryUUID" uuid NOT NULL DEFAULT uuid_generate_v4(), "categoryName" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(), "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(), CONSTRAINT "PK_8a300c5ce0f70ed7945e877a537" PRIMARY KEY ("categoryId"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" ADD CONSTRAINT "FK_636f68b266c8978c3bb0f91d428" FOREIGN KEY ("mealId") REFERENCES "meal"("mealId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" ADD CONSTRAINT "FK_646bf9ece6f45dbe41c203e06e0" FOREIGN KEY ("orderId") REFERENCES "order"("orderId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "meal" ADD CONSTRAINT "FK_fdd43ea916c49f9f38f4d72575c" FOREIGN KEY ("categoryId") REFERENCES "category"("categoryId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "meal" DROP CONSTRAINT "FK_fdd43ea916c49f9f38f4d72575c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" DROP CONSTRAINT "FK_646bf9ece6f45dbe41c203e06e0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" DROP CONSTRAINT "FK_636f68b266c8978c3bb0f91d428"`,
    );
    await queryRunner.query(`DROP TABLE "category"`);
    await queryRunner.query(`DROP TABLE "meal"`);
    await queryRunner.query(`DROP TABLE "order_item"`);
    await queryRunner.query(`DROP TABLE "order"`);
    await queryRunner.query(`DROP TYPE "public"."order_status_enum"`);
  }
}
