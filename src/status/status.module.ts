import { Module } from '@nestjs/common';
import { StatusService } from './status.service';
import { StatusController } from './status.controller';
import { CommonModule } from '../common/common.module';
import { BoardModule } from '../board/board.module';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [CommonModule, BoardModule, WebsocketModule],
  controllers: [StatusController],
  providers: [StatusService],
  exports: [StatusService],
})
export class StatusModule {}
