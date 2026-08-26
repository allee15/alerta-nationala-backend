import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import { AssemblyPointsService } from './assembly-points.service';
import { CreateAssemblyPointDto } from './dto/create-assembly-point.dto';
import { UpdateAssemblyPointDto } from './dto/update-assembly-point.dto';

interface JwtPayload {
  sub: string;
  role: string;
}

@Controller('assembly-points')
@UseGuards(JwtAuthGuard)
export class AssemblyPointsController {
  constructor(
    private readonly assemblyPointsService: AssemblyPointsService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  async findAll(@Req() req: Request) {
    const payload = req.user as JwtPayload;

    if (payload.role === UserRole.OPERATOR) {
      return this.assemblyPointsService.findAll();
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Utilizator inexistent.');
    }
    return this.assemblyPointsService.findActiveForZones(user.zones);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.OPERATOR)
  create(@Body() dto: CreateAssemblyPointDto) {
    return this.assemblyPointsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OPERATOR)
  update(@Param('id') id: string, @Body() dto: UpdateAssemblyPointDto) {
    return this.assemblyPointsService.update(id, dto);
  }

  @Patch(':id/deactivate')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OPERATOR)
  deactivate(@Param('id') id: string) {
    return this.assemblyPointsService.setActive(id, false);
  }

  @Patch(':id/activate')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OPERATOR)
  activate(@Param('id') id: string) {
    return this.assemblyPointsService.setActive(id, true);
  }
}