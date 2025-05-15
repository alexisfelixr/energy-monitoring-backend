import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Area } from '../../areas/entities/area.entity';
import { Medicion } from '../../mediciones/entities/medicion.entity';
import { Centro } from '../../centros/entities/centro.entity';

@Entity({ name: 'sensores' })
export class Sensor {
  @ApiProperty({
    description: 'ID único del sensor',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'UID único del sensor',
    example: 'Sensor 1',
  })
  @Column({
    name: 'sensor_uid',
    type: 'varchar',
    length: 50,
  })
  sensorUid: string;

  @ApiProperty({
    description: 'ID del área a la que pertenece',
    example: 1,
  })
  @Column({ name: 'area_id' })
  areaId: number;

  @ManyToOne(() => Area, (area) => area.sensores)
  @JoinColumn({ name: 'area_id' })
  area: Area;

  @OneToMany(() => Medicion, (medicion) => medicion.sensor)
  mediciones: Medicion[];
}
