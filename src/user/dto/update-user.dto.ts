import { IsOptional, Length, Matches } from 'class-validator';
import { VALIDATION_ERROR } from '../../common/exception/valid.exception';

export class UpdateUserDto {
  @IsOptional()
  @Length(2, 20, { message: VALIDATION_ERROR.USERNAME_ERROR })
  newUsername: string;

  @IsOptional()
  @Matches(/^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*\d).{8,20}$/, {
    message: VALIDATION_ERROR.PASSWORD_ERROR,
  })
  prevPassword: string;

  @IsOptional()
  @Matches(/^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*\d).{8,20}$/, {
    message: VALIDATION_ERROR.PASSWORD_ERROR,
  })
  newPassword: string;

  @IsOptional()
  @Matches(/^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*\d).{8,20}$/, {
    message: VALIDATION_ERROR.PASSWORD_ERROR,
  })
  newConfirmPassword: string;
}
