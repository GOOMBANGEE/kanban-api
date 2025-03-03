import { Injectable } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { PrismaService } from '../common/prisma.service';
import { BoardService } from '../board/board.service';
import { StatusService } from '../status/status.service';
import { JwtUserInfo } from '../auth/decorator/user.decorator';
import {
  TICKET_ERROR,
  TicketException,
} from '../common/exception/ticket.exception';
import {
  VALIDATION_ERROR,
  ValidException,
} from '../common/exception/valid.exception';

@Injectable()
export class TicketService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly boardService: BoardService,
    private readonly statusService: StatusService,
  ) {}
  async create(
    boardId: number,
    statusId: number,
    jwtUserInfo: JwtUserInfo,
    createTicketDto: CreateTicketDto,
  ) {
    const [, status] = await Promise.all([
      this.boardService.validateBoardUserRelation(boardId, jwtUserInfo),
      this.statusService.validateStatus(boardId, statusId),
    ]);

    const lastTicket = await this.prisma.ticket.findFirst({
      select: {
        id: true,
        displayOrder: true,
      },
      where: { statusId: status.id, logicDelete: false },
      orderBy: { displayOrder: 'desc' },
    });

    return this.prisma.ticket.create({
      data: {
        ...createTicketDto,
        displayOrder: lastTicket ? lastTicket.displayOrder * 2 : 1024,
        boardId,
        statusId,
      },
    });
  }

  async findOne(
    boardId: number,
    statusId: number,
    id: number,
    jwtUserInfo: JwtUserInfo,
  ) {
    const [, , ticket] = await Promise.all([
      this.boardService.validateBoardUserRelation(boardId, jwtUserInfo),
      this.statusService.validateStatus(boardId, statusId),
      this.validateTicket(id),
    ]);

    return { ticket };
  }

  async update(
    boardId: number,
    statusId: number,
    id: number,
    jwtUserInfo: JwtUserInfo,
    updateTicketDto: UpdateTicketDto,
  ) {
    await Promise.all([
      this.boardService.validateBoardUserRelation(boardId, jwtUserInfo),
      this.statusService.validateStatus(boardId, statusId),
      this.validateTicket(id),
    ]);

    if (updateTicketDto.title) {
      await this.prisma.ticket.update({
        where: { id },
        data: { title: updateTicketDto.title, updateTime: new Date() },
      });
      return;
    }

    if (updateTicketDto.content) {
      await this.prisma.ticket.update({
        where: { id },
        data: { content: updateTicketDto.content, updateTime: new Date() },
      });
      return;
    }

    if (updateTicketDto.displayOrder && updateTicketDto.statusId) {
      const ticketList = await this.displayOrderReorder(id, updateTicketDto);
      if (ticketList) return { ticketList };

      await this.prisma.ticket.update({
        where: { id },
        data: {
          displayOrder: updateTicketDto.displayOrder,
          statusId: updateTicketDto.statusId,
          updateTime: new Date(),
        },
      });
      return;
    }

    if (updateTicketDto.startDate || updateTicketDto.endDate) {
      if (
        new Date(updateTicketDto.startDate) > new Date(updateTicketDto.endDate)
      ) {
        throw new ValidException([
          {
            property: updateTicketDto.startDate,
            message: VALIDATION_ERROR.DATE_ERROR,
          },
        ]);
      }
      await this.prisma.ticket.update({
        where: { id },
        data: {
          startDate: new Date(updateTicketDto.startDate),
          endDate: new Date(updateTicketDto.endDate),
          updateTime: new Date(),
        },
      });
    }
  }

  // displayOrder 재배치 로직
  async displayOrderReorder(id: number, updateTicketDto: UpdateTicketDto) {
    // 들어온 display order에 대해서 앞 뒤에 해당하는 ticket이 소수점 다섯째자리까지 같은경우 -> 앞뒤의 ticket id 기억
    const [ticketHasLessDisplayOrder, ticketHasGreaterDisplayOrder] =
      await this.prisma.$transaction([
        this.prisma.ticket.findFirst({
          select: {
            id: true,
            displayOrder: true,
          },
          where: {
            statusId: updateTicketDto.statusId,
            logicDelete: false,
            displayOrder: {
              lt: updateTicketDto.displayOrder,
            },
          },
          orderBy: { displayOrder: 'desc' },
        }),
        this.prisma.ticket.findFirst({
          select: {
            id: true,
            displayOrder: true,
          },
          where: {
            statusId: updateTicketDto.statusId,
            id: { not: id },
            logicDelete: false,
            displayOrder: {
              gt: updateTicketDto.displayOrder,
            },
          },
          orderBy: { displayOrder: 'asc' },
        }),
      ]);

    if (!ticketHasLessDisplayOrder || !ticketHasGreaterDisplayOrder) return;
    if (
      Math.trunc(updateTicketDto.displayOrder * 10000) ===
        Math.trunc(ticketHasLessDisplayOrder.displayOrder * 10000) ||
      Math.trunc(updateTicketDto.displayOrder * 10000) ===
        Math.trunc(ticketHasGreaterDisplayOrder.displayOrder * 10000)
    ) {
      // ticket displayOrder 재정렬
      await this.prisma.$queryRaw`
        WITH Ordered AS (
            SELECT id, ROW_NUMBER() OVER (ORDER BY display_order) AS rn
            FROM "Ticket" t
            WHERE t.status_id = ${updateTicketDto.statusId} AND
                  t.logic_delete = false AND
                  NOT t.id = ${id} 
        )
        UPDATE "Ticket" i
        SET display_order = POWER(2, o.rn - 1) * 1024
        FROM Ordered o
        WHERE i.id = o.id`;

      const [ticketLessUpdated, ticketGreaterUpdated] =
        await this.prisma.$transaction([
          this.prisma.ticket.findUnique({
            select: {
              id: true,
              displayOrder: true,
            },
            where: { id: ticketHasLessDisplayOrder.id },
          }),
          this.prisma.ticket.findUnique({
            select: {
              id: true,
              displayOrder: true,
            },
            where: { id: ticketHasGreaterDisplayOrder.id },
          }),
        ]);

      await this.prisma.ticket.update({
        where: { id },
        data: {
          displayOrder:
            (ticketLessUpdated.displayOrder +
              ticketGreaterUpdated.displayOrder) /
            2,
        },
      });

      const ticketList = await this.prisma.ticket.findMany({
        select: {
          id: true,
          title: true,
          displayOrder: true,
          statusId: true,
        },
        where: {
          statusId: updateTicketDto.statusId,
          logicDelete: false,
        },
      });
      return { ticketList };
    }
  }

  async remove(
    boardId: number,
    statusId: number,
    id: number,
    jwtUserInfo: JwtUserInfo,
  ) {
    await Promise.all([
      this.boardService.validateBoardUserRelation(boardId, jwtUserInfo),
      this.statusService.validateStatus(boardId, statusId),
      this.validateTicket(id),
    ]);

    return this.prisma.ticket.update({
      where: { id },
      data: { logicDelete: true },
    });
  }

  async validateTicket(id: number) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id, logicDelete: false },
    });
    if (!ticket) throw new TicketException(TICKET_ERROR.TICKET_NOT_FOUND);
    return ticket;
  }
}
