import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sensor } from './entities/sensor.entity';
import { CreateSensorDto } from './dto/create-sensor.dto';
import { UpdateSensorDto } from './dto/update-sensor.dto';

@Injectable()
export class SensoresService {
  constructor(
    @InjectRepository(Sensor)
    private sensoresRepository: Repository<Sensor>,
  ) {}

  async create(createSensorDto: CreateSensorDto): Promise<Sensor> {
    const sensor = this.sensoresRepository.create(createSensorDto);
    return this.sensoresRepository.save(sensor);
  }

  async findAll(): Promise<Sensor[]> {
    return this.sensoresRepository.find({
      relations: ['area', 'area.centro'],
      order: {
        sensorUid: 'ASC',
      },
    });
  }

  async findByArea(areaId: number): Promise<Sensor[]> {
    return this.sensoresRepository.find({
      where: { areaId },
      relations: ['area', 'area.centro'],
    });
  }

  async findByCentro(centroId: number): Promise<Sensor[]> {
    // Since we need to filter by the centro.id, we need to use a query builder
    return this.sensoresRepository
      .createQueryBuilder('sensor')
      .leftJoinAndSelect('sensor.area', 'area')
      .leftJoinAndSelect('area.centro', 'centro')
      .where('centro.id = :centroId', { centroId })
      .getMany();
  }

  async findOne(id: number): Promise<Sensor> {
    const sensor = await this.sensoresRepository.findOne({
      where: { id },
      relations: ['area', 'area.centro'],
    });
    
    if (!sensor) {
      throw new NotFoundException(`Sensor con ID ${id} no encontrado`);
    }
    
    return sensor;
  }

  async update(id: number, updateSensorDto: UpdateSensorDto): Promise<Sensor> {
    const sensor = await this.findOne(id);
    
    this.sensoresRepository.merge(sensor, updateSensorDto);
    return this.sensoresRepository.save(sensor);
  }

  async remove(id: number): Promise<void> {
    const sensor = await this.findOne(id);
    
    await this.sensoresRepository.remove(sensor);
  }
}
