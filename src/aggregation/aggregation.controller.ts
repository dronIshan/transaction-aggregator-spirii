import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
} from '@nestjs/common';
import { AggregationService } from './aggregation.service';
import { SummaryResponseDto } from './dto/summary-response.dto';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PayoutRequestDto } from './dto/src/aggregation/dto/payout-request.dto';

@Controller('aggregation')
@ApiTags('Users')
@Controller('users')
export class AggregationController {
  private readonly logger = new Logger(AggregationController.name);

  constructor(private readonly agg: AggregationService) {}

  @Get(':id/summary')
  @ApiOperation({ summary: 'Get user summary' })
  @ApiParam({ name: 'id', example: 'u1', description: 'User ID' })
  @ApiOkResponse({ type: SummaryResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getSummary(@Param('id') id: string): Promise<SummaryResponseDto> {
    this.logger.log(`Summary request for ${id}`);
    const res = await this.agg.getUserSummary(id);
    this.logger.log(`Summary: ${JSON.stringify(res)}`);
    return res;
  }

  @Get('payouts/requests')
  @ApiOperation({ summary: 'List payout requests' })
  @ApiOkResponse({ type: [PayoutRequestDto] })
  async listRequests(): Promise<PayoutRequestDto[]> {
    this.logger.log('Payout requests list');
    const res = await this.agg.listPayoutRequests();
    this.logger.log(`Count: ${res.length}`);
    return res;
  }
}
