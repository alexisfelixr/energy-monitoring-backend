import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, IsInt, IsPositive } from 'class-validator';

export class CreateSensorDto {
  @ApiProperty({
    description: 'UID único del sensor',
    example: 'Sensor 1',
  })
  @IsNotEmpty({ message: 'El UID del sensor no puede estar vacío' })
  @IsString({ message: 'El UID del sensor debe ser un texto' })
  @MaxLength(50, { message: 'El UID del sensor no puede exceder los 50 caracteres' })
  sensorUid: string;

  @ApiProperty({
    description: 'ID del área a la que pertenece',
    example: 1,
  })
  @IsNotEmpty({ message: 'El ID del área no puede estar vacío' })
  @IsInt({ message: 'El ID del área debe ser un número entero' })
  @IsPositive({ message: 'El ID del área debe ser un número positivo' })
  areaId: number;
}
