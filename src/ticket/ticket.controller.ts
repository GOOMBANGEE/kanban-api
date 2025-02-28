import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { BigIntInterceptor } from '../common/interceptor/big-int.interceptor';
import { AccessGuard } from '../auth/guard/access.guard';
import { JwtUserInfo, RequestUser } from '../auth/decorator/user.decorator';
import { WebsocketGateway } from '../websocket/websocket.gateway';

@UseInterceptors(BigIntInterceptor)
@UseGuards(AccessGuard)
@Controller('api/ticket')
export class TicketController {
  constructor(
    private readonly ticketService: TicketService,
    private readonly websocketGateway: WebsocketGateway,
  ) {}

  // api/ticket/:boardId/:statusId
  @Post(':boardId/:statusId')
  async create(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Param('statusId', ParseIntPipe) statusId: number,
    @RequestUser() jwtUserInfo: JwtUserInfo,
    @Body() createTicketDto: CreateTicketDto,
  ) {
    const ticket = await this.ticketService.create(
      boardId,
      statusId,
      jwtUserInfo,
      createTicketDto,
    );

    this.websocketGateway.sendBoardMessage({
      boardId: boardId,
      userId: jwtUserInfo.id,
      message: ticket,
    });

    return { ticket };
  }

  // api/ticket/:boardId/:statusId/:id
  @Get(':boardId/:statusId/:id')
  findOne(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Param('statusId', ParseIntPipe) statusId: number,
    @Param('id', ParseIntPipe) id: number,
    @RequestUser() jwtUserInfo: JwtUserInfo,
  ) {
    return this.ticketService.findOne(boardId, statusId, id, jwtUserInfo);
  }

  // api/ticket/:boardId/:statusId/:id
  @Patch(':boardId/:statusId/:id')
  update(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Param('statusId', ParseIntPipe) statusId: number,
    @Param('id', ParseIntPipe) id: number,
    @RequestUser() jwtUserInfo: JwtUserInfo,
    @Body() updateTicketDto: UpdateTicketDto,
  ) {
    return this.ticketService.update(
      boardId,
      statusId,
      id,
      jwtUserInfo,
      updateTicketDto,
    );
  }

  // api/ticket/:boardId/:statusId/:id
  @Delete(':boardId/:statusId/:id')
  async remove(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Param('statusId', ParseIntPipe) statusId: number,
    @Param('id', ParseIntPipe) id: number,
    @RequestUser() jwtUserInfo: JwtUserInfo,
  ) {
    const ticket = await this.ticketService.remove(
      boardId,
      statusId,
      id,
      jwtUserInfo,
    );

    this.websocketGateway.sendBoardMessage({
      boardId: boardId,
      userId: jwtUserInfo.id,
      message: ticket,
    });

    return { ticket };
  }
}
