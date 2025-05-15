import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicionesService } from './mediciones.service';
import { MedicionesController } from './mediciones.controller';
import { Medicion } from './entities/medicion.entity';
import { SensoresModule } from '../sensores/sensores.module';
import { CentrosModule } from '../centros/centros.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Medicion]),
    SensoresModule,
    CentrosModule
  ],
  controllers: [MedicionesController],
  providers: [MedicionesService],
  exports: [MedicionesService],
})
export class MedicionesModule {}
