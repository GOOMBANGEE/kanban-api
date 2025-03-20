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
import { Status } from '@prisma/client';

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
    const status: Status = await this.statusService.create(
      boardId,
      jwtUserInfo,
      createStatusDto,
    );

    this.websocketGateway.sendMessage({
      boardId: boardId,
      userId: jwtUserInfo.id,
      status: status,
    });

    return status;
  }

  // /api/status/:boardId/:id
  @Patch(':boardId/:id')
  async update(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Param('id', ParseIntPipe) id: number,
    @RequestUser() jwtUserInfo: JwtUserInfo,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    const status: Status | Partial<Status>[] = await this.statusService.update(
      boardId,
      id,
      jwtUserInfo,
      updateStatusDto,
    );

    this.websocketGateway.sendMessage({
      boardId: boardId,
      userId: jwtUserInfo.id,
      status: status,
    });

    return status;
  }

  // /api/status/:boardId/:id
  @Delete(':boardId/:id')
  async remove(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Param('id', ParseIntPipe) id: number,
    @RequestUser() jwtUserInfo: JwtUserInfo,
  ) {
    const status: Status = await this.statusService.remove(
      boardId,
      id,
      jwtUserInfo,
    );

    this.websocketGateway.sendMessage({
      boardId: boardId,
      userId: jwtUserInfo.id,
      status: status,
    });

    return status;
  }
}
