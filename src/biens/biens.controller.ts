import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BiensService } from './biens.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('biens')
export class BiensController {
  constructor(private service: BiensService) {}

  // ===============================
  // 🔎 Récupérer tous les biens
  // ===============================
  @Get()
  findAll() {
    return this.service.findAll();
  }

  // ===============================
  // 🔎 Récupérer un bien par id
  // ===============================
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  // ===============================
  // ➕ Créer un bien avec images
  // ===============================
  @UseGuards(AuthGuard('jwt'))
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'mainImage', maxCount: 1 },
        { name: 'images', maxCount: 20 },
      ],
      {
        storage: diskStorage({
          destination: './uploads',
          filename: (req, file, callback) => {
            const uniqueName =
              Date.now() + '-' + Math.round(Math.random() * 1e9);
            callback(null, uniqueName + extname(file.originalname));
          },
        }),
      },
    ),
  )
  create(
    @Body() dto: any,
    @UploadedFiles()
    files: {
      mainImage?: Express.Multer.File[];
      images?: Express.Multer.File[];
    },
  ) {
    return this.service.create(dto, files);
  }

  // ===============================
  // ✏️ Modifier un bien avec images
  // ===============================
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'mainImage', maxCount: 1 },
        { name: 'images', maxCount: 20 },
      ],
      {
        storage: diskStorage({
          destination: './uploads',
          filename: (req, file, callback) => {
            const uniqueName =
              Date.now() + '-' + Math.round(Math.random() * 1e9);
            callback(null, uniqueName + extname(file.originalname));
          },
        }),
      },
    ),
  )
  update(
    @Param('id') id: string,
    @Body() dto: any,
    @UploadedFiles()
    files: {
      mainImage?: Express.Multer.File[];
      images?: Express.Multer.File[];
    },
  ) {
    return this.service.update(+id, dto, files);
  }

  // ===============================
  // ❌ Supprimer un bien
  // ===============================
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
