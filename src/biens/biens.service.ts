import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bien } from './entities/bien.entity';
import { Image } from './entities/image.entity';
import * as fs from 'fs';
import * as path from 'path';

interface FilesInput {
  mainImage?: Express.Multer.File[];
  images?: Express.Multer.File[];
}

@Injectable()
export class BiensService {
  constructor(
    @InjectRepository(Bien)
    private repo: Repository<Bien>,

    @InjectRepository(Image)
    private imageRepo: Repository<Image>,
  ) {}

  // ===============================
  // 🔎 Récupérer tous les biens
  // ===============================
  async findAll(): Promise<Bien[]> {
    return this.repo.find({
      relations: { images: true },
      order: { id: 'DESC' },
    });
  }

  // ===============================
  // 🔎 Récupérer un bien
  // ===============================
  async findOne(id: number): Promise<Bien | null> {
    return this.repo.findOne({
      where: { id },
      relations: { images: true },
    });
  }

  // ===============================
  // ➕ Créer un bien
  // ===============================
  async create(dto: any, files: FilesInput): Promise<Bien> {
    const bien = this.repo.create({
      title: dto.title,
      type: dto.type,
      location: dto.location,
      price: dto.price,
      surface: dto.surface,
      description: dto.description,
      status: dto.status ?? 'disponible',
    });

    const savedBien = await this.repo.save(bien);

    if (files?.mainImage?.length && files.mainImage[0].filename) {
      await this.imageRepo.save(
        this.imageRepo.create({
          url: files.mainImage[0].filename,
          bien: savedBien,
        }),
      );
    }

    if (files?.images?.length) {
      for (const file of files.images) {
        if (!file.filename) continue;

        await this.imageRepo.save(
          this.imageRepo.create({
            url: file.filename,
            bien: savedBien,
          }),
        );
      }
    }

    return (await this.findOne(savedBien.id)) as Bien;
  }

  // ===============================
  // ✏️ Modifier un bien
  // ===============================
  async update(id: number, dto: any, files?: FilesInput): Promise<Bien> {
    const existing = await this.repo.findOne({
      where: { id },
      relations: { images: true },
    });

    if (!existing) throw new Error('Bien non trouvé');

    // 🔥 Mise à jour des champs texte
    Object.assign(
      existing,
      Object.fromEntries(
        Object.entries(dto).filter(
          ([_, value]) =>
            value !== undefined &&
            value !== null &&
            value !== '',
        ),
      ),
    );

    await this.repo.save(existing);

    // ===============================
    // 🔥 SUPPRESSION DES IMAGES (SAFE)
    // ===============================
    if (dto.deletedImages) {
      const idsToDelete: number[] = JSON.parse(dto.deletedImages);

      for (const imageId of idsToDelete) {
        const image = await this.imageRepo.findOne({
          where: { id: imageId },
        });

        if (image && image.url) {
          const filePath = path.join(
            process.cwd(),
            'uploads',
            image.url,
          );

          try {
            if (
              fs.existsSync(filePath) &&
              fs.lstatSync(filePath).isFile()
            ) {
              fs.unlinkSync(filePath);
            }
          } catch (error) {
            console.error('Erreur suppression fichier:', error);
          }

          await this.imageRepo.remove(image);
        }
      }
    }

    // ===============================
    // 🔥 AJOUT IMAGE PRINCIPALE
    // ===============================
    if (files?.mainImage?.length && files.mainImage[0].filename) {
      await this.imageRepo.save(
        this.imageRepo.create({
          url: files.mainImage[0].filename,
          bien: existing,
        }),
      );
    }

    // ===============================
    // 🔥 AJOUT IMAGES SECONDAIRES
    // ===============================
    if (files?.images?.length) {
      for (const file of files.images) {
        if (!file.filename) continue;

        await this.imageRepo.save(
          this.imageRepo.create({
            url: file.filename,
            bien: existing,
          }),
        );
      }
    }

    return (await this.findOne(id)) as Bien;
  }

  // ===============================
  // ❌ Supprimer un bien + ses images
  // ===============================
  async remove(id: number) {
    const existing = await this.repo.findOne({
      where: { id },
      relations: { images: true },
    });

    if (!existing) throw new Error('Bien non trouvé');

    for (const image of existing.images) {
      if (!image.url) continue;

      const filePath = path.join(
        process.cwd(),
        'uploads',
        image.url,
      );

      try {
        if (
          fs.existsSync(filePath) &&
          fs.lstatSync(filePath).isFile()
        ) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        console.error('Erreur suppression fichier:', error);
      }
    }

    await this.repo.remove(existing);

    return { message: 'Bien supprimé avec ses images' };
  }
}
