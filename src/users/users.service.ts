import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,
  ) {}

  // ✅ CREATE USER
  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.repo.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.repo.save(user);
  }

  // ✅ FIND ALL USERS
  findAll() {
    return this.repo.find();
  }

  // ✅ FIND ONE USER
  async findOne(id: number) {
    const user = await this.repo.findOne({ where: { id } });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  // ✅ UPDATE USER
  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);

    return this.repo.save(user);
  }

  // ✅ DELETE USER
  async remove(id: number) {
    const user = await this.findOne(id);
    return this.repo.remove(user);
  }

  // 🔐 UTILS POUR AUTH
  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  // 👑 CREATE ADMIN AUTO
  async createAdmin() {
    const exist = await this.repo.findOne({
      where: { email: 'contact@cabinetidac.sn' },
    });

    if (exist) return;

    const hash = await bcrypt.hash('Admin123idac', 10);

    const admin = this.repo.create({
      email: 'contact@cabinetidac.sn',
      password: hash,
      role: 'admin',
    });

    await this.repo.save(admin);
  }
}
