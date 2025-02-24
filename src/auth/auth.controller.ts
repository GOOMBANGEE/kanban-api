import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { RefreshGuard } from './guard/refresh.guard';
import { RequestUser, RequestUserLocal } from './decorator/user.decorator';
import { Response } from 'express';
import { AccessGuard } from './guard/access.guard';
import { LocalGuard } from './guard/local.guard';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // /auth/register
  // return: set-cookie('token')
  @Post('register')
  register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.register(registerDto, response);
  }

  // /auth/login
  // return: {username, accessToken, accessTokenExpire}, set-cookie('refreshToken')
  @Post('login')
  @UseGuards(LocalGuard) // auth/guard/local.guard.ts => LocalGuard extends AuthGuard('local')
  @HttpCode(HttpStatus.OK)
  login(
    @RequestUser() requestUser: RequestUserLocal,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(requestUser, response);
  }

  // /auth/refresh
  // return: {id, username, accessToken, accessTokenExpire}
  @Get('refresh')
  @UseGuards(RefreshGuard)
  @HttpCode(HttpStatus.OK)
  async refresh(
    @RequestUser() requestUser: RequestUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.refreshToken(requestUser, response);
  }

  // /auth/logout
  // return: clear-cookie('refreshToken')
  @Get('logout')
  @UseGuards(AccessGuard)
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) response: Response) {
    return this.authService.logout(response);
  }
}
