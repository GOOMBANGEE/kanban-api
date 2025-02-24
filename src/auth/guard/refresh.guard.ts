import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// header: 'bearer refreshToken'
@Injectable()
export class RefreshGuard extends AuthGuard('jwt-refresh') {}
