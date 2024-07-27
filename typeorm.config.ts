import { DataSource } from 'typeorm';

import 'dotenv/config';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: +process.env.POSTGRES_PORT,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE_NAME,
  synchronize: process.env.POSTGRES_SYNCHRONIZE === 'true',
  logging: false,
  entities: ['dist/**/*.entity{ .ts,.js}'],
  migrations: ['dist/src/migrations/*{.ts,.js}'],
  migrationsTableName: 'users_migrations',
});
