import { Module, Provider } from '@nestjs/common';
import { AggregationService } from './aggregation.service';
import { AggregationController } from './aggregation.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { TransactionsModule } from 'src/transactions/transactions.module';
import { InMemoryStore } from './in-memory-store';
import { HttpModule } from '@nestjs/axios';

const storeProvider: Provider = {
  provide: 'AGG_STORE',
  useClass: InMemoryStore,
};
@Module({
  imports: [HttpModule,ScheduleModule.forRoot(), TransactionsModule],
  controllers: [AggregationController],
  providers: [storeProvider, AggregationService],
})
export class AggregationModule {}
