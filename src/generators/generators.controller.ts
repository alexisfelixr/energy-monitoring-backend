import { Controller, Post, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FakeMedicionesService } from './fake-mediciones.service';

@ApiTags('Generadores')
@Controller('generators')
export class GeneratorsController {
  constructor(private readonly fakeMedicionesService: FakeMedicionesService) {}

  @Post('mediciones')
  @ApiOperation({ summary: 'Generar mediciones falsas manualmente' })
  @ApiResponse({ status: 200, description: 'Mediciones generadas correctamente' })
  async generateMediciones() {
    return this.fakeMedicionesService.generateFakeMedicionesOnDemand();
  }
  
  @Get('next-execution')
  @ApiOperation({ summary: 'Obtener información sobre la próxima ejecución programada' })
  @ApiResponse({ status: 200, description: 'Información de la próxima ejecución' })
  getNextExecutionInfo() {
    // Calcular la hora de la próxima ejecución (cada 15 minutos)
    const now = new Date();
    const currentMinutes = now.getMinutes();
    const nextMinutes = Math.ceil(currentMinutes / 15) * 15;
    
    const nextExecution = new Date(now);
    if (nextMinutes === 60) {
      // Si estamos cerca del cambio de hora
      nextExecution.setHours(now.getHours() + 1, 0, 0, 0);
    } else {
      nextExecution.setMinutes(nextMinutes, 0, 0);
    }
    
    return {
      currentTime: now.toISOString(),
      nextExecution: nextExecution.toISOString(),
      timeUntilNextExecution: `${Math.floor((nextExecution.getTime() - now.getTime()) / 60000)} minutos`,
      schedule: 'Cada 15 minutos (00, 15, 30, 45)',
    };
  }
  
  @Post('historical-data')
  @ApiOperation({ summary: 'Generar datos históricos para las últimas 3 horas en intervalos de 15 minutos' })
  @ApiResponse({ status: 200, description: 'Datos históricos generados correctamente' })
  async generateHistoricalData() {
    return this.fakeMedicionesService.generateHistoricalData();
  }
}
