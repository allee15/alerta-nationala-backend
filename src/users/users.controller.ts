import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateZonesDto } from './dto/update-zones.dto';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('get-user')
  async getUser(@Req() req: Request) {
    const payload = req.user as JwtPayload;

    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      zones: user.zones,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('zones')
  async updateZones(@Req() req: Request, @Body() dto: UpdateZonesDto) {
    const payload = req.user as JwtPayload;
    const user = await this.usersService.updateZones(payload.sub, dto.zones);

    return {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      zones: user.zones,
    };
  }
}