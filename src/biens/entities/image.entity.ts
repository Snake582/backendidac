import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Bien } from './bien.entity';

@Entity()
export class Image {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @ManyToOne(() => Bien, (bien) => bien.images, {
    onDelete: 'CASCADE',
  })
  bien: Bien;
}
