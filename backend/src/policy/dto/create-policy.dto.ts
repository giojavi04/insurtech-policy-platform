import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreatePolicyDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID('4')
  quoteId!: string;
}
