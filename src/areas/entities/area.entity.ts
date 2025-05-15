import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Centro } from '../../centros/entities/centro.entity';
import { Sensor } from '../../sensores/entities/sensor.entity';

@Entity({ name: 'areas' })
export class Area {
  @ApiProperty({
    description: 'ID único del área',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Nombre del área',
    example: 'Área A',
  })
  @Column({
    type: 'varchar',
    length: 100,
  })
  nombre: string;

  @ApiProperty({
    description: 'ID del centro de trabajo al que pertenece',
    example: 1,
  })
  @Column({ name: 'centro_id' })
  centroId: number;

  @ManyToOne(() => Centro, (centro) => centro.areas)
  @JoinColumn({ name: 'centro_id' })
  centro: Centro;

  @OneToMany(() => Sensor, (sensor) => sensor.area)
  sensores: Sensor[];
}
