import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { BoardService } from './board.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { JwtUserInfo, RequestUser } from '../auth/decorator/user.decorator';
import { AccessGuard } from '../auth/guard/access.guard';
import { BigIntInterceptor } from '../common/interceptor/big-int.interceptor';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { Board } from '@prisma/client';
import { Throttle } from '@nestjs/throttler';

@UseInterceptors(BigIntInterceptor)
@UseGuards(AccessGuard)
@Throttle({ default: { limit: 2, ttl: 1000 } })
@Controller('api/board')
export class BoardController {
  constructor(
    private readonly boardService: BoardService,
    private readonly websocketGateway: WebsocketGateway,
  ) {}

  // api/board
  @Post()
  create(
    @RequestUser() jwtUserInfo: JwtUserInfo,
    @Body() createBoardDto: CreateBoardDto,
  ) {
    return this.boardService.create(jwtUserInfo, createBoardDto);
  }

  // api/board?page=number
  @Get()
  boardList(
    @RequestUser() jwtUserInfo: JwtUserInfo,
    @Query('page', ParseIntPipe) page: number = 1,
  ) {
    return this.boardService.boardList(page, jwtUserInfo);
  }

  // api/board/invite/:inviteCode
  @Get('invite/:inviteCode')
  checkInviteCode(
    @Param('inviteCode') inviteCode: string,
    @RequestUser() jwtUserInfo: JwtUserInfo,
  ) {
    return this.boardService.checkInviteCode(inviteCode, jwtUserInfo);
  }

  // api/board/:id
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @RequestUser() jwtUserInfo: JwtUserInfo,
  ) {
    return this.boardService.findOne(id, jwtUserInfo);
  }

  // api/board/:id
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @RequestUser() jwtUserInfo: JwtUserInfo,
    @Body() updateBoardDto: UpdateBoardDto,
  ) {
    const board: Partial<Board> = await this.boardService.update(
      id,
      jwtUserInfo,
      updateBoardDto,
    );

    this.websocketGateway.sendMessage({
      boardId: id,
      userId: jwtUserInfo.id,
      board: board,
    });

    return board;
  }

  // api/board/:id
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @RequestUser() jwtUserInfo: JwtUserInfo,
  ) {
    const board: Partial<Board> = await this.boardService.remove(
      id,
      jwtUserInfo,
    );

    this.websocketGateway.sendMessage({
      boardId: id,
      userId: jwtUserInfo.id,
      board: board,
    });

    return { boardId: board.id.toString() };
  }

  // api/board/:id/invite
  @Get(':id/invite')
  invite(
    @Param('id', ParseIntPipe) id: number,
    @RequestUser() jwtUserInfo: JwtUserInfo,
  ) {
    return this.boardService.invite(id, jwtUserInfo, false);
  }

  // api/board/:id/invite/regenerate
  @Get(':id/invite/regenerate')
  inviteRegenerate(
    @Param('id', ParseIntPipe) id: number,
    @RequestUser() jwtUserInfo: JwtUserInfo,
  ) {
    return this.boardService.invite(id, jwtUserInfo, true);
  }

  @Delete(':id/invite')
  deleteInvite(
    @Param('id', ParseIntPipe) id: number,
    @RequestUser() jwtUserInfo: JwtUserInfo,
  ) {
    return this.boardService.deleteInviteCode(id, jwtUserInfo);
  }

  // api/board/:id/:inviteCode
  @Post(':id/:inviteCode')
  async join(
    @Param('id', ParseIntPipe) id: number,
    @Param('inviteCode') inviteCode: string,
    @RequestUser() jwtUserInfo: JwtUserInfo,
  ) {
    await this.boardService.join(id, inviteCode, jwtUserInfo);
  }

  // api/board/:id/kick?userId=number
  @Delete(':id/kick')
  async kick(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId') userId: number,
    @RequestUser() jwtUserInfo: JwtUserInfo,
  ) {
    await this.boardService.kick(id, jwtUserInfo, userId);
  }

  // api/board/:id/leave
  @Delete(':id/leave')
  async leave(
    @Param('id', ParseIntPipe) id: number,
    @RequestUser() jwtUserInfo: JwtUserInfo,
  ) {
    await this.boardService.leave(id, jwtUserInfo);
  }
}
