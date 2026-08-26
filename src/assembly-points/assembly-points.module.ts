import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AssemblyPoint, AssemblyPointSchema } from './schemas/assembly-point.schema';
import { AssemblyPointsService } from './assembly-points.service';
import { AssemblyPointsController } from './assembly-points.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AssemblyPoint.name, schema: AssemblyPointSchema }]),
    UsersModule,
  ],
  controllers: [AssemblyPointsController],
  providers: [AssemblyPointsService],
})
export class AssemblyPointsModule {}