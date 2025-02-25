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
import { RequestUser } from '../auth/decorator/user.decorator';
import { AccessGuard } from '../auth/guard/access.guard';
import { BigIntInterceptor } from '../common/interceptor/big-int.interceptor';

@UseInterceptors(BigIntInterceptor)
@UseGuards(AccessGuard)
@Controller('api/board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  // api/board
  @Post()
  create(
    @RequestUser() requestUser: RequestUser,
    @Body() createBoardDto: CreateBoardDto,
  ) {
    return this.boardService.create(requestUser, createBoardDto);
  }

  // api/board?page=number
  @Get()
  boardList(
    @RequestUser() requestUser: RequestUser,
    @Query('page', ParseIntPipe) page: number = 1,
  ) {
    return this.boardService.boardList(page, requestUser);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @RequestUser() requestUser: RequestUser,
  ) {
    return this.boardService.findOne(id, requestUser);
  }

  // api/board/:id
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @RequestUser() requestUser: RequestUser,
    @Body() updateBoardDto: UpdateBoardDto,
  ) {
    return this.boardService.update(id, requestUser, updateBoardDto);
  }

  // api/board/:id
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @RequestUser() requestUser: RequestUser,
  ) {
    return this.boardService.remove(id, requestUser);
  }
}
