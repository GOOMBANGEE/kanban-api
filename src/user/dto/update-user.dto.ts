import { IsOptional, Length, Matches } from 'class-validator';
import { VALIDATION_ERROR } from '../../common/exception/valid.exception';

export class UpdateUserDto {
  @IsOptional()
  @Length(2, 20, { message: VALIDATION_ERROR.USERNAME_ERROR })
  username: string;

  @IsOptional()
  @Matches(/^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*\d).{8,20}$/, {
    message: VALIDATION_ERROR.PASSWORD_ERROR,
  })
  prevPassword: string;

  @IsOptional()
  @Matches(/^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*\d).{8,20}$/, {
    message: VALIDATION_ERROR.PASSWORD_ERROR,
  })
  password: string;

  @IsOptional()
  @Matches(/^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*\d).{8,20}$/, {
    message: VALIDATION_ERROR.PASSWORD_ERROR,
  })
  confirmPassword: string;
}
