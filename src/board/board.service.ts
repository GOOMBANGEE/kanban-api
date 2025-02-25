import { Injectable } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { RequestUser } from '../auth/decorator/user.decorator';
import { PrismaService } from '../common/prisma.service';
import { AuthService } from '../auth/auth.service';
import {
  BOARD_ERROR,
  BoardException,
} from '../common/exception/board.exception';
import { ImageService } from '../common/image.service';

@Injectable()
export class BoardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly imageService: ImageService,
  ) {}

  async create(requestUser: RequestUser, createBoardDto: CreateBoardDto) {
    // 가입된 유저인지 검증
    const user = await this.authService.validateRequestUser(requestUser);

    // icon 추가로직
    // 파일로 추가한 다음 파일경로만 db에 저장
    const image = await this.imageService.saveIcon(createBoardDto.icon);

    // board 생성
    const board = await this.prisma.board.create({
      data: {
        title: createBoardDto.title,
        icon: image.imageUrl,
        userId: user.id,
      },
    });

    // board 아이디 반환
    return board.id;
  }

  async boardList(page: number, requestUser: RequestUser) {
    // 가입된 유저인지 검증
    const user = await this.authService.validateRequestUser(requestUser);
    const limit = 10;

    const [boardList, total] = await this.prisma.$transaction([
      this.prisma.board.findMany({
        where: { logicDelete: false, userId: user.id },
        take: limit,
        select: {
          id: true,
          title: true,
          icon: true,
          userId: true,
        },
        orderBy: {
          id: 'desc',
        },
      }),
      this.prisma.board.count({
        where: { userId: user.id, logicDelete: false },
      }),
    ]);

    return {
      boardList,
      total,
      page,
      totalPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: number, requestUser: RequestUser) {
    await Promise.all([
      this.authService.validateRequestUser(requestUser),
      this.validateBoard(id, requestUser),
    ]);

    const statusList = await this.prisma.status.findMany({
      select: {
        id: true,
        title: true,
        color: true,
        displayOrder: true,
        group: true,
      },
      where: { boardId: id, logicDelete: false },
    });
    return { statusList };
  }

  async update(
    id: number,
    requestUser: RequestUser,
    updateBoardDto: UpdateBoardDto,
  ) {
    const [, board] = await Promise.all([
      this.authService.validateRequestUser(requestUser),
      this.validateBoard(id, requestUser),
    ]);

    // icon 추가로직
    // 파일로 추가한 다음 파일경로만 db에 저장
    let image: { imageUrl: string } = null;
    if (updateBoardDto.icon) {
      image = await this.imageService.saveIcon(updateBoardDto.icon);
    }

    await this.prisma.board.update({
      where: { id },
      data: {
        title: updateBoardDto.title ? updateBoardDto.title : board.title,
        icon: image ? image.imageUrl : null,
      },
    });
  }

  async remove(id: number, requestUser: RequestUser) {
    await Promise.all([
      this.authService.validateRequestUser(requestUser),
      this.validateBoard(id, requestUser),
    ]);

    // 삭제
    await this.prisma.board.update({
      where: { id: id },
      data: { logicDelete: true },
    });
  }

  async validateBoard(id: number, requestUser: RequestUser) {
    const board = await this.prisma.board.findUnique({
      where: { id, logicDelete: false },
    });
    if (!board) throw new BoardException(BOARD_ERROR.BOARD_NOT_FOUND);
    if (board.userId !== BigInt(requestUser.id))
      throw new BoardException(BOARD_ERROR.PERMISSION_DENIED);

    return board;
  }
}
