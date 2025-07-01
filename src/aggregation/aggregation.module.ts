import { Module } from '@nestjs/common';
import { AggregationService } from './aggregation.service';
import { AggregationController } from './aggregation.controller';

@Module({
  controllers: [AggregationController],
  providers: [AggregationService],
})
export class AggregationModule {}
