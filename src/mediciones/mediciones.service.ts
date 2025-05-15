import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Medicion } from './entities/medicion.entity';
import { CreateMedicionDto } from './dto/create-medicion.dto';
import { UpdateMedicionDto } from './dto/update-medicion.dto';
import { FilterMedicionesDto } from './dto/filter-mediciones.dto';
import { SensoresService } from '../sensores/sensores.service';
import { CentrosService } from '../centros/centros.service';

@Injectable()
export class MedicionesService {
  private readonly logger = new Logger(MedicionesService.name);
  constructor(
    @InjectRepository(Medicion)
    private medicionesRepository: Repository<Medicion>,
    private readonly sensoresService: SensoresService,
    private readonly centrosService: CentrosService,
  ) {}

  async create(createMedicionDto: CreateMedicionDto): Promise<Medicion> {
    const medicion = this.medicionesRepository.create(createMedicionDto);
    return this.medicionesRepository.save(medicion);
  }

  async findAll(filterDto: FilterMedicionesDto = {}): Promise<Medicion[]> {
    const { sensorId, fechaInicio, fechaFin } = filterDto;
    
    let queryBuilder = this.medicionesRepository
      .createQueryBuilder('medicion')
      .leftJoinAndSelect('medicion.sensor', 'sensor')
      .leftJoinAndSelect('sensor.area', 'area')
      .leftJoinAndSelect('area.centro', 'centro');
    
    if (sensorId) {
      queryBuilder = queryBuilder.andWhere('sensor.id = :sensorId', { sensorId });
    }
    
    if (fechaInicio && fechaFin) {
      queryBuilder = queryBuilder.andWhere('medicion.date BETWEEN :fechaInicio AND :fechaFin', {
        fechaInicio,
        fechaFin,
      });
    } else if (fechaInicio) {
      queryBuilder = queryBuilder.andWhere('medicion.date >= :fechaInicio', { fechaInicio });
    } else if (fechaFin) {
      queryBuilder = queryBuilder.andWhere('medicion.date <= :fechaFin', { fechaFin });
    }
    
    return queryBuilder.orderBy('medicion.date', 'ASC').addOrderBy('medicion.hora', 'ASC').getMany();
  }

  async findBySensor(sensorId: number, fecha?: string): Promise<Medicion[]> {
    const where: any = { sensorId };
    
    if (fecha) {
      where.date = fecha; // Use 'date' as that's the property name in the entity
    }
    
    return this.medicionesRepository.find({
      where,
      relations: ['sensor'],
      order: {
        date: 'ASC', // Use 'date' property from the entity
        hora: 'ASC',
      },
    });
  }
  
  // New method to find measurements for a sensor from a specific date
  async findBySensorDesde(sensorId: number, desde: Date): Promise<Medicion[]> {
    // Format date to compare with fecha field (assuming fecha is YYYY-MM-DD format)
    const fechaDesde = desde.toISOString().split('T')[0];
    const horaDesde = desde.toTimeString().substring(0, 8); // HH:MM:SS format
    
    return this.medicionesRepository
      .createQueryBuilder('medicion')
      .where('medicion.sensorId = :sensorId', { sensorId })
      .andWhere(
        // Compare by date and time to get all records after 'desde'
        '(medicion.date > :fechaDesde OR (medicion.date = :fechaDesde AND medicion.hora >= :horaDesde))',
        { fechaDesde, horaDesde }
      )
      .orderBy('medicion.date', 'ASC')
      .addOrderBy('medicion.hora', 'ASC')
      .getMany();
  }

  async getResumenPorSensor(sensorId: number, fecha?: string): Promise<any> {
    const mediciones = await this.findBySensor(sensorId, fecha);
    
    if (mediciones.length === 0) {
      return {
        sensorId,
        fecha,
        promedioVoltaje: 0,
        promedioCorriente: 0,
        potenciaTotal: 0,
        energiaConsumidaTotal: 0,
      };
    }
    
    const voltajes = mediciones.map(m => m.voltaje);
    const corrientes = mediciones.map(m => m.corriente);
    
    const promedioVoltaje = voltajes.reduce((a, b) => a + b, 0) / voltajes.length;
    const promedioCorriente = corrientes.reduce((a, b) => a + b, 0) / corrientes.length;
    
    // Potencia total (V * A)
    const potenciaTotal = mediciones.reduce((total, m) => total + (m.voltaje * m.corriente), 0);
    
    // Energía consumida total (calculada como voltaje * corriente / 1000 para obtener kWh)
    const energiaConsumidaTotal = mediciones.reduce((total, m) => total + (m.voltaje * m.corriente / 1000), 0);
    
    return {
      sensorId,
      fecha: fecha || 'todas',
      promedioVoltaje,
      promedioCorriente,
      potenciaTotal,
      energiaConsumidaTotal,
    };
  }
  
  // New method to get sensor summary from a specific date
  async getResumenPorSensorDesde(sensorId: number, desde: Date): Promise<any> {
    const mediciones = await this.findBySensorDesde(sensorId, desde);
    
    if (mediciones.length === 0) {
      return {
        sensorId,
        desde: desde.toISOString(),
        promedioVoltaje: 0,
        promedioCorriente: 0,
        potenciaTotal: 0,
        energiaConsumidaTotal: 0,
      };
    }
    
    const voltajes = mediciones.map(m => m.voltaje);
    const corrientes = mediciones.map(m => m.corriente);
    
    const promedioVoltaje = voltajes.reduce((a, b) => a + b, 0) / voltajes.length;
    const promedioCorriente = corrientes.reduce((a, b) => a + b, 0) / corrientes.length;
    
    // Potencia total (V * A)
    const potenciaTotal = mediciones.reduce((total, m) => total + (m.voltaje * m.corriente), 0);
    
    // Energía consumida total (calculada como voltaje * corriente / 1000 para obtener kWh)
    const energiaConsumidaTotal = mediciones.reduce((total, m) => total + (m.voltaje * m.corriente / 1000), 0);
    
    return {
      sensorId,
      desde: desde.toISOString(),
      promedioVoltaje,
      promedioCorriente,
      potenciaTotal,
      energiaConsumidaTotal,
    };
  }

  async findOne(id: number): Promise<Medicion> {
    const medicion = await this.medicionesRepository.findOne({
      where: { id },
      relations: ['sensor', 'sensor.area', 'sensor.area.centro'],
    });
    
    if (!medicion) {
      throw new NotFoundException(`Medición con ID ${id} no encontrada`);
    }
    
    return medicion;
  }

  async update(id: number, updateMedicionDto: UpdateMedicionDto): Promise<Medicion> {
    const medicion = await this.findOne(id);
    
    this.medicionesRepository.merge(medicion, updateMedicionDto);
    return this.medicionesRepository.save(medicion);
  }

  // Método para obtener todos los datos de monitoreo de un centro
  async getCentroMonitoringData(centroId: number, desde?: string, timezoneOffset?: string): Promise<any> {
    // Obtener la fecha actual y ajustar por la zona horaria del cliente
    let desdeDate: Date;
    let clientNow: Date; // La hora actual del cliente para filtrar datos futuros
    
    // Paso 1: Calcular la hora actual del cliente
    const serverNow = new Date();
    
    if (timezoneOffset) {
      // El offset viene en minutos
      const offsetMinutes = parseInt(timezoneOffset, 10);
      
      // Calcular la diferencia entre la zona horaria del servidor y la del cliente
      const serverOffset = serverNow.getTimezoneOffset();
      const clientOffset = offsetMinutes;
      const offsetDiff = serverOffset - clientOffset; // Diferencia en minutos
      
      // Ajustar la hora actual según la zona horaria del cliente
      clientNow = new Date(serverNow.getTime() + (offsetDiff * 60 * 1000));
    } else {
      // Si no hay offset, usar la hora del servidor
      clientNow = new Date(serverNow);
    }
    
    // Paso 2: Determinar la fecha "desde" para la consulta
    if (desde) {
      // Si se proporciona una fecha/hora específica, usarla
      desdeDate = new Date(desde);
    } else {
      // Si no se proporciona fecha, calcular 3 horas atrás desde la hora actual del cliente
      desdeDate = new Date(clientNow.getTime() - (3 * 60 * 60 * 1000));
    }
        
    // Formatear la fecha para las consultas en la base de datos
    const fechaDesde = desdeDate.toISOString().split('T')[0]; // YYYY-MM-DD
    const horaDesde = desdeDate.toTimeString().substring(0, 8); // HH:MM:SS
    
    // Verificar que el centro existe
    const centro = await this.centrosService.findOne(centroId);
    if (!centro) {
      throw new NotFoundException(`Centro con ID ${centroId} no encontrado`);
    }
    
    // Obtener todos los sensores asociados al centro
    const sensores = await this.sensoresService.findByCentro(centroId);
    
    // Formatear la hora actual del cliente para comparar con los registros
    const clientNowFormatted = {
      fecha: clientNow.toISOString().split('T')[0],
      hora: clientNow.toTimeString().substring(0, 8)
    };
        
    // Variables para almacenar los datos consolidados
    const voltajeCorrienteSeries: Array<{fecha: string, hora: string, voltaje: number, corriente: number}> = [];
    const dispositivos: Array<{id: number, nombre: string, estado: string, ultimaActualizacion: string, consumo: number}> = [];
    const energiaPorDispositivo: Array<{nombre: string, valor: number}> = [];
    let consumoTotal = 0;
    
    // Procesar datos para cada sensor
    for (const sensor of sensores) {
      // Para adaptar a la estructura esperada en frontend, asignamos propiedades faltantes
      const sensorNombre = sensor.sensorUid || `Sensor ${sensor.id}`; // Mapear sensorUid a nombre
      const sensorEstado = 'activo'; // Por defecto asumimos activo
      
      // Obtener mediciones recientes para el sensor desde la fecha indicada
      const todasMediciones = await this.findBySensorDesde(sensor.id, desdeDate);
      
      // Filtrar para eliminar mediciones con fecha/hora futura respecto al cliente
      const mediciones = todasMediciones.filter(m => {
        // Convertir la fecha a string si es un objeto Date
        const medicionFecha = typeof m.date === 'object' ? 
          m.date.toISOString().split('T')[0] : String(m.date);
        
        // Si son de días anteriores, incluirlas
        if (medicionFecha < clientNowFormatted.fecha) return true;
        
        // Si son del mismo día, verificar la hora
        if (medicionFecha === clientNowFormatted.fecha) {
          return m.hora <= clientNowFormatted.hora;
        }
        
        // Excluir fechas futuras
        return false;
      });
            
      if (mediciones.length > 0) {
        // Si es el primer sensor, usar sus datos para el gráfico de voltaje y corriente
        if (voltajeCorrienteSeries.length === 0) {
          voltajeCorrienteSeries.push(...mediciones.map(m => ({
            fecha: String(m.date), // Convertir directamente a string, ya que puede ser un string o un objeto Date
            hora: m.hora,
            voltaje: m.voltaje,
            corriente: m.corriente
          })));
        }
        
        // Calcular consumo de energía como voltaje * corriente (simulación)
        const calcularEnergiaConsumida = (m) => m.voltaje * m.corriente / 1000; // kWh simplificado
        
        // Última medición para información del dispositivo
        const ultimaMedicion = mediciones[mediciones.length - 1];
        const energiaConsumida = calcularEnergiaConsumida(ultimaMedicion);
        
        dispositivos.push({
          id: sensor.id,
          nombre: sensorNombre,
          estado: sensorEstado,
          ultimaActualizacion: `${String(ultimaMedicion.date)}T${ultimaMedicion.hora}`,
          consumo: energiaConsumida
        });
        
        // Calcular energía total consumida por el sensor
        const energiaTotal = mediciones.reduce((total, m) => total + calcularEnergiaConsumida(m), 0);
        
        // Agregar datos de energía por dispositivo
        energiaPorDispositivo.push({
          nombre: sensorNombre,
          valor: parseFloat(energiaTotal.toFixed(1))
        });
        
        consumoTotal += energiaTotal;
      }
    }
    
    // Calcular la eficiencia basada en alguna lógica de negocio
    // (Esta es una fórmula de ejemplo, debería adaptarse según requerimientos reales)
    const eficiencia = Math.min(98, Math.max(85, Math.round(100 - (consumoTotal / (sensores.length || 1) * 2))));
    
    // Generar distribución de consumo por tipo (esto es un ejemplo, idealmente vendría de los datos reales)
    const consumoPorTipo = [
      { nombre: "Lighting", valor: Math.round(consumoTotal * 0.25) },
      { nombre: "HVAC", valor: Math.round(consumoTotal * 0.40) },
      { nombre: "Equipment", valor: Math.round(consumoTotal * 0.35) }
    ];
    
    // Preparar y devolver la respuesta consolidada
    return {
      centroId,
      centroNombre: centro.nombre,
      consumoTotal: parseFloat(consumoTotal.toFixed(1)),
      eficiencia,
      voltajeCorrienteSeries,
      dispositivos,
      energiaPorDispositivo,
      consumoPorTipo
    };
  }

  /**
   * Obtiene datos históricos diarios para centros, sensores y áreas.
   * Los datos se agrupan por día y se calculan promedios diarios de voltaje y corriente.
   */
  async getDatosHistoricos(
    startDate?: string,
    endDate?: string,
    centroId?: string,
    areaId?: string,
    sensorId?: string
  ) {

    try {
      // Establecer fechas predeterminadas si no se proporcionan
      const hoy = new Date();
      const fechaFin = endDate ? new Date(endDate) : hoy;
      const fechaInicio = startDate 
        ? new Date(startDate) 
        : new Date(hoy.getTime() - (10 * 24 * 60 * 60 * 1000)); // 10 días atrás por defecto
      
      this.logger.log(`Consultando datos históricos desde ${fechaInicio.toISOString()} hasta ${fechaFin.toISOString()}`);
      
      let query = this.medicionesRepository.createQueryBuilder('medicion')
      .leftJoinAndSelect('medicion.sensor', 'sensor')
      .leftJoinAndSelect('sensor.area', 'area')
      .leftJoinAndSelect('area.centro', 'centro')
      .select([
        'DATE(medicion.date) as fecha',
        'AVG(medicion.voltaje) as voltajePromedio',
        'AVG(medicion.corriente) as corrientePromedio'
      ])
      .groupBy('DATE(medicion.date)')
      .where('medicion.date >= :fechaInicio', { fechaInicio: fechaInicio.toISOString().split('T')[0] })
      .andWhere('medicion.date <= :fechaFin', { fechaFin: fechaFin.toISOString().split('T')[0] });
    
      // Aplicar filtros adicionales si se proporcionan
      if (centroId) {
        query = query.andWhere('centro.id = :centroId', { centroId });
      }
      
      if (areaId) {
        query = query.andWhere('area.id = :areaId', { areaId });
      }
      
      if (sensorId) {
        query = query.andWhere('sensor.id = :sensorId', { sensorId });
      }

      const medicionesPorDia = await query.getRawMany();
      const fechaInicioString = fechaInicio.toISOString().split('T')[0];
      const fechaFinString = fechaFin.toISOString().split('T')[0];
      
      let query2 = this.medicionesRepository.createQueryBuilder('medicion')
      .leftJoinAndSelect('medicion.sensor', 'sensor')
      .leftJoinAndSelect('sensor.area', 'area')
      .leftJoinAndSelect('area.centro', 'centro')
      .select([
        'DATE(medicion.date) as fecha',
        'centro.id as centroId',
        'centro.nombre as centroNombre',
        'area.id as areaId',
        'area.nombre as areaNombre',
        'sensor.id as sensorId',
        'sensor.sensorUid as sensorUid',
        'AVG(medicion.voltaje) as voltajePromedio',
        'AVG(medicion.corriente) as corrientePromedio',
        'AVG(medicion.voltaje * medicion.corriente / 1000) as consumoPromedio'
      ])
      .groupBy('DATE(medicion.date), centro.id, area.id, sensor.id')
      .where('DATE(medicion.date) >= :fechaInicio', { fechaInicio: fechaInicioString })
      .andWhere('DATE(medicion.date) <= :fechaFin', { fechaFin: fechaFinString })
      .orderBy('fecha', 'DESC');

      // Aplicar filtros adicionales manualmente
      if (centroId) {
        query2 = query2.andWhere('centro.id = :centroId', { centroId });
      }
      
      if (areaId) {
        query2 = query2.andWhere('area.id = :areaId', { areaId });
      }
      
      if (sensorId) {
        query2 = query2.andWhere('sensor.id = :sensorId', { sensorId });
      }

      const medicionesHistorial = await query2.getRawMany();

      return {
        medicionesPorDia,
        medicionesHistorial,
      }
     
    } catch (error) {
      this.logger.error(`Error al obtener datos históricos: ${error.message}`, error.stack);
      throw new Error(`Error al obtener datos históricos: ${error.message}`);
    }
  }
}
