import { Controller, Get, Post, Body, Patch, Param, Delete, Query, NotFoundException, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { MedicionesService } from './mediciones.service';
import { CreateMedicionDto } from './dto/create-medicion.dto';
import { UpdateMedicionDto } from './dto/update-medicion.dto';
import { Medicion } from './entities/medicion.entity';
import { FilterMedicionesDto } from './dto/filter-mediciones.dto';

@ApiTags('Mediciones')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('mediciones')
export class MedicionesController {
  constructor(private readonly medicionesService: MedicionesService) {}

  @Get('historico')
  @ApiOperation({ summary: 'Obtener datos históricos con filtros' })
  @ApiResponse({ status: 200, description: 'Datos históricos obtenidos exitosamente' })
  @ApiResponse({ status: 400, description: 'Parámetros inválidos' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Fecha de inicio en formato YYYY-MM-DD'
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'Fecha de fin en formato YYYY-MM-DD'
  })
  @ApiQuery({
    name: 'centroId',
    required: false,
    type: Number,
    description: 'ID del centro'
  })
  @ApiQuery({
    name: 'areaId',
    required: false,
    type: Number,
    description: 'ID del área'
  })
  @ApiQuery({
    name: 'sensorId',
    required: false,
    type: Number,
    description: 'ID del sensor'
  })
  async getDatosHistoricos(
    @Query('startDate') startDate?: string, 
    @Query('endDate') endDate?: string,
    @Query('centroId') centroId?: number,
    @Query('areaId') areaId?: number,
    @Query('sensorId') sensorId?: number,
  ) {
    const numericCentroId = centroId ? String(centroId) : undefined;
    const numericAreaId = areaId ? String(areaId) : undefined;
    const numericSensorId = sensorId ? String(sensorId) : undefined;
    
    return await this.medicionesService.getDatosHistoricos(startDate, endDate, numericCentroId, numericAreaId, numericSensorId);
  }
  
  @Post()
  @ApiOperation({ summary: 'Crear nueva medición' })
  @ApiResponse({ status: 201, description: 'Medición creada exitosamente', type: Medicion })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async create(@Body() createMedicionDto: CreateMedicionDto): Promise<Medicion> {
    return this.medicionesService.create(createMedicionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener mediciones con filtros opcionales' })
  @ApiResponse({ status: 200, description: 'Lista de mediciones', type: [Medicion] })
  async findAll(@Query() filterDto: FilterMedicionesDto): Promise<Medicion[]> {
    return this.medicionesService.findAll(filterDto);
  }

  @Get('sensor/:sensorId')
  @ApiOperation({ summary: 'Obtener mediciones por sensor' })
  @ApiQuery({
    name: 'fecha',
    required: false,
    type: String,
    description: 'Fecha en formato YYYY-MM-DD'
  })
  @ApiResponse({ status: 200, description: 'Lista de mediciones del sensor', type: [Medicion] })
  @ApiResponse({ status: 404, description: 'Sensor no encontrado' })
  async findBySensor(
    @Param('sensorId') sensorId: string,
    @Query('fecha') fecha?: string,
  ): Promise<Medicion[]> {
    return this.medicionesService.findBySensor(+sensorId, fecha);
  }

  @Get('resumen/sensor/:sensorId')
  @ApiOperation({ summary: 'Obtener resumen estadístico por sensor' })
  @ApiQuery({
    name: 'fecha',
    required: false,
    type: String,
    description: 'Fecha en formato YYYY-MM-DD'
  })
  @ApiResponse({ status: 200, description: 'Resumen estadístico del sensor' })
  @ApiResponse({ status: 404, description: 'Sensor no encontrado' })
  async getResumenPorSensor(
    @Param('sensorId') sensorId: string,
    @Query('fecha') fecha?: string,
  ): Promise<any> {
    return this.medicionesService.getResumenPorSensor(+sensorId, fecha);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una medición' })
  @ApiResponse({ status: 200, description: 'Medición actualizada', type: Medicion })
  @ApiResponse({ status: 404, description: 'Medición no encontrada' })
  async update(
    @Param('id') id: string,
    @Body() updateMedicionDto: UpdateMedicionDto,
  ): Promise<Medicion | null> {
    const numericId = Number(id);
    
    if (isNaN(numericId)) {
      return null;
    }
    
    return this.medicionesService.update(numericId, updateMedicionDto);
  }

  @Get('centro/:centroId/monitoring')
  @ApiOperation({ summary: 'Obtener todos los datos de monitoreo para un centro específico' })
  @ApiQuery({
    name: 'desde',
    required: false,
    type: String,
    description: 'Fecha y hora ISO desde la cual obtener datos (default: 3 horas atrás)'
  })
  @ApiQuery({
    name: 'timezoneOffset',
    required: false,
    type: Number,
    description: 'Offset de zona horaria del cliente en minutos (ejemplo: -420 para UTC-7)'
  })
  @ApiResponse({ status: 200, description: 'Datos de monitoreo del centro' })
  @ApiResponse({ status: 404, description: 'Centro no encontrado' })
  async getCentroMonitoringData(
    @Param('centroId') centroId: string,
    @Query('desde') desde?: string,
    @Query('timezoneOffset') timezoneOffset?: string,
    @Query('timezone') timezone?: string,
  ): Promise<any> {
    const numericId = Number(centroId);
    
    if (isNaN(numericId)) {
      // throw new NotFoundException(`ID de centro inválido: ${centroId}`);
    }
    
    return this.medicionesService.getCentroMonitoringData(numericId, desde, timezoneOffset, timezone);
  }
}
