import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { CommonModule } from '../common/common.module';
import { AuthModule } from '../auth/auth.module';
import { BoardModule } from '../board/board.module';
import { StatusModule } from '../status/status.module';

@Module({
  imports: [CommonModule, AuthModule, BoardModule, StatusModule],
  controllers: [TicketController],
  providers: [TicketService],
})
export class TicketModule {}
