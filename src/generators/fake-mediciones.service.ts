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
    this.logger.log('🕒 FakeMedicionesService inicializado. Cron job configurado para ejecutarse cada hora.');
    
    // Generar datos históricos al inicio para asegurar que hay datos disponibles
    await this.generateHistoricalData();
    
    // También ejecutar inmediatamente para verificar que funciona
    await this.generateHourlyMediciones();
  }

  /**
   * Genera mediciones falsas para todos los sensores cada hora, pero genera datos
   * como si se hubieran tomado cada 15 minutos durante esa hora.
   * Simula patrones de consumo basados en la hora del día.
  */

  // Cron que se ejecuta cada hora, todos los días (formato: segundo minuto hora día-del-mes mes día-de-la-semana)
  @Cron('0 0 * * * *', {
    name: 'hourlyMedicionesGenerator',
    timeZone: 'America/Mexico_City' // Ajusta a tu zona horaria
  })
  async generateHourlyMediciones() {
    try {
      this.logger.log('Iniciando generación de mediciones cada 15 minutos para la hora actual...');
      
      // Obtener todos los sensores activos
      const sensores = await this.sensoresRepository.find();
      if (!sensores.length) {
        this.logger.warn('No se encontraron sensores para generar datos');
        return;
      }
      
      // Obtener la hora actual
      const now = new Date();
      
      // Determinar el último intervalo de 15 minutos completado
      const actualMinute = now.getMinutes();
      const lastCompletedInterval = Math.floor(actualMinute / 15) * 15;
      
      // Retroceder al inicio de la hora actual
      const startOfHour = new Date(now);
      startOfHour.setMinutes(0, 0, 0);
      
      this.logger.log(`Generando datos solo hasta el último intervalo completado: ${lastCompletedInterval} minutos`);
      
      // Generar mediciones para los intervalos de 15 minutos hasta el último completado
      for (let minuteOffset = 0; minuteOffset <= lastCompletedInterval; minuteOffset += 15) {
        // Crear timestamp para este intervalo de 15 minutos
        const timestamp = new Date(startOfHour.getTime() + (minuteOffset * 60 * 1000));
        const currentDate = timestamp.toISOString().split('T')[0]; // YYYY-MM-DD
        
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
        
        this.logger.log(`Generando datos para ${sensores.length} sensores a las ${currentTime} con factor de uso ${usageFactor.toFixed(2)}`);
        
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
        
        this.logger.log(`Datos generados correctamente para: ${currentDate} ${currentTime}`);
      }
    } catch (error) {
      this.logger.error(`Error al generar mediciones falsas: ${error.message}`, error.stack);
    }
  }
  
  /**
   * Método para generar mediciones falsas bajo demanda.
   * Útil para pruebas o para generar datos históricos.
   */
  async generateFakeMedicionesOnDemand() {
    await this.generateHourlyMediciones();
    return { message: 'Mediciones generadas correctamente' };
  }
  
  /**
   * Método para generar mediciones históricas de las últimas 3 horas con intervalos de 15 minutos.
   * Útil para poblar datos de prueba cuando la aplicación inicia.
   */
  async generateHistoricalData() {
    try {
      this.logger.log('Generando datos históricos para las últimas 3 horas...');
      
      // Crear mediciones para las últimas 3 horas en intervalos de 15 minutos
      const sensores = await this.sensoresRepository.find();
      if (!sensores.length) {
        this.logger.warn('No se encontraron sensores para generar datos históricos');
        return;
      }
      
      const now = new Date();
      
      // Generar datos para las últimas 3 horas (12 intervalos de 15 minutos)
      for (let i = 0; i < 12; i++) {
        // Calcular fecha/hora para este intervalo (i intervalos de 15 minutos atrás)
        const timestamp = new Date(now.getTime() - (i * 15 * 60 * 1000));
        const date = timestamp.toISOString().split('T')[0];
        
        const hours = timestamp.getHours().toString().padStart(2, '0');
        const minutes = Math.floor(timestamp.getMinutes() / 15) * 15;
        const time = `${hours}:${minutes.toString().padStart(2, '0')}:00`;
        
        // Factor de uso basado en la hora
        const hour = timestamp.getHours();
        let usageFactor;
        
        if (hour >= 8 && hour < 18) {
          // Horas laborales (mayor consumo)
          usageFactor = 0.8 + (Math.random() * 0.4); // 0.8 - 1.2
        } else if ((hour >= 18 && hour < 22) || (hour >= 6 && hour < 8)) {
          // Mañana temprano y tarde/noche (consumo moderado)
          usageFactor = 0.6 + (Math.random() * 0.4); // 0.6 - 1.0
        } else {
          // Noche (bajo consumo)
          usageFactor = 0.3 + (Math.random() * 0.3); // 0.3 - 0.6
        }
        
        for (const sensor of sensores) {
          // Valores base aleatorios para cada sensor con variaciones por hora del día
          let voltageBase = 110 + (Math.random() * 20) * usageFactor;
          let currentBase = 5 + (Math.random() * 15) * usageFactor;
          
          // Asegurar que los valores estén dentro de límites razonables
          voltageBase = Math.max(100, Math.min(140, voltageBase));
          currentBase = Math.max(0.1, Math.min(30, currentBase));
          
          // Redondear a 2 decimales con ligeras variaciones para simular mediciones reales
          const voltaje = Math.round((voltageBase + (Math.random() * 2 - 1)) * 100) / 100;
          const corriente = Math.round((currentBase + (Math.random() * 0.5 - 0.25)) * 100) / 100;
          
          const medicion = this.medicionesRepository.create({
            sensorId: sensor.id,
            date,
            hora: time,
            voltaje,
            corriente,
          });
          
          await this.medicionesRepository.save(medicion);
        }
        
        this.logger.log(`Datos históricos generados para: ${date} ${time}`);
      }
      
      return { message: 'Datos históricos generados correctamente' };
    } catch (error) {
      this.logger.error(`Error al generar datos históricos: ${error.message}`, error.stack);
      throw error;
    }
  }
}
