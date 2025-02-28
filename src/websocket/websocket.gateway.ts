import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Injectable, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { BoardService } from '../board/board.service';
import { JwtUserInfo, WsUser } from '../auth/decorator/user.decorator';
import { AccessWsGuard } from '../auth/guard/access-ws.guard';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'ws',
})
@Injectable()
export class WebsocketGateway {
  constructor(private readonly boardService: BoardService) {}
  @WebSocketServer()
  public server: Server;

  @UseGuards(AccessWsGuard)
  @SubscribeMessage('board')
  async enterBoard(
    @WsUser() wsUser: JwtUserInfo,
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { id: number },
  ) {
    // 들어온 유저가 board에 접근가능한지 검증
    const boardId = JSON.parse(JSON.stringify(data));
    await this.boardService.validateBoard(boardId, wsUser);

    socket.join(boardId);
    return boardId;
  }

  sendBoardMessage(
    @MessageBody() data: { boardId: number; userId: string; message: any },
  ) {
    const message = JSON.parse(
      JSON.stringify(data, (_, value) =>
        typeof value === 'bigint' ? value.toString() : value,
      ),
    );

    const sourceMethod = new Error().stack.split('\n')[2].split(' ')[5];
    this.server
      .to(data.boardId.toString())
      .emit('receiveMessage', { message, sourceMethod });
  }
}
