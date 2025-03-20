import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { envKey } from 'src/common/const/env.const';
import { RegisterDto } from './dto/register.dto';
import { Response } from 'express';
import { CookieOptions } from 'express-serve-static-core';
import { PrismaService } from '../common/prisma.service';
import { USER_ERROR, UserException } from '../common/exception/user.exception';
import {
  JwtUserInfo,
  LocalUserInfo,
  UserBase,
} from './decorator/user.decorator';

@Injectable()
export class AuthService {
  private readonly saltOrRounds: number;
  private readonly accessTokenKey: string;
  private readonly accessTokenExpires: number;
  private readonly accessTokenSecret: string;
  private readonly refreshTokenKey: string;
  private readonly refreshTokenExpires: number;
  private readonly refreshTokenSecret: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.saltOrRounds = Number(this.configService.get(envKey.saltOrRounds));
    this.accessTokenKey = this.configService.get(envKey.accessTokenKey);
    this.accessTokenExpires = this.configService.get(envKey.accessTokenExpires);
    this.accessTokenSecret = this.configService.get(envKey.accessTokenSecret);
    this.refreshTokenKey = this.configService.get(envKey.refreshTokenKey);
    this.refreshTokenExpires = this.configService.get(
      envKey.refreshTokenExpires,
    );
    this.refreshTokenSecret = this.configService.get(envKey.refreshTokenSecret);
  }

  // /auth/register
  // return: set-cookie('token')
  async register(registerDto: RegisterDto, response: Response) {
    const username = registerDto.username;
    const password = registerDto.password;
    const confirmPassword = registerDto.confirmPassword;

    if (password !== confirmPassword) {
      throw new UserException(USER_ERROR.PASSWORD_DO_NOT_MATCH);
    }

    // 중복체크
    if (await this.prisma.user.findUnique({ where: { username } })) {
      throw new UserException(USER_ERROR.USERNAME_EXIST);
    }

    const hashedPassword = await bcrypt.hash(password, this.saltOrRounds);
    delete registerDto.confirmPassword;
    const user = await this.prisma.user.create({
      data: { ...registerDto, password: hashedPassword },
    });

    const localUserInfo: LocalUserInfo = {
      id: user.id.toString(),
      username: user.username,
      role: user.role,
      registerDate: user.registerDate,
      activated: user.activated,
    };

    const { accessToken, accessTokenExpires } =
      await this.generateAccessToken(localUserInfo);
    await this.generateRefreshToken(localUserInfo, response);

    return {
      username: registerDto.username,
      accessToken,
      accessTokenExpires,
    };
  }

  // /auth/login -> localStrategy -> validateUser -> return user
  async validateUser(username: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new UserException(USER_ERROR.UNREGISTERED);
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      const result = { ...user, id: user.id.toString() };
      delete result.password;
      return result;
    }

    throw new UserException(USER_ERROR.USERNAME_OR_PASSWORD_ERROR);
  }

  // /auth/login
  async login(localUserInfo: LocalUserInfo, response: Response) {
    const { accessToken, accessTokenExpires } =
      await this.generateAccessToken(localUserInfo);
    await this.generateRefreshToken(localUserInfo, response);

    return {
      username: localUserInfo.username,
      accessToken,
      accessTokenExpires,
    };
  }

  async generateAccessToken(user: UserBase) {
    const accessTokenExpires = this.accessTokenExpires;
    // expiresIn => 1s단위 => 3600 => 1h
    const accessToken = await this.jwtService.signAsync(
      {
        id: user.id,
        username: user.username,
        type: this.accessTokenKey,
        role: user.role,
      },
      { secret: this.accessTokenSecret, expiresIn: accessTokenExpires },
    );

    return { accessToken, accessTokenExpires };
  }

  async generateRefreshToken(user: UserBase, response: Response) {
    const refreshToken = await this.jwtService.signAsync(
      {
        id: user.id,
        username: user.username,
        type: this.refreshTokenKey,
        role: user.role,
      },
      { secret: this.refreshTokenSecret, expiresIn: this.refreshTokenExpires },
    );

    // maxAge => (Date.now() +) this.refreshTokenExpires (ms)
    const cookieOptions: CookieOptions = {
      httpOnly: true, // can't be accessed by JavaScript => reduces XSS risk
      secure: process.env.NODE_ENV === 'production', // send only over HTTPS in production
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : undefined, // CSRF protection
      maxAge: this.refreshTokenExpires * 1000, // set cookie expiration
    };
    response.cookie(this.refreshTokenKey, refreshToken, cookieOptions);
  }

  // /auth/refresh
  async refreshToken(jwtUserInfo: JwtUserInfo, response: Response) {
    if (
      jwtUserInfo.type !== this.refreshTokenKey ||
      Date.now() >= jwtUserInfo.exp * 1000
    ) {
      response.clearCookie(this.refreshTokenKey);
      throw new UserException(USER_ERROR.REFRESH_TOKEN_INVALID);
    }
    const { accessToken, accessTokenExpires } =
      await this.generateAccessToken(jwtUserInfo);

    return {
      id: jwtUserInfo.id,
      username: jwtUserInfo.username,
      accessToken,
      accessTokenExpires,
    };
  }

  // /auth/logout
  async logout(response: Response) {
    response.clearCookie(this.refreshTokenKey);
  }

  async validateRequestUser(jwtUserInfo: JwtUserInfo) {
    if (jwtUserInfo) {
      try {
        return await this.prisma.user.findUnique({
          where: { id: BigInt(jwtUserInfo.id) },
        });
      } catch {
        throw new UserException(USER_ERROR.UNREGISTERED);
      }
    }

    throw new UserException(USER_ERROR.UNREGISTERED);
  }
}
