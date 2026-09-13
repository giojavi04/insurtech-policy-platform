import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateQuoteUseCase } from './application/create-quote.use-case';
import { GetQuoteUseCase } from './application/get-quote.use-case';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { QuoteResponseDto } from './dto/quote-response.dto';

@ApiTags('quotes')
@Controller('quotes')
export class QuoteController {
  constructor(
    private readonly createQuoteUseCase: CreateQuoteUseCase,
    private readonly getQuoteUseCase: GetQuoteUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a quote (no auth).' })
  @ApiCreatedResponse({ type: QuoteResponseDto })
  async create(@Body() dto: CreateQuoteDto): Promise<QuoteResponseDto> {
    return this.createQuoteUseCase.execute(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a persisted quote (no auth).' })
  @ApiOkResponse({ type: QuoteResponseDto })
  async findOne(@Param('id') id: string): Promise<QuoteResponseDto> {
    return this.getQuoteUseCase.execute(id);
  }
}
