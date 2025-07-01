import { Injectable } from '@nestjs/common';
import { MOCK_TRANSACTIONS } from './mock-transactions';

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
   async fetchTransactions(start: Date, end: Date): Promise<Transaction[]> {
    return MOCK_TRANSACTIONS.filter(
      tx => tx.createdAt >= start && tx.createdAt <= end,
    );
  }
}
