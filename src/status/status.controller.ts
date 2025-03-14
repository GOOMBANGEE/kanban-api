import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { StatusService } from './status.service';
import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { AccessGuard } from '../auth/guard/access.guard';
import { BigIntInterceptor } from '../common/interceptor/big-int.interceptor';
import { JwtUserInfo, RequestUser } from '../auth/decorator/user.decorator';
import { WebsocketGateway } from '../websocket/websocket.gateway';

@UseInterceptors(BigIntInterceptor)
@UseGuards(AccessGuard)
@Controller('api/status')
export class StatusController {
  constructor(
    private readonly statusService: StatusService,
    private readonly websocketGateway: WebsocketGateway,
  ) {}

  // /api/status/:boardId
  // return: { status }
  @Post(':boardId')
  async create(
    @Param('boardId', ParseIntPipe) boardId: number,
    @RequestUser() jwtUserInfo: JwtUserInfo,
    @Body() createStatusDto: CreateStatusDto,
  ) {
    const status = await this.statusService.create(
      boardId,
      jwtUserInfo,
      createStatusDto,
    );

    this.websocketGateway.sendBoardMessage({
      boardId: boardId,
      userId: jwtUserInfo.id,
      message: status,
    });

    return { status };
  }

  // /api/status/:boardId/:id
  @Patch(':boardId/:id')
  async update(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Param('id', ParseIntPipe) id: number,
    @RequestUser() jwtUserInfo: JwtUserInfo,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    const result = await this.statusService.update(
      boardId,
      id,
      jwtUserInfo,
      updateStatusDto,
    );

    this.websocketGateway.sendBoardMessage({
      boardId: boardId,
      userId: jwtUserInfo.id,
      message: result,
    });

    return { result };
  }

  // /api/status/:boardId/:id
  @Delete(':boardId/:id')
  async remove(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Param('id', ParseIntPipe) id: number,
    @RequestUser() jwtUserInfo: JwtUserInfo,
  ) {
    const status = await this.statusService.remove(boardId, id, jwtUserInfo);

    this.websocketGateway.sendBoardMessage({
      boardId: boardId,
      userId: jwtUserInfo.id,
      message: status,
    });

    return { status };
  }
}
