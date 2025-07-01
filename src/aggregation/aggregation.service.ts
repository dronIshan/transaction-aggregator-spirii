import { Injectable } from '@nestjs/common';
import { CreateAggregationDto } from './dto/create-aggregation.dto';
import { UpdateAggregationDto } from './dto/update-aggregation.dto';

@Injectable()
export class AggregationService {
  create(createAggregationDto: CreateAggregationDto) {
    return 'This action adds a new aggregation';
  }

  findAll() {
    return `This action returns all aggregation`;
  }

  findOne(id: number) {
    return `This action returns a #${id} aggregation`;
  }

  update(id: number, updateAggregationDto: UpdateAggregationDto) {
    return `This action updates a #${id} aggregation`;
  }

  remove(id: number) {
    return `This action removes a #${id} aggregation`;
  }
}
