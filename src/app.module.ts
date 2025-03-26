import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { SentryModule } from '@sentry/nestjs/setup';
import * as Joi from 'joi';
import { WinstonModule } from 'nest-winston';
import * as process from 'node:process';
import * as winston from 'winston';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { UserModule } from './user/user.module';
import { GlobalExceptionFilter } from './common/filter/global-exception.filter';
import { AppService } from './app.service';
import { BoardModule } from './board/board.module';
import { StatusModule } from './status/status.module';
import { TicketModule } from './ticket/ticket.module';
import { WebsocketModule } from './websocket/websocket.module';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import { envKey } from './common/const/env.const';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env`,
      validationSchema: Joi.object({
        PORT: Joi.number().default(3000).required(),
        DB_URL: Joi.string().required(),
        REDIS_URL: Joi.string().required(),
        REDIS_NAMESPACE: Joi.string(),
        BASE_URL: Joi.string().required(),
        FRONTEND_URL: Joi.string().required(),
        SENTRY_DSN: Joi.string().required(),

        SALT_OR_ROUNDS: Joi.number().required(),

        INVITE_CODE_LENGTH: Joi.number().required(),
        IMAGE_PATH: Joi.string().required(),

        JWT_ACCESS_TOKEN_KEY: Joi.string().required(),
        JWT_ACCESS_TOKEN_EXPIRES: Joi.number().required(),
        JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
        JWT_REFRESH_TOKEN_KEY: Joi.string().required(),
        JWT_REFRESH_TOKEN_EXPIRES: Joi.number().required(),
        JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
      }),
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get(envKey.redisUrl);
        const redisNamespace = configService.get(envKey.redisNamespace);

        const keyv = createKeyv(redisUrl, {
          namespace: redisNamespace,
          keyPrefixSeparator: ':',
        });

        // connection test
        // await keyv.set('connectionTest', 'success');
        // console.log(await keyv.get('connectionTest'));
        // console.log(keyv);

        return { stores: [keyv] };
      },
    }),

    SentryModule.forRoot(),
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          // console 출력설정
          level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, context }) => {
              const stringContext = context ? `[${String(context)}]` : '';
              return `[${String(timestamp)}] ${String(level)}: ${String(message)} ${stringContext}`;
            }),
          ),
        }),
        new winston.transports.File({
          // file export 설정
          filename: 'application.log',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(), // json 형식
          ),
        }),
      ],
    }),
    CommonModule,
    AuthModule,
    UserModule,
    BoardModule,
    StatusModule,
    TicketModule,
    WebsocketModule,
  ],
  controllers: [],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
