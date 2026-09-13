import { ApiProperty } from '@nestjs/swagger';

export class CatalogItemDto {
  @ApiProperty()
  code!: string;

  @ApiProperty()
  name!: string;
}

export class CatalogListResponseDto {
  @ApiProperty({ type: [CatalogItemDto] })
  items!: CatalogItemDto[];
}
