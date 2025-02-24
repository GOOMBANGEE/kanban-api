import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ImageService } from './image.service';

@Module({
  providers: [ImageService, PrismaService],
  exports: [ImageService, PrismaService],
})
export class CommonModule {}
