import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sensor } from '../sensores/entities/sensor.entity';
import { Medicion } from '../mediciones/entities/medicion.entity';

@Injectable()
export class FakeMedicionesService implements OnModuleInit {
  private readonly logger = new Logger(FakeMedicionesService.name);
  
  constructor(
    @InjectRepository(Sensor)
    private sensoresRepository: Repository<Sensor>,
    @InjectRepository(Medicion)
    private medicionesRepository: Repository<Medicion>,
  ) {}

  // Este método se ejecuta cuando el módulo se inicializa
  async onModuleInit() {
    this.logger.log('🕒 FakeMedicionesService inicializado. Cron job configurado para ejecutarse cada 15 minutos.');
  }

  /**
   * Genera mediciones falsas para todos los sensores cada 15 minutos.
   * Simula patrones de consumo basados en la hora del día.
   */

  // Cron que se ejecuta cada 15 minutos (formato: segundo minuto hora día-del-mes mes día-de-la-semana)
  @Cron('0 */15 * * * *', {
    name: 'quarterHourMedicionesGenerator',
    timeZone: 'America/Mexico_City' // Ajusta a tu zona horaria
  })
  async generateHourlyMediciones() {
    try {
      this.logger.log('Iniciando generación de mediciones para el intervalo actual de 15 minutos...');
      
      // Obtener todos los sensores activos
      const sensores = await this.sensoresRepository.find();
      if (!sensores.length) {
        this.logger.warn('No se encontraron sensores para generar datos');
        return;
      }
      
      // Obtener la hora actual en zona horaria de CDMX
      const serverNow = new Date();
      
      // CDMX está en UTC-6 (-360 minutos)
      const cdmxOffset = -360;
      const serverOffset = serverNow.getTimezoneOffset();
      const offsetDiff = serverOffset - cdmxOffset; // Diferencia en minutos
      
      // Ajustar la hora actual según la zona horaria de CDMX
      const now = new Date(serverNow.getTime() + (offsetDiff * 60 * 1000));
      
      this.logger.log(`Usando zona horaria CDMX (UTC-6). Hora ajustada: ${now.toISOString()}`);
      
      // Redondear al intervalo de 15 minutos actual
      const actualMinute = now.getMinutes();
      const currentInterval = Math.floor(actualMinute / 15) * 15;
      
      // Crear timestamp para el intervalo actual de 15 minutos
      const timestamp = new Date(now);
      timestamp.setMinutes(currentInterval, 0, 0); // Establecer minutos exactos y segundos a 0
      
      // Formatear la fecha en formato YYYY-MM-DD usando la zona horaria local
      const year = timestamp.getFullYear();
      const month = String(timestamp.getMonth() + 1).padStart(2, '0');
      const day = String(timestamp.getDate()).padStart(2, '0');
      const currentDate = `${year}-${month}-${day}`;
      
      // Formatear la hora (HH:MM:00)
      const hours = timestamp.getHours().toString().padStart(2, '0');
      const minutes = timestamp.getMinutes().toString().padStart(2, '0');
      const currentTime = `${hours}:${minutes}:00`;
      
      // Factor de uso basado en la hora del día
      const hour = timestamp.getHours();
      let usageFactor: number;
      
      // Mayor durante horas laborales (9am-6pm), menor durante la noche
      if (hour >= 9 && hour <= 18) {
        usageFactor = 0.8 + (Math.random() * 0.4); // 0.8 a 1.2 (alto uso)
      } else if ((hour >= 6 && hour <= 8) || (hour >= 19 && hour <= 22)) {
        usageFactor = 0.5 + (Math.random() * 0.4); // 0.5 a 0.9 (uso medio)
      } else {
        usageFactor = 0.2 + (Math.random() * 0.3); // 0.2 a 0.5 (uso bajo, noche)
      }
      
      this.logger.log(`Generando datos SOLO para el intervalo actual: ${currentTime} con factor de uso ${usageFactor.toFixed(2)}`);
      
      // Generar y guardar mediciones para cada sensor
      for (const sensor of sensores) {
        // Valores base aleatorios para cada sensor
        let voltageBase = 110 + (Math.random() * 20); // Entre 110V y 130V
        let currentBase = 5 + (Math.random() * 15);   // Entre 5A y 20A
        
        // Aplicar factor de uso al consumo de corriente (el voltaje es más estable)
        currentBase = currentBase * usageFactor;
        
        // Pequeñas variaciones para simular fluctuaciones
        const voltageVariation = (Math.random() * 5 - 2.5); // Variación de ±2.5V
        const currentVariation = (Math.random() * 2 - 1);   // Variación de ±1A
        
        // Aplicar variaciones
        voltageBase = voltageBase + voltageVariation;
        currentBase = currentBase + currentVariation;
        
        // Asegurar que los valores estén dentro de límites razonables
        voltageBase = Math.max(100, Math.min(140, voltageBase));
        currentBase = Math.max(0.1, Math.min(30, currentBase));
        
        // Redondear a 2 decimales
        const voltaje = Math.round(voltageBase * 100) / 100;
        const corriente = Math.round(currentBase * 100) / 100;
        
        // Crear y guardar la medición
        const medicion = this.medicionesRepository.create({
          sensorId: sensor.id,
          date: currentDate,
          hora: currentTime,
          voltaje,
          corriente,
        });
        
        await this.medicionesRepository.save(medicion);
      }
      
      this.logger.log(`Datos generados correctamente SOLO para: ${currentDate} ${currentTime}`);
    } catch (error) {
      this.logger.error(`Error al generar mediciones falsas: ${error.message}`, error.stack);
    }
  }
  
  /**
   * Obtiene el factor de uso basado en la hora del día para simular
   * patrones realistas de consumo de energía.
   * @param hour Hora del día (0-23)
   * @returns Factor de uso (entre 0.2 y 1.2)
   */
  private getUsageFactorByHour(hour: number): number {
    // Mayor durante horas laborales (9am-6pm), menor durante la noche
    if (hour >= 9 && hour <= 18) {
      return 0.8 + (Math.random() * 0.4); // 0.8 a 1.2 (alto uso)
    } else if ((hour >= 6 && hour <= 8) || (hour >= 19 && hour <= 22)) {
      return 0.5 + (Math.random() * 0.4); // 0.5 a 0.9 (uso medio)
    } else {
      return 0.2 + (Math.random() * 0.3); // 0.2 a 0.5 (uso bajo, noche)
    }
  }

  /**
   * Genera valores realistas de voltaje y corriente para un sensor.
   * @param usageFactor Factor de uso para ajustar los valores
   * @returns Objeto con valores de voltaje y corriente
   */
  private generateSensorValues(usageFactor: number): { voltaje: number; corriente: number } {
    // Valores base aleatorios para cada sensor
    let voltageBase = 110 + (Math.random() * 20); // Entre 110V y 130V
    let currentBase = 5 + (Math.random() * 15);   // Entre 5A y 20A
    
    // Aplicar factor de uso al consumo de corriente (el voltaje es más estable)
    currentBase = currentBase * usageFactor;
    
    // Pequeñas variaciones para simular fluctuaciones
    const voltageVariation = (Math.random() * 5 - 2.5); // Variación de ±2.5V
    const currentVariation = (Math.random() * 2 - 1);   // Variación de ±1A
    
    // Aplicar variaciones
    voltageBase = voltageBase + voltageVariation;
    currentBase = currentBase + currentVariation;
    
    // Asegurar que los valores estén dentro de límites razonables
    voltageBase = Math.max(100, Math.min(140, voltageBase));
    currentBase = Math.max(0.1, Math.min(30, currentBase));
    
    // Redondear a 2 decimales para valores más realistas
    const voltaje = Math.round(voltageBase * 100) / 100;
    const corriente = Math.round(currentBase * 100) / 100;
    
    return { voltaje, corriente };
  }
  
  /**
   * Método para generar manualmente datos de los últimos 5 días, una hora antes de la hora actual.
   * Genera datos en intervalos de 15 minutos para cada día y hora.
   */
  async generatePastFiveDaysData() {
    try {
      this.logger.log('Generando datos históricos para los últimos 5 días...');
      
      // Obtener todos los sensores activos
      const sensores = await this.sensoresRepository.find();
      if (!sensores.length) {
        this.logger.warn('No se encontraron sensores para generar datos históricos');
        return { message: 'No se encontraron sensores para generar datos' };
      }
      
      // Obtener la fecha y hora actual en zona horaria de CDMX
      const serverNow = new Date();
      
      // CDMX está en UTC-6 (-360 minutos)
      const cdmxOffset = -360;
      const serverOffset = serverNow.getTimezoneOffset();
      const offsetDiff = serverOffset - cdmxOffset; // Diferencia en minutos
      
      // Ajustar la hora actual según la zona horaria de CDMX
      const now = new Date(serverNow.getTime() + (offsetDiff * 60 * 1000));
      
      this.logger.log(`Generando datos históricos usando zona horaria CDMX. Hora ajustada: ${now.toISOString()}`);
      
      // Determinar la hora anterior a la actual
      const oneHourAgo = new Date(now);
      oneHourAgo.setHours(now.getHours() - 1);
      const targetHour = oneHourAgo.getHours();
      
      this.logger.log(`Generando datos para los últimos 5 días a la hora ${targetHour}:00`);
      
      // Generar datos para los últimos 5 días
      for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
        // Calcular la fecha para este día (hoy - dayOffset)
        const currentDate = new Date(now);
        currentDate.setDate(now.getDate() - dayOffset);
        currentDate.setHours(targetHour, 0, 0, 0); // Establecer a la hora especificada
        
        const dateStr = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
        
        this.logger.log(`Generando datos para el día ${dateStr} a la hora ${targetHour}:00`);
        
        // Generar datos para cada intervalo de 15 minutos de la hora seleccionada
        for (let minute = 0; minute < 60; minute += 15) {
          // Formatear la hora (HH:MM:00)
          const timeStr = `${targetHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
          
          // Factor de uso basado en la hora del día
          let usageFactor = this.getUsageFactorByHour(targetHour);
          
          this.logger.log(`Generando datos para ${sensores.length} sensores el ${dateStr} a las ${timeStr}`);
          
          // Generar y guardar mediciones para cada sensor
          for (const sensor of sensores) {
            // Generar valores para este sensor
            const { voltaje, corriente } = this.generateSensorValues(usageFactor);
            
            // Crear y guardar la medición
            const medicion = this.medicionesRepository.create({
              sensorId: sensor.id,
              date: dateStr,
              hora: timeStr,
              voltaje,
              corriente,
            });
            
            await this.medicionesRepository.save(medicion);
          }
        }
        
        this.logger.log(`Datos generados correctamente para ${dateStr} a la hora ${targetHour}:00`);
      }
      
      return { message: 'Datos históricos de 5 días generados correctamente' };
    } catch (error) {
      this.logger.error(`Error al generar datos históricos de 5 días: ${error.message}`, error.stack);
      throw new Error(`Error al generar datos históricos de 5 días: ${error.message}`);
    }
  }
}
