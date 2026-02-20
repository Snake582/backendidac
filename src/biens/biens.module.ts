import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BiensService } from './biens.service';
import { BiensController } from './biens.controller';
import { Bien } from './entities/bien.entity';
import { Image } from './entities/image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bien, Image])],
  controllers: [BiensController],
  providers: [BiensService],
})
export class BiensModule {}
