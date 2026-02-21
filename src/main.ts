import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './users/entities/user.entity';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);

  // ✅ CORS dynamique pour Frontend
  app.enableCors({
  origin: configService.get('FRONTEND_URL') || '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
});

  // ✅ Dossier pour fichiers uploadés
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // ✅ PORT dynamique
  const port = parseInt(configService.get('PORT') || '3000', 10);


  await app.listen(port);
  console.log(`🚀 Backend démarré sur le port ${port}`);

  // ✅ Création automatique de l’admin
  const userRepository = app.get<Repository<User>>(getRepositoryToken(User));

  const adminEmail = 'contact@cabinetidac.sn';
  const adminPassword = 'Admin123idac';

  const adminExists = await userRepository.findOne({
    where: { email: adminEmail },
  });

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = userRepository.create({
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
    });

    await userRepository.save(admin);
    console.log('✅ Admin créé automatiquement');
  } else {
    console.log('ℹ️ Admin déjà existant');
  }
}

bootstrap();