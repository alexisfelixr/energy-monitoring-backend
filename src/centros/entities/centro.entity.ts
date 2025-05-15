import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Area } from '../../areas/entities/area.entity';

@Entity({ name: 'centros_trabajo' })
export class Centro {
  @ApiProperty({
    description: 'ID único del centro de trabajo',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Nombre del centro de trabajo',
    example: 'Centro 1',
  })
  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
  })
  nombre: string;

  @OneToMany(() => Area, (area) => area.centro)
  areas: Area[];
}
