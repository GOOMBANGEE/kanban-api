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
import { RequestUser } from '../auth/decorator/user.decorator';

@UseInterceptors(BigIntInterceptor)
@UseGuards(AccessGuard)
@Controller('api/ticket')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  // api/ticket/:boardId/:statusId
  @Post(':boardId/:statusId')
  create(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Param('statusId', ParseIntPipe) statusId: number,
    @RequestUser() requestUser: RequestUser,
    @Body() createTicketDto: CreateTicketDto,
  ) {
    return this.ticketService.create(
      boardId,
      statusId,
      requestUser,
      createTicketDto,
    );
  }

  // api/ticket/:boardId/:statusId/:id
  @Get(':boardId/:statusId/:id')
  findOne(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Param('statusId', ParseIntPipe) statusId: number,
    @Param('id', ParseIntPipe) id: number,
    @RequestUser() requestUser: RequestUser,
  ) {
    return this.ticketService.findOne(boardId, statusId, id, requestUser);
  }

  // api/ticket/:boardId/:statusId/:id
  @Patch(':boardId/:statusId/:id')
  update(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Param('statusId', ParseIntPipe) statusId: number,
    @Param('id', ParseIntPipe) id: number,
    @RequestUser() requestUser: RequestUser,
    @Body() updateTicketDto: UpdateTicketDto,
  ) {
    return this.ticketService.update(
      boardId,
      statusId,
      id,
      requestUser,
      updateTicketDto,
    );
  }

  // api/ticket/:boardId/:statusId/:id
  @Delete(':boardId/:statusId/:id')
  remove(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Param('statusId', ParseIntPipe) statusId: number,
    @Param('id', ParseIntPipe) id: number,
    @RequestUser() requestUser: RequestUser,
  ) {
    return this.ticketService.remove(boardId, statusId, id, requestUser);
  }
}
