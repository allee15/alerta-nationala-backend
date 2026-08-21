import {
  Controller,
  Get,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { WeatherService } from './weather.service';

interface JwtPayload {
  sub: string;
}

@Controller('weather')
@UseGuards(JwtAuthGuard)
export class WeatherController {
  constructor(
    private readonly weatherService: WeatherService,
    private readonly usersService: UsersService,
  ) {}

  @Get('me')
  async getMyWeather(@Req() req: Request) {
    const payload = req.user as JwtPayload;
    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Utilizator inexistent.');
    }

    return this.weatherService.getWeatherForZones(user.zones);
  }
}