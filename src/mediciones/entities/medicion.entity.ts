import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Sensor } from '../../sensores/entities/sensor.entity';

@Entity({ name: 'mediciones' })
export class Medicion {
  @ApiProperty({
    description: 'ID único de la medición',
    example: 1,
  })
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ApiProperty({
    description: 'ID del sensor asociado',
    example: 1,
  })
  @Column({ name: 'sensor_id' })
  sensorId: number;

  @ApiProperty({
    description: 'Fecha de la medición',
    example: '2024-10-01',
  })
  @Column({ type: 'date' })
  date: Date;

  @ApiProperty({
    description: 'Hora de la medición',
    example: '00:00:00',
  })
  @Column({ type: 'time' })
  hora: string;

  @ApiProperty({
    description: 'Valor del voltaje en la medición',
    example: 110.65,
  })
  @Column({ type: 'numeric', precision: 7, scale: 2 })
  voltaje: number;

  @ApiProperty({
    description: 'Valor de la corriente en la medición',
    example: 24.75,
  })
  @Column({ type: 'numeric', precision: 7, scale: 2 })
  corriente: number;

  @ManyToOne(() => Sensor, (sensor) => sensor.mediciones)
  @JoinColumn({ name: 'sensor_id' })
  sensor: Sensor;
}
