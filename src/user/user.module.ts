import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [CommonModule, AuthModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
