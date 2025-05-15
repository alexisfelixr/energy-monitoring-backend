import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

// Módulos de la aplicación
import { CentrosModule } from './centros/centros.module';
import { AreasModule } from './areas/areas.module';
import { SensoresModule } from './sensores/sensores.module';
import { MedicionesModule } from './mediciones/mediciones.module';
import { GeneratorsModule } from './generators/generators.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      autoLoadEntities: true,
      synchronize: false, // No sincronizar automáticamente en producción
    }),
    CentrosModule,
    AreasModule,
    SensoresModule,
    MedicionesModule,
    GeneratorsModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
