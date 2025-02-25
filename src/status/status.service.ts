import { Injectable } from '@nestjs/common';
import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { PrismaService } from '../common/prisma.service';
import { AuthService } from '../auth/auth.service';
import { BoardService } from '../board/board.service';
import { RequestUser } from '../auth/decorator/user.decorator';
import {
  STATUS_ERROR,
  StatusException,
} from '../common/exception/status.exception';
import {
  VALIDATION_ERROR,
  ValidException,
} from '../common/exception/valid.exception';
import { Status } from '@prisma/client';

const group = {
  todo: 'todo',
  inProgress: 'inProgress',
  complete: 'complete',
};

const color = {
  black: 'black',
  gray: 'gray',
  brown: 'brown',
  orange: 'orange',
  yellow: 'yellow',
  green: 'green',
  blue: 'blue',
  purple: 'purple',
  pink: 'pink',
  red: 'red',
};

@Injectable()
export class StatusService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly boardService: BoardService,
  ) {}

  async create(requestUser: RequestUser, createStatusDto: CreateStatusDto) {
    await Promise.all([
      this.authService.validateRequestUser(requestUser),
      this.boardService.validateBoard(createStatusDto.boardId, requestUser),
      this.validateStatusGroup(createStatusDto.group),
    ]);
    const lastStatus = await this.prisma.status.findFirst({
      where: { boardId: createStatusDto.boardId, logicDelete: false },
      select: { displayOrder: true },
      orderBy: { displayOrder: 'desc' },
    });

    return this.prisma.status.create({
      data: {
        title: createStatusDto.title,
        color: color.black,
        displayOrder: lastStatus ? lastStatus.displayOrder * 2 : 1024.0,
        boardId: createStatusDto.boardId,
        group: createStatusDto.group,
      },
    });
  }

  async update(
    id: number,
    requestUser: RequestUser,
    updateStatusDto: UpdateStatusDto,
  ) {
    const [, , status] = await Promise.all([
      this.authService.validateRequestUser(requestUser),
      this.boardService.validateBoard(updateStatusDto.boardId, requestUser),
      this.validateStatus(id),
      this.validateStatusColor(updateStatusDto.color),
      this.validateStatusGroup(updateStatusDto.group),
    ]);
    // displayOrder 재배치 로직
    if (updateStatusDto.displayOrder) {
      const statusList = await this.displayOrderReorder(
        id,
        updateStatusDto,
        status,
      );
      if (statusList) return statusList;
    }

    const updateData = {
      title: updateStatusDto.title ? updateStatusDto.title : status.title,
      color: updateStatusDto.color ? updateStatusDto.color : status.color,
      displayOrder: updateStatusDto.displayOrder
        ? updateStatusDto.displayOrder
        : status.displayOrder,
      group: updateStatusDto.group ? updateStatusDto.group : status.group,
    };

    await this.prisma.status.update({
      where: { id: status.id, logicDelete: false },
      data: {
        ...updateData,
      },
    });
  }

  // displayOrder 재배치 로직
  async displayOrderReorder(
    id: number,
    updateStatusDto: UpdateStatusDto,
    status: Status,
  ) {
    // 들어온 display order에 대해서 앞 뒤에 해당하는 status가 소수점 다섯째자리까지 같은경우 -> 앞뒤의 status id 기억
    const [statusHasLessDisplayOrder, statusHasGreaterDisplayOrder] =
      await this.prisma.$transaction([
        this.prisma.status.findFirst({
          select: {
            id: true,
            displayOrder: true,
          },
          where: {
            boardId: updateStatusDto.boardId,
            group: updateStatusDto.group,
            logicDelete: false,
            displayOrder: {
              lt: updateStatusDto.displayOrder,
            },
          },
          orderBy: { displayOrder: 'desc' },
        }),
        this.prisma.status.findFirst({
          select: {
            id: true,
            displayOrder: true,
          },
          where: {
            boardId: updateStatusDto.boardId,
            group: updateStatusDto.group,
            id: { not: id },
            logicDelete: false,
            displayOrder: {
              gt: updateStatusDto.displayOrder,
            },
          },
          orderBy: { displayOrder: 'asc' },
        }),
      ]);

    if (!statusHasLessDisplayOrder || !statusHasGreaterDisplayOrder) return;
    if (
      Math.trunc(updateStatusDto.displayOrder * 10000) ===
        Math.trunc(statusHasLessDisplayOrder.displayOrder * 10000) ||
      Math.trunc(updateStatusDto.displayOrder * 10000) ===
        Math.trunc(statusHasGreaterDisplayOrder.displayOrder * 10000)
    ) {
      // status displayOrder 재정렬
      await this.prisma.$queryRaw`
        WITH Ordered AS (
            SELECT id, ROW_NUMBER() OVER (ORDER BY display_order) AS rn
            FROM "Status" s
            WHERE s.board_id = ${updateStatusDto.boardId} AND
                  s.logic_delete = false AND
                  s.group = ${updateStatusDto.group} AND
                  NOT s.id = ${id} 
        )
        UPDATE "Status" t
        SET display_order = POWER(2, o.rn - 1) * 1024
        FROM Ordered o
        WHERE t.id = o.id`;

      const [statusLessUpdated, statusGreaterUpdated] =
        await this.prisma.$transaction([
          this.prisma.status.findUnique({
            select: {
              id: true,
              displayOrder: true,
            },
            where: { id: statusHasLessDisplayOrder.id },
          }),
          this.prisma.status.findUnique({
            select: {
              id: true,
              displayOrder: true,
            },
            where: { id: statusHasGreaterDisplayOrder.id },
          }),
        ]);

      const updateData = {
        title: updateStatusDto.title ? updateStatusDto.title : status.title,
        color: updateStatusDto.color ? updateStatusDto.color : status.color,
        group: updateStatusDto.group ? updateStatusDto.group : status.group,
      };

      await this.prisma.status.update({
        where: { id },
        data: {
          ...updateData,
          displayOrder:
            (statusLessUpdated.displayOrder +
              statusGreaterUpdated.displayOrder) /
            2,
        },
      });

      const statusList = await this.prisma.status.findMany({
        select: {
          id: true,
          title: true,
          color: true,
          displayOrder: true,
          group: true,
        },
        where: {
          boardId: updateStatusDto.boardId,
          logicDelete: false,
        },
      });
      return { statusList };
    }
  }

  async remove(boardId: number, id: number, requestUser: RequestUser) {
    await Promise.all([
      this.authService.validateRequestUser(requestUser),
      this.boardService.validateBoard(boardId, requestUser),
      this.validateStatus(id),
    ]);

    await this.prisma.status.update({
      where: { id },
      data: { logicDelete: true },
    });
  }

  async validateStatusColor(checkColor: string) {
    if (checkColor && !Object.values(color).includes(checkColor)) {
      throw new ValidException([
        {
          property: checkColor,
          message: VALIDATION_ERROR.COLOR_ERROR,
        },
      ]);
    }
  }
  async validateStatusGroup(checkGroup: string) {
    if (checkGroup && !Object.values(group).includes(checkGroup)) {
      throw new ValidException([
        {
          property: checkGroup,
          message: VALIDATION_ERROR.GROUP_ERROR,
        },
      ]);
    }
  }
  async validateStatus(id: number) {
    const status = await this.prisma.status.findUnique({
      where: { id, logicDelete: false },
    });
    if (!status) throw new StatusException(STATUS_ERROR.STATUS_NOT_FOUND);

    return status;
  }
}
