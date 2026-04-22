import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IncidentsModule } from './incidents/incidents.module';
import { EmailModule } from './email/email.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { envs } from './config/envs';
import { dataSourceOptions } from './core/db/data-source';
import { CacheModule } from './cache/cache.module';

@Module({
  imports: [IncidentsModule, EmailModule
    ,TypeOrmModule.forRoot(
      dataSourceOptions
    ), CacheModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
