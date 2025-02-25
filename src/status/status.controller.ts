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
import { RequestUser } from '../auth/decorator/user.decorator';

@UseInterceptors(BigIntInterceptor)
@UseGuards(AccessGuard)
@Controller('api/status')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  // /api/status
  // return: { status }
  @Post()
  create(
    @RequestUser() requestUser: RequestUser,
    @Body() createStatusDto: CreateStatusDto,
  ) {
    return this.statusService.create(requestUser, createStatusDto);
  }

  // /api/status/:id
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @RequestUser() requestUser: RequestUser,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    return this.statusService.update(id, requestUser, updateStatusDto);
  }

  // /api/status/:boardId/:id
  @Delete(':boardId/:id')
  remove(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Param('id', ParseIntPipe) id: number,
    @RequestUser() requestUser: RequestUser,
  ) {
    return this.statusService.remove(boardId, id, requestUser);
  }
}
