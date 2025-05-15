import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Centro } from './entities/centro.entity';
import { CreateCentroDto } from './dto/create-centro.dto';
import { UpdateCentroDto } from './dto/update-centro.dto';

@Injectable()
export class CentrosService {
  constructor(
    @InjectRepository(Centro)
    private centrosRepository: Repository<Centro>,
  ) {}

  async create(createCentroDto: CreateCentroDto): Promise<Centro> {
    const centro = this.centrosRepository.create(createCentroDto);
    return this.centrosRepository.save(centro);
  }

  async findAll(): Promise<Centro[]> {
    return this.centrosRepository.find();
  }

  async findOne(id: number): Promise<Centro> {
    const centro = await this.centrosRepository.findOne({
      where: { id },
      relations: ['areas'],
    });
    
    if (!centro) {
      throw new NotFoundException(`Centro con ID ${id} no encontrado`);
    }
    
    return centro;
  }

  async update(id: number, updateCentroDto: UpdateCentroDto): Promise<Centro> {
    const centro = await this.findOne(id);
    
    this.centrosRepository.merge(centro, updateCentroDto);
    return this.centrosRepository.save(centro);
  }

  async remove(id: number): Promise<void> {
    const centro = await this.findOne(id);
    
    await this.centrosRepository.remove(centro);
  }
}
