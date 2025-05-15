import { ApiProperty } from '@nestjs/swagger';

export class UsuarioProfileDto {
  @ApiProperty({ description: 'ID del usuario' })
  id: number;

  @ApiProperty({ description: 'Nombre del usuario' })
  nombre: string;

  @ApiProperty({ description: 'Apellido del usuario' })
  apellido: string;

  @ApiProperty({ description: 'Email del usuario' })
  email: string;

  @ApiProperty({ description: 'Estado del usuario (activo/inactivo)' })
  estaActivo: boolean;

  @ApiProperty({ description: 'Fecha de creación del usuario' })
  fechaCreacion: Date;
}
