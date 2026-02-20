import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Image } from './image.entity';

export enum BienStatus {
  DISPONIBLE = 'disponible',
  LOUE = 'loué',
}

@Entity()
export class Bien {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  type: string;

  @Column()
  location: string;

  @Column()
  price: string;

  @Column({ nullable: true })
  surface: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: BienStatus,
    default: BienStatus.DISPONIBLE,
  })
  status: BienStatus;

  @OneToMany(() => Image, (image) => image.bien, {
    cascade: true,
    eager: true,
  })
  images: Image[];
}
