import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

// Definido por el contrato del ejercicio: exactamente estos códigos.
const INSURANCE_TYPE_CODES = ['AUTO', 'SALUD', 'HOGAR'] as const;
const COVERAGE_CODES = ['BASICA', 'ESTANDAR', 'PREMIUM'] as const;

export class CreateQuoteDto {
  @ApiProperty({ enum: INSURANCE_TYPE_CODES })
  @IsIn(INSURANCE_TYPE_CODES)
  insuranceType!: (typeof INSURANCE_TYPE_CODES)[number];

  @ApiProperty({ enum: COVERAGE_CODES })
  @IsIn(COVERAGE_CODES)
  coverage!: (typeof COVERAGE_CODES)[number];

  // Los límites coinciden con los rangos documentados de la calculadora (18-99).
  @ApiProperty({ minimum: 18, maximum: 99, example: 35 })
  @IsInt()
  @Min(18)
  @Max(99)
  age!: number;

  @ApiProperty({ example: 'EC-AZUAY' })
  @IsString()
  @IsNotEmpty()
  location!: string;
}
