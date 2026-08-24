import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AlertsModule } from './alerts/alerts.module';
import { WeatherModule } from './weather/weather.module';
import { GuidesModule } from './guides/guides.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true}),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('ATLAS_URI'),
        dbName:
          config.get<string>('ATLAS_DB_NAME') ?? 'alerta-nationala-proiect',
      }),
    }),
    UsersModule,
    AuthModule,
    AlertsModule,
    WeatherModule,
    GuidesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
