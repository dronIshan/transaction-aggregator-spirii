import { PartialType } from '@nestjs/swagger';
import { CreateAggregationDto } from './create-aggregation.dto';

export class UpdateAggregationDto extends PartialType(CreateAggregationDto) {}
