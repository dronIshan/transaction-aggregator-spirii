import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  TransactionsService,
} from 'src/transactions/transactions.service';
import { Cron } from '@nestjs/schedule';
import { AggregationStore } from './data-store.interface';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { TransactionType } from 'src/transactions/transaction.model';
export interface Transaction {
  id: string;
  userId: string;
  createdAt: Date;
  type: TransactionType;
  amount: number;
}

@Injectable()
@Injectable()
export class AggregationService {
  private readonly logger = new Logger(AggregationService.name);

  constructor(
    private readonly http: HttpService,
    @Inject('AGG_STORE') private readonly store: AggregationStore,
  ) {}

  @Cron('*/1 * * * *')
  async handleCron() {
    this.logger.debug('Starting aggregation');
    const end = new Date();
    const start = new Date(end.getTime() - 2 * 60_000);
    const params = {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
    this.logger.log(`Calling external API with ${JSON.stringify(params)}`);
    const response$ = this.http.get<{ items: Transaction[] }>(
      'http://localhost:3000/transactions',
      { params },
    );
    const { data } = await lastValueFrom(response$);
    this.logger.log(`Fetched ${data.items.length} transactions`);
    await this.aggregateBatch(data.items);
  }

  private async aggregateBatch(txs: Transaction[]) {
    for (const tx of txs) {
      const key = `user:${tx.userId}`;
      await this.store.increment(key, tx.type, tx.amount);
      if (tx.type === 'payout') {
        await this.store.increment(key, 'paidOut', tx.amount);
      }
      const rec = await this.store.getAll(key);
      const earned = +rec.earned || 0;
      const spent = +rec.spent || 0;
      const paidOut = +rec.paidOut || 0;
      const balance = earned - spent - paidOut;
      await this.store.increment(key, 'balance', balance - (+rec.balance || 0));
    }
    this.logger.debug('Aggregation complete');
  }

  async getUserSummary(userId: string) {
    this.logger.log(`Fetching summary for ${userId}`);
    const rec = await this.store.getAll(`user:${userId}`);
    return {
      balance: +rec.balance || 0,
      earned: +rec.earned || 0,
      spent: +rec.spent || 0,
      payout: +rec.payout || 0,
      paidOut: +rec.paidOut || 0,
    };
  }

  async listPayoutRequests() {
    this.logger.log('List payout requests');
    const out: Array<{ userId: string; totalRequestedPayout: number }> = [];
    for await (const key of this.store.keys('user:*')) {
      const rec = await this.store.getAll(key);
      const p = +rec.payout || 0;
      if (p > 0)
        out.push({ userId: key.split(':')[1], totalRequestedPayout: p });
    }
    this.logger.log(`Found ${out.length} payout requests`);
    return out;
  }
}
