import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SensoresService } from './sensores.service';
import { CreateSensorDto } from './dto/create-sensor.dto';
import { UpdateSensorDto } from './dto/update-sensor.dto';
import { Sensor } from './entities/sensor.entity';

@ApiTags('Sensores')
@Controller('sensores')
export class SensoresController {
  constructor(private readonly sensoresService: SensoresService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nuevo sensor' })
  @ApiResponse({ status: 201, description: 'Sensor creado exitosamente', type: Sensor })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async create(@Body() createSensorDto: CreateSensorDto): Promise<Sensor> {
    return this.sensoresService.create(createSensorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los sensores o filtrar por área' })
  @ApiQuery({ 
    name: 'areaId', 
    required: false, 
    type: Number,
    description: 'ID del área para filtrar sensores' 
  })
  @ApiResponse({ status: 200, description: 'Lista de sensores', type: [Sensor] })
  async findAll(@Query('areaId') areaId?: string): Promise<Sensor[]> {
    if (areaId) {
      return this.sensoresService.findByArea(+areaId);
    }
    return this.sensoresService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un sensor por ID' })
  @ApiResponse({ status: 200, description: 'Sensor encontrado', type: Sensor })
  @ApiResponse({ status: 404, description: 'Sensor no encontrado' })
  async findOne(@Param('id') id: string): Promise<Sensor> {
    return this.sensoresService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un sensor' })
  @ApiResponse({ status: 200, description: 'Sensor actualizado', type: Sensor })
  @ApiResponse({ status: 404, description: 'Sensor no encontrado' })
  async update(
    @Param('id') id: string,
    @Body() updateSensorDto: UpdateSensorDto,
  ): Promise<Sensor> {
    return this.sensoresService.update(+id, updateSensorDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un sensor' })
  @ApiResponse({ status: 200, description: 'Sensor eliminado' })
  @ApiResponse({ status: 404, description: 'Sensor no encontrado' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.sensoresService.remove(+id);
  }
}
