export type TransactionType = 'earned' | 'spent' | 'payout';

export interface Transaction {
  id: string;
  userId: string;
  createdAt: Date;
  type: TransactionType;
  amount: number;
}
