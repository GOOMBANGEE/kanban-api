import { Module } from '@nestjs/common';
import { StatusService } from './status.service';
import { StatusController } from './status.controller';
import { CommonModule } from '../common/common.module';
import { AuthModule } from '../auth/auth.module';
import { BoardModule } from '../board/board.module';

@Module({
  imports: [CommonModule, AuthModule, BoardModule],
  controllers: [StatusController],
  providers: [StatusService],
})
export class StatusModule {}
