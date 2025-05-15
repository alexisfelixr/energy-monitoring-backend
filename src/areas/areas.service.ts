import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Area } from './entities/area.entity';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';

@Injectable()
export class AreasService {
  constructor(
    @InjectRepository(Area)
    private areasRepository: Repository<Area>,
  ) {}

  async create(createAreaDto: CreateAreaDto): Promise<Area> {
    const area = this.areasRepository.create(createAreaDto);
    return this.areasRepository.save(area);
  }

  // obtener ordenados por nombre
  async findAll(): Promise<Area[]> {
    return this.areasRepository.find({
      relations: ['centro'],
      order: {
        nombre: 'ASC',
      },
    });
  }

  async findByCentro(centroId: number): Promise<Area[]> {
    return this.areasRepository.find({
      where: { centroId },
      relations: ['centro'],
    });
  }

  async findOne(id: number): Promise<Area> {
    const area = await this.areasRepository.findOne({
      where: { id },
      relations: ['centro', 'sensores'],
    });
    
    if (!area) {
      throw new NotFoundException(`Área con ID ${id} no encontrada`);
    }
    
    return area;
  }

  async update(id: number, updateAreaDto: UpdateAreaDto): Promise<Area> {
    const area = await this.findOne(id);
    
    this.areasRepository.merge(area, updateAreaDto);
    return this.areasRepository.save(area);
  }

  async remove(id: number): Promise<void> {
    const area = await this.findOne(id);
    
    await this.areasRepository.remove(area);
  }
}
