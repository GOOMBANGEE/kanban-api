import { forwardRef, Module } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';
import { CommonModule } from '../common/common.module';
import { JwtModule } from '@nestjs/jwt';
import { BoardModule } from '../board/board.module';

@Module({
  imports: [CommonModule, JwtModule, forwardRef(() => BoardModule)],
  providers: [WebsocketGateway],
  exports: [WebsocketGateway],
})
export class WebsocketModule {}
