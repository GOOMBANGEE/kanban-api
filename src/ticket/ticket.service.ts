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
import { ImageService } from '../common/image.service';
import * as path from 'node:path';
import { ConfigService } from '@nestjs/config';
import { envKey } from '../common/const/env.const';

@Injectable()
export class TicketService {
  private readonly baseUrl: string;
  private readonly imagePath: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly imageService: ImageService,
    private readonly boardService: BoardService,
    private readonly statusService: StatusService,
  ) {
    this.baseUrl = this.configService.get(envKey.baseUrl);
    this.imagePath = path.join(this.configService.get(envKey.imagePath));
  }
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

  // html -> image -> base64 순서로 이미지 정보 가져온 후 base64를 서버에 저장된 이미지 경로인 imageUrl로 수정
  async replaceBase64InHtml(htmlContent: string) {
    const imgRegex =
      /<img[^>]+src=["'](data:image\/[a-zA-Z]+;base64,[^"']+)["'][^>]*>/g;
    let updateHtml = htmlContent;
    const promiseList: Promise<{ imgTag: string; newTag: string }>[] = [];

    const matchList = [...htmlContent.matchAll(imgRegex)];
    matchList.forEach((match) => {
      // imgTag = <img src="~"/>
      // base64 = data:image/{extension};base64~
      const [imgTag, base64] = match;
      // base64Match => divide extension and data
      const base64Match = RegExp(/^data:image\/([a-zA-Z]+);base64,(.+)$/).exec(
        base64,
      );

      promiseList.push(
        this.imageService.saveContentImage(base64Match).then((image) => {
          // 클라이언트에서 접근할 이미지 경로
          // const imageUrl = `${this.baseUrl}/${this.imagePath}/${image.filename}`;
          const imageUrl = `${this.baseUrl}/${this.imagePath}/${image.filename}`;
          return { imgTag, newTag: imgTag.replace(base64, imageUrl) };
        }),
      );
    });

    const replaceList = await Promise.all(promiseList);
    replaceList.forEach(({ imgTag, newTag }) => {
      // html 태그안의 img src="{base64Data}" 에서 base64Data 부분을 imageUrl 로 변경
      updateHtml = updateHtml.replace(imgTag, newTag);
    });

    return updateHtml;
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
    const [, , ticket] = await Promise.all([
      this.boardService.validateBoardUserRelation(boardId, jwtUserInfo),
      this.statusService.validateStatus(boardId, statusId),
      this.validateTicket(id),
    ]);
    const updateData: Record<string, any> = { updateTime: new Date() };

    if (updateTicketDto.title) {
      updateData.title = updateTicketDto.title;
    }
    if (updateTicketDto.content) {
      updateData.content = await this.replaceBase64InHtml(
        updateTicketDto.content,
      );
    }

    if (updateTicketDto.displayOrder && updateTicketDto.statusId) {
      const ticketList = await this.displayOrderReorder(id, updateTicketDto);
      if (ticketList) {
        return ticketList;
      }

      updateData.displayOrder = updateTicketDto.displayOrder;
      updateData.statusId = updateTicketDto.statusId;
    }

    if (updateTicketDto.startDate) {
      if (
        ticket.endDate &&
        new Date(updateTicketDto.startDate) > new Date(ticket.endDate)
      ) {
        throw new ValidException([
          {
            property: updateTicketDto.startDate,
            message: VALIDATION_ERROR.DATE_ERROR,
          },
        ]);
      }
      updateData.startDate = new Date(updateTicketDto.startDate);
    }

    if (updateTicketDto.endDate) {
      if (
        !ticket.startDate ||
        new Date(ticket.startDate) > new Date(updateTicketDto.endDate)
      ) {
        throw new ValidException([
          {
            property: updateTicketDto.endDate,
            message: VALIDATION_ERROR.DATE_ERROR,
          },
        ]);
      }
      updateData.endDate = new Date(updateTicketDto.endDate);
    }

    if (Object.keys(updateData).length > 1) {
      return this.prisma.ticket.update({
        where: { id },
        data: updateData,
      });
    }
  }

  // displayOrder 재배치 로직
  async displayOrderReorder(id: number, updateTicketDto: UpdateTicketDto) {
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

    if (!ticketHasLessDisplayOrder || !ticketHasGreaterDisplayOrder) {
      return;
    }

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

      return this.prisma.ticket.findMany({
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
    if (!ticket) {
      throw new TicketException(TICKET_ERROR.TICKET_NOT_FOUND);
    }

    return ticket;
  }
}
