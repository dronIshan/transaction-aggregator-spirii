import { ApiProperty } from '@nestjs/swagger';

export class PayoutRequestDto {
  @ApiProperty({ description: 'User ID', example: 'u1' })
  userId: string;

  @ApiProperty({ description: 'Aggregated payout amount', example: 10 })
  totalRequestedPayout: number;
}
