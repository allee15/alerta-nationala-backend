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
import { AlertsService } from './alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { CheckInDto } from './dto/checkin.dto';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Controller('alerts')
@UseGuards(JwtAuthGuard)
export class AlertsController {
  constructor(
    private readonly alertsService: AlertsService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  async findAll(@Req() req: Request) {
    const payload = req.user as JwtPayload;
    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Utilizator inexistent.');
    }

    return this.alertsService.findForUser(payload.role, user.zones);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.alertsService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.OPERATOR)
  create(@Req() req: Request, @Body() dto: CreateAlertDto) {
    const payload = req.user as JwtPayload;
    return this.alertsService.create(payload.sub, dto);
  }

  @Patch(':id/end')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OPERATOR)
  end(@Param('id') id: string) {
    return this.alertsService.end(id);
  }

  @Post(':id/checkin')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CITIZEN)
  checkIn(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: CheckInDto,
  ) {
    const payload = req.user as JwtPayload;
    return this.alertsService.checkIn(id, payload.sub, dto.clientTimestamp);
  }

  @Get(':id/checkins')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OPERATOR)
  getStats(@Param('id') id: string) {
    return this.alertsService.getStats(id);
  }
}