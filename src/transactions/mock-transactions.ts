import { Transaction, TransactionType } from './transactions.service';

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', userId: 'u1', createdAt: new Date('2023-02-01T00:10:00Z'), type: 'earned', amount: 5 },
  { id: '2', userId: 'u1', createdAt: new Date('2023-02-01T00:20:00Z'), type: 'spent',  amount: 2 },
  { id: '3', userId: 'u2', createdAt: new Date('2023-02-01T01:00:00Z'), type: 'payout', amount: 10 },
];