import { ApiProperty } from '@nestjs/swagger';

export class QuoteInputsDto {
  @ApiProperty()
  insuranceType!: string;

  @ApiProperty()
  coverage!: string;

  @ApiProperty()
  age!: number;

  @ApiProperty()
  location!: string;
}

export class PremiumBreakdownItemDto {
  @ApiProperty()
  concept!: string;

  @ApiProperty()
  amount!: string;
}

export class QuoteResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'QUOTED' })
  status!: string;

  @ApiProperty({ type: QuoteInputsDto })
  inputs!: QuoteInputsDto;

  @ApiProperty()
  estimatedPremium!: string;

  @ApiProperty({ type: [PremiumBreakdownItemDto] })
  breakdown!: PremiumBreakdownItemDto[];

  @ApiProperty()
  createdAt!: string;
}
