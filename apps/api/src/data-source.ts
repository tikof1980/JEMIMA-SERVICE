import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

// Connexion PostgreSQL dédiée à JEMIMA SERVICE — base et identifiants
// entièrement séparés de tout autre projet.
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'jemima_user',
  password: process.env.DB_PASSWORD || 'change_me_in_production',
  database: process.env.DB_NAME || 'jemima_service_db',
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
});
