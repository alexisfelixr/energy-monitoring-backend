import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AreasService } from './areas.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { Area } from './entities/area.entity';

@ApiTags('Areas')
@Controller('areas')
export class AreasController {
  constructor(private readonly areasService: AreasService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nueva área' })
  @ApiResponse({ status: 201, description: 'Área creada exitosamente', type: Area })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async create(@Body() createAreaDto: CreateAreaDto): Promise<Area> {
    return this.areasService.create(createAreaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las áreas o filtrar por centro' })
  @ApiQuery({ 
    name: 'centroId', 
    required: false, 
    type: Number,
    description: 'ID del centro de trabajo para filtrar áreas' 
  })
  @ApiResponse({ status: 200, description: 'Lista de áreas', type: [Area] })
  async findAll(@Query('centroId') centroId?: string): Promise<Area[]> {
    if (centroId) {
      return this.areasService.findByCentro(+centroId);
    }
    return this.areasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un área por ID' })
  @ApiResponse({ status: 200, description: 'Área encontrada', type: Area })
  @ApiResponse({ status: 404, description: 'Área no encontrada' })
  async findOne(@Param('id') id: string): Promise<Area> {
    return this.areasService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un área' })
  @ApiResponse({ status: 200, description: 'Área actualizada', type: Area })
  @ApiResponse({ status: 404, description: 'Área no encontrada' })
  async update(
    @Param('id') id: string,
    @Body() updateAreaDto: UpdateAreaDto,
  ): Promise<Area> {
    return this.areasService.update(+id, updateAreaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un área' })
  @ApiResponse({ status: 200, description: 'Área eliminada' })
  @ApiResponse({ status: 404, description: 'Área no encontrada' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.areasService.remove(+id);
  }
}
