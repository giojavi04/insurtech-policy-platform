import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetPolicyUseCase } from './application/get-policy.use-case';
import { IssuePolicyUseCase } from './application/issue-policy.use-case';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { PolicyResponseDto } from './dto/policy-response.dto';

@ApiTags('policies')
@ApiBearerAuth()
@Controller('policies')
export class PolicyController {
  constructor(
    private readonly issuePolicyUseCase: IssuePolicyUseCase,
    private readonly getPolicyUseCase: GetPolicyUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Issue a policy for a quote (Bearer required).' })
  @ApiCreatedResponse({ type: PolicyResponseDto })
  async create(@Body() dto: CreatePolicyDto): Promise<PolicyResponseDto> {
    return this.issuePolicyUseCase.execute(dto.quoteId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Retrieve a persisted policy (Bearer required).' })
  @ApiOkResponse({ type: PolicyResponseDto })
  async findOne(@Param('id') id: string): Promise<PolicyResponseDto> {
    return this.getPolicyUseCase.execute(id);
  }
}
