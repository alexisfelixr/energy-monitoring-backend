import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, IsPositive, IsDateString, IsNumber, Min, Max, IsString, Matches } from 'class-validator';

export class CreateMedicionDto {
  @ApiProperty({
    description: 'ID del sensor asociado',
    example: 1,
  })
  @IsNotEmpty({ message: 'El ID del sensor no puede estar vacío' })
  @IsInt({ message: 'El ID del sensor debe ser un número entero' })
  @IsPositive({ message: 'El ID del sensor debe ser un número positivo' })
  sensorId: number;

  @ApiProperty({
    description: 'Fecha de la medición (YYYY-MM-DD)',
    example: '2024-10-01',
  })
  @IsNotEmpty({ message: 'La fecha no puede estar vacía' })
  @IsDateString({ strict: true }, { message: 'Formato de fecha inválido, debe ser YYYY-MM-DD' })
  date: string;

  @ApiProperty({
    description: 'Hora de la medición (HH:MM:SS)',
    example: '00:00:00',
  })
  @IsNotEmpty({ message: 'La hora no puede estar vacía' })
  @IsString({ message: 'La hora debe ser un texto' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
    message: 'Formato de hora inválido, debe ser HH:MM:SS o HH:MM',
  })
  hora: string;

  @ApiProperty({
    description: 'Valor del voltaje en la medición',
    example: 110.65,
  })
  @IsNotEmpty({ message: 'El voltaje no puede estar vacío' })
  @IsNumber({}, { message: 'El voltaje debe ser un número' })
  @Min(0, { message: 'El voltaje debe ser mayor o igual a 0' })
  voltaje: number;

  @ApiProperty({
    description: 'Valor de la corriente en la medición',
    example: 24.75,
  })
  @IsNotEmpty({ message: 'La corriente no puede estar vacía' })
  @IsNumber({}, { message: 'La corriente debe ser un número' })
  @Min(0, { message: 'La corriente debe ser mayor o igual a 0' })
  corriente: number;
}
