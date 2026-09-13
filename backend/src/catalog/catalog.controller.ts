import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { CatalogListResponseDto } from './dto/catalog-list-response.dto';
import { GetCoveragesQueryDto } from './dto/get-coverages-query.dto';

@ApiTags('catalogs')
@Controller('catalogs')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('insurance-types')
  @ApiOperation({ summary: 'List seeded insurance types (no auth).' })
  @ApiOkResponse({ type: CatalogListResponseDto })
  async listInsuranceTypes(): Promise<CatalogListResponseDto> {
    const items = await this.catalogService.listInsuranceTypes();
    return { items };
  }

  @Get('coverages')
  @ApiOperation({ summary: 'List coverages valid for the given insuranceType (no auth).' })
  @ApiOkResponse({ type: CatalogListResponseDto })
  async listCoverages(@Query() query: GetCoveragesQueryDto): Promise<CatalogListResponseDto> {
    const items = await this.catalogService.listCoverages(query.insuranceType);
    return { items };
  }

  @Get('locations')
  @ApiOperation({ summary: 'List the bounded set of seeded locations (no auth).' })
  @ApiOkResponse({ type: CatalogListResponseDto })
  async listLocations(): Promise<CatalogListResponseDto> {
    const items = await this.catalogService.listLocations();
    return { items };
  }
}
