import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from './common/prisma.service';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { envKey } from './common/const/env.const';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

@Injectable()
export class AppService implements OnModuleInit {
  private readonly imagePath: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.imagePath = path.join(this.configService.get(envKey.imagePath));
    // 이미지 저장 디렉토리 없으면 생성
    if (!fs.existsSync(join(__dirname, this.imagePath))) {
      fs.mkdirSync(join(__dirname, this.imagePath), { recursive: true });
    }
  }

  async onModuleInit() {
    if (process.env.NODE_ENV === 'test') {
      // 테스트 환경에서만 실행
      await this.prisma.user.deleteMany();
      console.log('테스트 환경: 모든 데이터를 삭제했습니다.');
    }
  }
}
