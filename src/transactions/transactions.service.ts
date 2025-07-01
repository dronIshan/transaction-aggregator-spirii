import { Injectable, Logger } from '@nestjs/common';
import { MOCK_TRANSACTIONS } from './mock-transactions';
import { randomInt, randomUUID } from 'crypto';


export type TransactionType = 'earned' | 'spent' | 'payout';

export interface Transaction {
  id: string;
  userId: string;
  createdAt: Date;
  type: TransactionType;
  amount: number;
}

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);
  private readonly types: TransactionType[] = ['earned', 'spent', 'payout'];

 async fetchTransactions(start: Date, end: Date): Promise<Transaction[]> {
    this.logger.log(`Fetching transactions from ${start.toISOString()} to ${end.toISOString()}`);
    const msRange = end.getTime() - start.getTime();
    const count = randomInt(5, 20); 
    const txs: Transaction[] = [];
    for (let i = 0; i < count; i++) {
      const timestamp = start.getTime() + randomInt(0, msRange);
      const createdAt = new Date(timestamp);
      const type = this.types[randomInt(0, this.types.length)];
      const amount = parseFloat((Math.random() * 100).toFixed(2));
      const userId = `u${randomInt(1, 6)}`; 
      txs.push({
        id: randomUUID(),
        userId,
        createdAt,
        type,
        amount,
      });
    }
    this.logger.log(`Generated ${txs.length} transactions`);
    return txs;
  }
}
