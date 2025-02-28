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

@UseInterceptors(BigIntInterceptor)
@UseGuards(AccessGuard)
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
    const board = await this.boardService.update(
      id,
      jwtUserInfo,
      updateBoardDto,
    );

    this.websocketGateway.sendBoardMessage({
      boardId: id,
      userId: jwtUserInfo.id,
      message: board,
    });
    return { board };
  }

  // api/board/:id
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @RequestUser() jwtUserInfo: JwtUserInfo,
  ) {
    const board = await this.boardService.remove(id, jwtUserInfo);

    this.websocketGateway.sendBoardMessage({
      boardId: id,
      userId: jwtUserInfo.id,
      message: board.id,
    });
    return { boardId: board.id.toString() };
  }
}
