import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty } from 'class-validator';

// Definido por el contrato del ejercicio: exactamente estos tres códigos.
const INSURANCE_TYPE_CODES = ['AUTO', 'SALUD', 'HOGAR'] as const;
export type InsuranceTypeCode = (typeof INSURANCE_TYPE_CODES)[number];

export class GetCoveragesQueryDto {
  @ApiProperty({ enum: INSURANCE_TYPE_CODES })
  @IsNotEmpty()
  @IsIn(INSURANCE_TYPE_CODES)
  insuranceType!: InsuranceTypeCode;
}
