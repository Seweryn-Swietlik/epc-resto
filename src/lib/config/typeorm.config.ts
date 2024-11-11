import { toBoolean } from '../utils';
import { TimeIntervalMs } from './constants';

export default {
  type: process.env.TYPEORM_CONNECTION,
  host: process.env.TYPEORM_HOST,
  port: process.env.TYPEORM_PORT,
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.TYPEORM_DATABASE,
  entities: [`${__dirname}/../entities/*.entity.{ts,js}`],
  migrations: [`${__dirname}/../../migrations/*.{ts,js}`],
  migrationsRun: true,
  autoLoadEntities: true,
  logging: toBoolean(process.env.TYPEORM_LOGGING),
  debug: toBoolean(process.env.TYPEORM_DEBUG),
  synchronize: toBoolean(process.env.TYPEORM_SYNCHRONIZE),
  maxQueryExecutionTime: TimeIntervalMs.Minute,
  legacySpatialSupport: false,
  bigNumberStrings: false,
  charset: 'utf8mb4_general_ci',
  retryAttempts: process.env.TYPEORM_RETRY_ATTEMPTS
    ? parseInt(process.env.TYPEORM_RETRY_ATTEMPTS, 10)
    : 5,
  retryDelay: process.env.TYPEORM_RETRY_DELAY
    ? parseInt(process.env.TYPEORM_RETRY_DELAY, 10)
    : 3000,
};
