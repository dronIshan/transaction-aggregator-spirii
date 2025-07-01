import { ApiProperty } from '@nestjs/swagger';
import { Transaction } from '../transaction.model';

export class TransactionsResponseDto {
  items: Transaction[];

  @ApiProperty({
    description: 'Metadata about the paginated response',
    example: {
      totalItems: 10,
      itemCount: 10,
      itemsPerPage: 10,
      totalPages: 1,
      currentPage: 1,
    },
  })
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}
