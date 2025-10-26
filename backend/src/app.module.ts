import { Module } from '@nestjs/common';
import { ScansModule } from './scans/scans.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScansModule,
    UsersModule,
  ],
})
export class AppModule {}
