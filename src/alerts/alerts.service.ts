import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Alert, AlertDocument, AlertStatus } from './schemas/alert.schema';
import { CheckIn, CheckInDocument } from './schemas/checkin.schema';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/schemas/user.schema';

function toAlertResponse(alert: AlertDocument) {
  return {
    id: alert._id.toString(),
    type: alert.type,
    severity: alert.severity,
    message: alert.message,
    zones: alert.zones,
    startsAt: alert.startsAt,
    endsAt: alert.endsAt,
    status: alert.status,
    createdBy: alert.createdBy.toString(),
    endedAt: alert.endedAt ?? null,
  };
}

@Injectable()
export class AlertsService {
  constructor(
    @InjectModel(Alert.name)
    private readonly alertModel: Model<AlertDocument>,
    @InjectModel(CheckIn.name)
    private readonly checkInModel: Model<CheckInDocument>,
    private readonly usersService: UsersService,
  ) {}

  async create(operatorId: string, dto: CreateAlertDto) {
    const alert = await this.alertModel.create({
      type: dto.type,
      severity: dto.severity,
      message: dto.message,
      zones: dto.zones,
      startsAt: dto.startsAt ? new Date(dto.startsAt) : new Date(),
      endsAt: new Date(dto.endsAt),
      status: AlertStatus.ACTIVE,
      createdBy: new Types.ObjectId(operatorId),
    });

    return toAlertResponse(alert);
  }

  async findForUser(role: string, userZones: string[]) {
    if (role === UserRole.OPERATOR) {
      const alerts = await this.alertModel.find().sort({ createdAt: -1 });
      return alerts.map(toAlertResponse);
    }

    const now = new Date();
    const alerts = await this.alertModel
      .find({
        zones: { $in: userZones },
        status: AlertStatus.ACTIVE,
        endsAt: { $gte: now },
      })
      .sort({ createdAt: -1 });

    return alerts.map(toAlertResponse);
  }

  async findOne(id: string) {
    const alert = await this.alertModel.findById(id);
    if (!alert) {
      throw new NotFoundException('Alerta nu a fost gasita.');
    }
    return toAlertResponse(alert);
  }

  async end(id: string) {
    const alert = await this.alertModel.findById(id);
    if (!alert) {
      throw new NotFoundException('Alerta nu a fost gasita.');
    }

    alert.status = AlertStatus.ENDED;
    alert.endedAt = new Date();
    await alert.save();

    return toAlertResponse(alert);
  }

  async checkIn(alertId: string, userId: string, clientTimestamp: string) {
    const alert = await this.alertModel.findById(alertId);
    if (!alert) {
      throw new NotFoundException('Alerta nu a fost gasita.');
    }

    if (alert.status !== AlertStatus.ACTIVE) {
      throw new ForbiddenException('Alerta nu mai este activa.');
    }

    const checkIn = await this.checkInModel.findOneAndUpdate(
      { alert: alert._id, user: new Types.ObjectId(userId) },
      { clientTimestamp: new Date(clientTimestamp) },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    return {
      alertId: alert._id.toString(),
      clientTimestamp: checkIn.clientTimestamp,
    };
  }

  async getStats(alertId: string) {
    const alert = await this.alertModel.findById(alertId);
    if (!alert) {
      throw new NotFoundException('Alerta nu a fost gasita.');
    }

    const checkIns = await this.checkInModel
      .find({ alert: alert._id })
      .populate<{ user: { _id: Types.ObjectId; email: string } }>(
        'user',
        'email',
      )
      .sort({ clientTimestamp: -1 });

    const eligibleUsers = await this.usersService.countUsersInZones(
      alert.zones,
    );

    return {
      alertId: alert._id.toString(),
      totalCheckins: checkIns.length,
      eligibleUsers,
      rate: eligibleUsers > 0 ? checkIns.length / eligibleUsers : 0,
      checkins: checkIns.map((c) => ({
        userId: c.user._id.toString(),
        email: c.user.email,
        clientTimestamp: c.clientTimestamp,
        createdAt: (c as unknown as { createdAt: Date }).createdAt,
      })),
    };
  }
}