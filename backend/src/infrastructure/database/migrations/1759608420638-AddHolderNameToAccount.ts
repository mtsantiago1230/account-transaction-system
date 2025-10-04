import { MigrationInterface, QueryRunner } from "typeorm";

export class AddHolderNameToAccount1759608420638 implements MigrationInterface {
    name = 'AddHolderNameToAccount1759608420638'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "accounts" ADD "holderName" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "holderName"`);
    }

}
