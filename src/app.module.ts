import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { BiensModule } from './biens/biens.module';
import { User } from './users/entities/user.entity';
import { Bien } from './biens/entities/bien.entity';
import { Image } from './biens/entities/image.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'idac',
      entities: [User, Bien, Image],
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    BiensModule,
  ],
})
export class AppModule {}
