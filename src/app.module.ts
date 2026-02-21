import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { BiensModule } from './biens/biens.module';

import { User } from './users/entities/user.entity';
import { Bien } from './biens/entities/bien.entity';
import { Image } from './biens/entities/image.entity';

@Module({
  imports: [
    // ✅ Charge les variables d'environnement
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: false,
      envFilePath: '.env',
    }),

    // ✅ TypeORM PostgreSQL avec SSL pour Render
    TypeOrmModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    const host = config.get('DB_HOST') || '';
    const port = parseInt(config.get('DB_PORT') || '5432', 10);
    const username = config.get('DB_USER') || '';
    const password = config.get('DB_PASSWORD') || '';
    const database = config.get('DB_NAME') || '';

    return {
      type: 'postgres',
      host,
      port,
      username,
      password,
      database,
      entities: [User, Bien, Image],
      synchronize: true,
      ssl: { rejectUnauthorized: false },
    } as any;
  },
}),

    UsersModule,
    AuthModule,
    BiensModule,
  ],
})
export class AppModule {}