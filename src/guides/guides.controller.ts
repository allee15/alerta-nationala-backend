import { Controller, Get, Param, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GuidesService } from './guides.service';

@Controller('guides')
@UseGuards(JwtAuthGuard)
export class GuidesController {
  constructor(private readonly guidesService: GuidesService) {}

  @Get('versions')
  findVersions() {
    return this.guidesService.findVersions();
  }

  @Get()
  findAll() {
    return this.guidesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.guidesService.findOne(id);
  }
}