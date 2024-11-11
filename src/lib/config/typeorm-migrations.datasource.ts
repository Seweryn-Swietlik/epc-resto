import { DataSource } from 'typeorm';

// this datasource is needed to generate migrations - it's not used in application itself
export default new DataSource({
  type: 'postgres',
  host: process.env.TYPEORM_HOST,
  port: parseInt(process.env.TYPEORM_PORT || '5432', 10),
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.TYPEORM_DATABASE,
  entities: [`${__dirname}/../entities/*.entity.{ts,js}`],
});
