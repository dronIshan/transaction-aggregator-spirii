import { ApiProperty } from '@nestjs/swagger';

export class SummaryResponseDto {
  @ApiProperty({ description: 'Current balance', example: 12.34 })
  balance: number;

  @ApiProperty({ description: 'Total earned', example: 50 })
  earned: number;

  @ApiProperty({ description: 'Total spent', example: 37.66 })
  spent: number;

  @ApiProperty({ description: 'Total payout requested', example: 10 })
  payout: number;

  @ApiProperty({ description: 'Total paid out', example: 5 })
  paidOut: number;
}
