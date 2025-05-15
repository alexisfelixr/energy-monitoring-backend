import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FakeMedicionesService } from './fake-mediciones.service';
import { GeneratorsController } from './generators.controller';
import { Medicion } from '../mediciones/entities/medicion.entity';
import { Sensor } from '../sensores/entities/sensor.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Medicion, Sensor]),
  ],
  controllers: [GeneratorsController],
  providers: [FakeMedicionesService],
  exports: [FakeMedicionesService],
})
export class GeneratorsModule {}
