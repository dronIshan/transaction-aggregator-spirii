import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { Transaction } from './entities/transaction.entity';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

class TransactionsResponse {
  items: Transaction[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}


@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly txService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'Fetch transactions within a date range' })
  @ApiQuery({ name: 'startDate', example: '2023-02-01 00:00:00' })
  @ApiQuery({ name: 'endDate',   example: '2023-02-01 02:00:00' })
  @ApiOkResponse({ type: TransactionsResponse })
  async list(
    @Query('startDate') startDate: string,
    @Query('endDate')   endDate: string,
  ): Promise<TransactionsResponse> {
    const start = new Date(startDate);
    const end   = new Date(endDate);
    const items = await this.txService.fetchTransactions(start, end);
    const meta = {
      totalItems: items.length,
      itemCount: items.length,
      itemsPerPage: items.length,
      totalPages: 1,
      currentPage: 1,
    };
    return { items, meta };
  }
}