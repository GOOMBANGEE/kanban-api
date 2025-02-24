import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import {
  USER_ERROR,
  UserException,
} from '../../common/exception/user.exception';
import { PrismaService } from '../../common/prisma.service';
import { RequestUser } from '../decorator/user.decorator';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const requestUser: RequestUser = request.user;

    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(requestUser.id) },
    });
    if (user?.role?.includes('admin')) return true;

    throw new UserException(USER_ERROR.PERMISSION_DENIED);
  }
}
