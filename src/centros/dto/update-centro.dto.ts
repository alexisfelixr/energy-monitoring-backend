import { PartialType } from '@nestjs/swagger';
import { CreateCentroDto } from './create-centro.dto';

export class UpdateCentroDto extends PartialType(CreateCentroDto) {}
