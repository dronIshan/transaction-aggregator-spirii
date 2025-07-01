// src/aggregation/aggregation.service.ts

import {
  Inject,
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

import { AggregationStore } from './data-store.interface';
import { Transaction } from '../transactions/transaction.model';

@Injectable()
export class AggregationService {
  private readonly logger = new Logger(AggregationService.name);
  private readonly apiUrl?: string;
  private readonly txnLimit: number;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
    @Inject('AGG_STORE') private readonly store: AggregationStore,
  ) {
    this.apiUrl = this.config.get<string>('TRANSACTION_API_URL');
    if (!this.apiUrl) {
      this.logger.error(
        'TRANSACTION_API_URL is not defined in environment; aggregation will be skipped',
      );
    }

    const lim = this.config.get<number>('TRANSACTION_API_LIMIT');
    this.txnLimit = typeof lim === 'number' && lim > 0 ? lim : 1000;
    this.logger.log(`Using transaction fetch limit: ${this.txnLimit}`);
  }

  @Cron('*/1 * * * *')
  async handleCron() {
    this.logger.debug('Starting aggregation cron job');

    if (!this.apiUrl) {
      this.logger.error('Missing TRANSACTION_API_URL; aborting aggregation');
      return;
    }
    const apiUrl = this.apiUrl;

    const end = new Date();
    const start = new Date(end.getTime() - 2 * 60_000);
    const params = {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };

    this.logger.log(
      `Calling ${apiUrl}/transactions with ${JSON.stringify(params)}`,
    );

    let items: Transaction[];
    try {
      const response$ = this.http.get<{ items: Transaction[] }>(
        `${apiUrl}/transactions`,
        { params },
      );
      const response = await lastValueFrom(response$);
      items = response.data.items;
      this.logger.log(`Fetched ${items.length} transactions`);

      if (items.length >= this.txnLimit) {
        this.logger.warn(
          `Received ${items.length} transactions (>= limit ${this.txnLimit}). ` +
            `There may be more to fetch in this window.`,
        );
      }
    } catch (err: any) {
      if (
        err instanceof HttpException &&
        err.getStatus() === HttpStatus.TOO_MANY_REQUESTS
      ) {
        this.logger.error('Rate limit exceeded when calling transactions API');
      } else {
        this.logger.error(`Failed to fetch transactions: ${err.message}`);
      }
      return;
    }

    await this.aggregateBatch(items);
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

      const oldBal = +rec.balance || 0;
      if (balance !== oldBal) {
        await this.store.increment(key, 'balance', balance - oldBal);
      }
    }
    this.logger.debug('Aggregation batch complete');
  }

  async getUserSummary(userId: string) {
    this.logger.log(`Fetching summary for user ${userId}`);
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
    this.logger.log('Listing payout requests');
    const out: Array<{ userId: string; totalRequestedPayout: number }> = [];
    for await (const key of this.store.keys('user:*')) {
      const rec = await this.store.getAll(key);
      const p = +rec.payout || 0;
      if (p > 0) {
        out.push({ userId: key.split(':')[1], totalRequestedPayout: p });
      }
    }
    this.logger.log(`Found ${out.length} payout requests`);
    return out;
  }
}
