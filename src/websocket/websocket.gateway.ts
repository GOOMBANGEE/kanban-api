import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Injectable, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { BoardService } from '../board/board.service';
import { JwtUserInfo, WsUser } from '../auth/decorator/user.decorator';
import { AccessWsGuard } from '../auth/guard/access-ws.guard';
import { Board, Status, Ticket } from '@prisma/client';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'ws',
})
@Injectable()
export class WebsocketGateway implements OnGatewayConnection {
  constructor(private readonly boardService: BoardService) {}

  @WebSocketServer()
  public server: Server;

  handleConnection(socket: Socket) {
    const token = socket.handshake.headers.authorization;
    if (token) socket.data.accessToken = token;
  }

  @UseGuards(AccessWsGuard)
  @SubscribeMessage('joinBoard')
  async joinBoard(
    @WsUser() wsUser: JwtUserInfo,
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { id: number },
  ) {
    // 들어온 유저가 board에 접근가능한지 검증
    const boardId = JSON.parse(JSON.stringify(data));
    await this.boardService.validateBoardUserRelation(boardId, wsUser);

    socket.join(boardId);
    return boardId;
  }

  sendMessage(
    @MessageBody()
    message: {
      boardId: number;
      userId: string;
      data?: any;
      board?: Board;
      status?: Status;
      ticket?: Ticket | Partial<Ticket>[];
    },
  ) {
    const serializedMessage = this.serialize(message);
    const sourceMethod = new Error().stack.split('\n')[2].split(' ')[5];

    const responseMessage = {
      message: serializedMessage,
      sourceMethod,
    };

    this.server
      .to(message.boardId.toString())
      .emit('receiveMessage', responseMessage);
  }

  serialize(message) {
    return JSON.parse(
      JSON.stringify(message, (_, value) =>
        typeof value === 'bigint' ? value.toString() : value,
      ),
    );
  }

  @SubscribeMessage('leaveBoard')
  leaveBoard(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { id: number },
  ) {
    const boardId = JSON.parse(JSON.stringify(data));
    socket.leave(boardId);
    return boardId;
  }
}
