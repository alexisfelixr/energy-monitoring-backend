import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, IsInt, IsPositive } from 'class-validator';

export class CreateAreaDto {
  @ApiProperty({
    description: 'Nombre del área',
    example: 'Área A',
  })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @IsString({ message: 'El nombre debe ser un texto' })
  @MaxLength(100, { message: 'El nombre no puede exceder los 100 caracteres' })
  nombre: string;

  @ApiProperty({
    description: 'ID del centro de trabajo al que pertenece',
    example: 1,
  })
  @IsNotEmpty({ message: 'El ID del centro de trabajo no puede estar vacío' })
  @IsInt({ message: 'El ID del centro de trabajo debe ser un número entero' })
  @IsPositive({ message: 'El ID del centro de trabajo debe ser un número positivo' })
  centroId: number;
}
