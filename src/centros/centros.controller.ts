import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CentrosService } from './centros.service';
import { CreateCentroDto } from './dto/create-centro.dto';
import { UpdateCentroDto } from './dto/update-centro.dto';
import { Centro } from './entities/centro.entity';

@ApiTags('Centros')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('centros')
export class CentrosController {
  constructor(private readonly centrosService: CentrosService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los centros de trabajo' })
  @ApiResponse({ status: 200, description: 'Lista de centros', type: [Centro] })
  async findAll(): Promise<Centro[]> {
    return this.centrosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un centro de trabajo por ID' })
  @ApiResponse({ status: 200, description: 'Centro encontrado', type: Centro })
  @ApiResponse({ status: 404, description: 'Centro no encontrado' })
  async findOne(@Param('id') id: string): Promise<Centro> {
    return this.centrosService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un centro de trabajo' })
  @ApiResponse({ status: 200, description: 'Centro actualizado', type: Centro })
  @ApiResponse({ status: 404, description: 'Centro no encontrado' })
  async update(
    @Param('id') id: string,
    @Body() updateCentroDto: UpdateCentroDto,
  ): Promise<Centro> {
    return this.centrosService.update(+id, updateCentroDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un centro de trabajo' })
  @ApiResponse({ status: 200, description: 'Centro eliminado' })
  @ApiResponse({ status: 404, description: 'Centro no encontrado' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.centrosService.remove(+id);
  }
}
