import {
  Body,
  Controller,
  Delete,
  Patch,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtUserInfo, RequestUser } from '../auth/decorator/user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { Response } from 'express';
import { AccessGuard } from '../auth/guard/access.guard';
import { USER_ERROR, UserException } from '../common/exception/user.exception';
import { Throttle } from '@nestjs/throttler';

@Controller('api/user')
@UseGuards(AccessGuard)
@Throttle({ default: { limit: 2, ttl: 1000 } })
export class UserController {
  constructor(private readonly userService: UserService) {}

  // /user
  @Patch()
  async update(
    @RequestUser() jwtUserInfo: JwtUserInfo,
    @Body() updateUserDto: UpdateUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    if (!jwtUserInfo || jwtUserInfo.role?.includes('admin')) {
      throw new UserException(USER_ERROR.PERMISSION_DENIED);
    }

    return this.userService.update(jwtUserInfo, updateUserDto, response);
  }

  // /user
  // return: clear-cookie('refreshToken')
  @Delete()
  async delete(
    @RequestUser() jwtUserInfo: JwtUserInfo,
    @Res({ passthrough: true }) response: Response,
  ) {
    if (!jwtUserInfo || jwtUserInfo.role?.includes('admin')) {
      throw new UserException(USER_ERROR.PERMISSION_DENIED);
    }

    return this.userService.delete(jwtUserInfo, response);
  }
}
