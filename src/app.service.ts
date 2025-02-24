import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from './common/prisma.service';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    if (process.env.NODE_ENV === 'test') {
      // 테스트 환경에서만 실행
      await this.prisma.user.deleteMany();
      console.log('테스트 환경: 모든 데이터를 삭제했습니다.');
    }
  }
}
