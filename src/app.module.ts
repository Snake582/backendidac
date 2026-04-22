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
  useFactory: (config: ConfigService) => ({
    type: 'mysql',
    host: config.get('DB_HOST'),
    port: Number(config.get('DB_PORT')),
    username: config.get('DB_USER'),
    password: config.get('DB_PASSWORD'),
    database: config.get('DB_NAME'),
    entities: [User, Bien, Image],
    synchronize: true,
  }),
}),

    UsersModule,
    AuthModule,
    BiensModule,
  ],
})
export class AppModule {}