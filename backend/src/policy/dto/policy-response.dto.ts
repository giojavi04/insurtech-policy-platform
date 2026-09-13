import { ApiProperty } from '@nestjs/swagger';

export class PolicyResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  quoteId!: string;

  @ApiProperty({ example: 'ACTIVE' })
  status!: string;

  @ApiProperty()
  issuedAt!: string;
}
