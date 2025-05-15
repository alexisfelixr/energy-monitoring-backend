import { PartialType } from '@nestjs/swagger';
import { CreateMedicionDto } from './create-medicion.dto';

export class UpdateMedicionDto extends PartialType(CreateMedicionDto) {}
