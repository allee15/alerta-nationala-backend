import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Alert, AlertSchema } from './schemas/alert.schema';
import { CheckIn, CheckInSchema } from './schemas/checkin.schema';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Alert.name, schema: AlertSchema },
      { name: CheckIn.name, schema: CheckInSchema },
    ]),
    UsersModule,
  ],
  controllers: [AlertsController],
  providers: [AlertsService],
  exports: [AlertsService],
})
export class AlertsModule {}