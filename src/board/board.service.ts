import { Injectable } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { JwtUserInfo } from '../auth/decorator/user.decorator';
import { PrismaService } from '../common/prisma.service';
import { AuthService } from '../auth/auth.service';
import {
  BOARD_ERROR,
  BoardException,
} from '../common/exception/board.exception';
import { ImageService } from '../common/image.service';
import { Status } from '@prisma/client';
import { statusColor, statusGroup } from '../status/status.constants';
import { ConfigService } from '@nestjs/config';
import { envKey } from '../common/const/env.const';

@Injectable()
export class BoardService {
  private readonly inviteCodeLength;
  private readonly characters;
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly imageService: ImageService,
    private readonly configService: ConfigService,
  ) {
    this.inviteCodeLength = this.configService.get(envKey.inviteCodeLength);
    this.characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  }

  async create(jwtUserInfo: JwtUserInfo, createBoardDto: CreateBoardDto) {
    // 가입된 유저인지 검증
    const user = await this.authService.validateRequestUser(jwtUserInfo);

    // icon 추가로직
    // 파일로 추가한 다음 파일경로만 db에 저장
    let image = null;
    if (createBoardDto.icon) {
      image = await this.imageService.saveIcon(createBoardDto.icon);
    }

    // board 생성
    let board: {
      id: bigint;
      title: string;
      inviteCode: string | null;
      icon: string | null;
      logicDelete: boolean;
      userId: bigint;
    };
    await this.prisma.$transaction(async (tx) => {
      board = await tx.board.create({
        data: {
          title: createBoardDto.title,
          icon: image ? image.imageUrl : null,
          userId: user.id,
        },
      });
      await tx.boardUserRelation.create({
        data: { boardId: board.id, userId: user.id },
      });
    });

    const defaultStatus: Omit<Status, 'id' | 'logicDelete'>[] = [
      {
        title: 'Not started',
        color: statusColor.black,
        displayOrder: 1024.0,
        boardId: board.id,
        group: statusGroup.todo,
      },
      {
        title: 'In progress',
        color: statusColor.blue,
        displayOrder: 2048.0,
        boardId: board.id,
        group: statusGroup.inProgress,
      },
      {
        title: 'Done',
        color: statusColor.green,
        displayOrder: 4096.0,
        boardId: board.id,
        group: statusGroup.complete,
      },
    ];
    await this.prisma.status.createMany({
      data: defaultStatus,
    });

    // board 아이디 반환
    return board.id;
  }

  async boardList(page: number, jwtUserInfo: JwtUserInfo) {
    // 가입된 유저인지 검증
    const user = await this.authService.validateRequestUser(jwtUserInfo);
    const limit = 10;

    const boardUserRelationList = await this.prisma.boardUserRelation.findMany({
      where: { userId: user.id },
    });
    const total = boardUserRelationList.length;
    const boardIdList = boardUserRelationList.map(
      (boardUserRelation) => boardUserRelation.boardId,
    );

    const boardList = await this.prisma.board.findMany({
      where: { id: { in: boardIdList } },
      take: limit,
      select: {
        id: true,
        title: true,
        inviteCode: true,
        icon: true,
        userId: true,
      },
      orderBy: {
        id: 'desc',
      },
    });

    const processedBoardList = boardList.map((board) => ({
      id: board.id,
      title: board.title,
      inviteCode: board.userId === user.id ? board.inviteCode : undefined,
      icon: board.icon,
      userId: board.userId,
    }));

    return {
      boardList: processedBoardList,
      total,
      page,
      totalPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: number, jwtUserInfo: JwtUserInfo) {
    const boardInfo = await this.validateBoardUserRelation(id, jwtUserInfo);

    const [statusList, userList] = await this.prisma.$transaction([
      this.prisma.status.findMany({
        select: {
          id: true,
          title: true,
          color: true,
          displayOrder: true,
          group: true,
          Ticket: {
            select: {
              id: true,
              title: true,
              content: true,
              displayOrder: true,
              startDate: true,
              endDate: true,
              statusId: true,
            },
            where: { logicDelete: false },
          },
        },
        where: { boardId: id, logicDelete: false },
      }),
      this.prisma.boardUserRelation.findMany({
        select: { userId: true },
        where: { boardId: id },
      }),
    ]);

    return { board: boardInfo.board, statusList, userList };
  }

  async update(
    id: number,
    jwtUserInfo: JwtUserInfo,
    updateBoardDto: UpdateBoardDto,
  ) {
    const boardInfo = await this.validateBoardOwner(id, jwtUserInfo);

    // icon 추가로직
    // 파일로 추가한 다음 파일경로만 db에 저장
    let image: { imageUrl: string } = null;
    if (updateBoardDto.icon) {
      image = await this.imageService.saveIcon(updateBoardDto.icon);
    }

    return this.prisma.board.update({
      select: { id: true, title: true, icon: true },
      where: { id },
      data: {
        ...boardInfo.board,
        ...updateBoardDto,
        icon: image ? image.imageUrl : null,
      },
    });
  }

  async remove(id: number, jwtUserInfo: JwtUserInfo) {
    const boardInfo = await this.validateBoardOwner(id, jwtUserInfo);

    // 삭제
    await this.prisma.$transaction([
      this.prisma.board.update({
        where: { id: id },
        data: { logicDelete: true },
      }),
      this.prisma.boardUserRelation.deleteMany({
        where: { boardId: id },
      }),
    ]);
    return boardInfo.board;
  }

  async invite(id: number, jwtUserInfo: JwtUserInfo, regenerate: boolean) {
    const boardInfo = await this.validateBoardOwner(id, jwtUserInfo);

    if (!regenerate && boardInfo.board.inviteCode) {
      return boardInfo.board.inviteCode;
    }
    const inviteCode = await this.generateInviteCode();

    await this.prisma.board.update({ where: { id }, data: { inviteCode } });
    return inviteCode;
  }

  async generateInviteCode() {
    const inviteCode = Array.from(
      { length: this.inviteCodeLength },
      () => this.characters[Math.floor(Math.random() * this.characters.length)],
    ).join('');

    const existingBoard = await this.prisma.board.findUnique({
      where: { inviteCode },
    });
    if (existingBoard) {
      return this.generateInviteCode();
    }
    return inviteCode;
  }

  async checkInviteCode(inviteCode: string, jwtUserInfo: JwtUserInfo) {
    const user = await this.authService.validateRequestUser(jwtUserInfo);
    const board = await this.prisma.board.findUnique({
      where: { inviteCode },
    });

    if (board.inviteCode !== inviteCode) {
      throw new BoardException(BOARD_ERROR.INVALID_CODE);
    }

    const boardUserRelation = await this.prisma.boardUserRelation.findFirst({
      where: { boardId: board.id, userId: user.id },
    });

    if (boardUserRelation) {
      throw new BoardException(BOARD_ERROR.ALREADY_PARTICIPANT);
    }
    return { id: board.id, title: board.title };
  }

  async deleteInviteCode(id: number, jwtUserInfo: JwtUserInfo) {
    await this.validateBoardOwner(id, jwtUserInfo);
    await this.prisma.board.update({
      select: { inviteCode: true },
      data: { inviteCode: null },
      where: {
        id,
      },
    });
  }

  async join(id: number, inviteCode: string, jwtUserInfo: JwtUserInfo) {
    await this.checkInviteCode(inviteCode, jwtUserInfo);
    await this.prisma.boardUserRelation.create({
      data: { boardId: id, userId: BigInt(jwtUserInfo.id) },
    });

    return id;
  }

  async kick(id: number, jwtUserInfo: JwtUserInfo, userId: number) {
    const boardInfo = await this.validateBoardOwner(id, jwtUserInfo);
    if (boardInfo.board.userId === BigInt(userId)) {
      throw new BoardException(BOARD_ERROR.REQUEST_INVALID);
    }

    await this.prisma.boardUserRelation.deleteMany({
      where: { boardId: boardInfo.board.id, userId },
    });
    return userId;
  }

  async leave(id: number, jwtUserInfo: JwtUserInfo) {
    const boardInfo = await this.validateBoardUserRelation(id, jwtUserInfo);
    // owner인 경우 다른 유저가 남아있을때 나갈수없다
    // owner가 나간경우 board 삭제처리
    if (boardInfo.board.userId === BigInt(jwtUserInfo.id)) {
      const remainingUser = await this.prisma.boardUserRelation.findMany({
        where: {
          boardId: boardInfo.board.id,
          userId: { not: BigInt(jwtUserInfo.id) },
        },
      });
      if (remainingUser.length > 0) {
        throw new BoardException(BOARD_ERROR.REMAINING_USER);
      }

      await this.prisma.$transaction(async (tx) => {
        await tx.board.update({
          where: { id: boardInfo.board.id },
          data: { logicDelete: true },
        });
        await tx.boardUserRelation.deleteMany({
          where: {
            boardId: boardInfo.board.id,
            userId: BigInt(jwtUserInfo.id),
          },
        });
      });
    }

    await this.prisma.boardUserRelation.deleteMany({
      where: { boardId: boardInfo.board.id, userId: BigInt(jwtUserInfo.id) },
    });
  }

  async validateBoardExisting(id: number) {
    const board = await this.prisma.board.findUnique({
      where: { id, logicDelete: false },
    });

    if (!board) throw new BoardException(BOARD_ERROR.BOARD_NOT_FOUND);

    return board;
  }

  async validateBoardUserRelation(id: number, jwtUserInfo: JwtUserInfo) {
    const [board, boardUserRelation] = await this.prisma.$transaction([
      this.prisma.board.findUnique({
        where: { id, logicDelete: false },
      }),
      this.prisma.boardUserRelation.findFirst({
        where: { boardId: id, userId: BigInt(jwtUserInfo.id) },
      }),
    ]);

    if (!board) throw new BoardException(BOARD_ERROR.BOARD_NOT_FOUND);
    if (!boardUserRelation)
      throw new BoardException(BOARD_ERROR.PERMISSION_DENIED);

    return { board, boardUserRelation };
  }

  async validateBoardOwner(id: number, jwtUserInfo: JwtUserInfo) {
    const [board, boardUserRelation] = await this.prisma.$transaction([
      this.prisma.board.findUnique({
        where: { id, logicDelete: false },
      }),
      this.prisma.boardUserRelation.findFirst({
        where: { boardId: id, userId: BigInt(jwtUserInfo.id) },
      }),
    ]);

    if (!board) throw new BoardException(BOARD_ERROR.BOARD_NOT_FOUND);
    if (board.userId !== BigInt(jwtUserInfo.id))
      throw new BoardException(BOARD_ERROR.PERMISSION_DENIED);

    return { board, boardUserRelation };
  }
}
