import { forwardRef, Module } from '@nestjs/common';
import { BoardService } from './board.service';
import { BoardController } from './board.controller';
import { CommonModule } from '../common/common.module';
import { AuthModule } from '../auth/auth.module';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [CommonModule, AuthModule, forwardRef(() => WebsocketModule)],
  controllers: [BoardController],
  providers: [BoardService],
  exports: [BoardService],
})
export class BoardModule {}
