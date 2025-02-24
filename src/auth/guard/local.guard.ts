import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// {
//     "email":  "test@test.com",
//     "password": "password"
// }
@Injectable()
export class LocalGuard extends AuthGuard('local') {}
