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

@UseInterceptors(BigIntInterceptor)
@UseGuards(AccessGuard)
@Controller('api/status')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  // /api/status/:boardId
  // return: { status }
  @Post(':boardId')
  create(
    @Param('boardId', ParseIntPipe) boardId: number,
    @RequestUser() jwtUserInfo: JwtUserInfo,
    @Body() createStatusDto: CreateStatusDto,
  ) {
    return this.statusService.create(boardId, jwtUserInfo, createStatusDto);
  }

  // /api/status/:id
  @Patch(':boardId/:id')
  update(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Param('id', ParseIntPipe) id: number,
    @RequestUser() jwtUserInfo: JwtUserInfo,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    return this.statusService.update(boardId, id, jwtUserInfo, updateStatusDto);
  }

  // /api/status/:boardId/:id
  @Delete(':boardId/:id')
  remove(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Param('id', ParseIntPipe) id: number,
    @RequestUser() jwtUserInfo: JwtUserInfo,
  ) {
    return this.statusService.remove(boardId, id, jwtUserInfo);
  }
}
