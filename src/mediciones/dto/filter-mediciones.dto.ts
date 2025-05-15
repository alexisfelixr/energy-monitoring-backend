import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterMedicionesDto {
  @ApiProperty({
    description: 'ID del centro de trabajo',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El ID del centro debe ser un número entero' })
  @IsPositive({ message: 'El ID del centro debe ser un número positivo' })
  centroId?: number;

  @ApiProperty({
    description: 'ID del área',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El ID del área debe ser un número entero' })
  @IsPositive({ message: 'El ID del área debe ser un número positivo' })
  areaId?: number;

  @ApiProperty({
    description: 'ID del sensor',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El ID del sensor debe ser un número entero' })
  @IsPositive({ message: 'El ID del sensor debe ser un número positivo' })
  sensorId?: number;

  @ApiProperty({
    description: 'Fecha inicial de búsqueda (YYYY-MM-DD)',
    example: '2024-10-01',
    required: false,
  })
  @IsOptional()
  @IsDateString({ strict: true }, { message: 'Formato de fecha inicial inválido' })
  fechaInicio?: string;

  @ApiProperty({
    description: 'Fecha final de búsqueda (YYYY-MM-DD)',
    example: '2024-10-31',
    required: false,
  })
  @IsOptional()
  @IsDateString({ strict: true }, { message: 'Formato de fecha final inválido' })
  fechaFin?: string;
}
