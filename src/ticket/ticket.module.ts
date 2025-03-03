import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { CommonModule } from '../common/common.module';
import { BoardModule } from '../board/board.module';
import { StatusModule } from '../status/status.module';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [CommonModule, BoardModule, StatusModule, WebsocketModule],
  controllers: [TicketController],
  providers: [TicketService],
})
export class TicketModule {}
