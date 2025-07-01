import { Controller, Get, Query, Logger } from '@nestjs/common';
import { TransactionsService } from './transactions.service';

import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiOkResponse,
} from '@nestjs/swagger';
import { TransactionsResponseDto } from './dto/transactions-response.dto';



@ApiTags('Transactions API')
@Controller('transactions')
export class TransactionsController {
  private readonly logger = new Logger(TransactionsController.name);

  constructor(private readonly txService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'Fetch transactions within a date range' })
  @ApiQuery({ name: 'startDate', example: '2023-02-01T00:00:00Z' })
  @ApiQuery({ name: 'endDate', example: '2023-02-01T02:00:00Z' })
  @ApiOkResponse({ type: TransactionsResponseDto })
  async list(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<TransactionsResponseDto> {
    this.logger.log(`List request: start=${startDate}, end=${endDate}`);
    const start = new Date(startDate);
    const end = new Date(endDate);
    const items = await this.txService.fetchTransactions(start, end);
    const meta = {
      totalItems: items.length,
      itemCount: items.length,
      itemsPerPage: items.length,
      totalPages: 1,
      currentPage: 1,
    };
    this.logger.log(`Returning ${items.length} items`);
    return { items, meta };
  }
}
