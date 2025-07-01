import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { randomInt, randomUUID } from 'crypto';

export interface Transaction {
  id: string;
  userId: string;
  createdAt: Date;
  type: TransactionType;
  amount: number;
}

export type TransactionType = 'earned' | 'spent' | 'payout';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);
  private readonly types: TransactionType[] = ['earned', 'spent', 'payout'];
  private callTimestamps: number[] = [];

  async fetchTransactions(start: Date, end: Date): Promise<Transaction[]> {
    const now = Date.now();
    // Remove timestamps older than 1 minute
    this.callTimestamps = this.callTimestamps.filter((ts) => now - ts < 60_000);
    if (this.callTimestamps.length >= 5) {
      this.logger.warn('Rate limit exceeded');
      throw new HttpException(
        'Rate limit exceeded',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    this.callTimestamps.push(now);

    this.logger.log(
      `Generating up to 1000 transactions between ${start.toISOString()} and ${end.toISOString()}`,
    );
    const msRange = end.getTime() - start.getTime() || 1;
    const count = randomInt(1, 1001); // 1 to 1000
    const txs: Transaction[] = [];

    for (let i = 0; i < count; i++) {
      const timestamp = start.getTime() + randomInt(0, msRange);
      txs.push({
        id: randomUUID(),
        userId: `u${randomInt(1, 6)}`,
        createdAt: new Date(timestamp),
        type: this.types[randomInt(0, this.types.length)],
        amount: parseFloat((Math.random() * 100).toFixed(2)),
      });
    }

    this.logger.log(`Generated ${txs.length} transactions`);
    return txs;
  }
}
