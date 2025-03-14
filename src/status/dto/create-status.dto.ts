import { IsNotEmpty, IsString } from 'class-validator';
import { VALIDATION_ERROR } from '../../common/exception/valid.exception';

export class CreateStatusDto {
  @IsString({ message: VALIDATION_ERROR.TITLE_ERROR })
  @IsNotEmpty({ message: VALIDATION_ERROR.TITLE_ERROR })
  title: string;

  @IsString({ message: VALIDATION_ERROR.COLOR_ERROR })
  @IsNotEmpty({ message: VALIDATION_ERROR.COLOR_ERROR })
  color: string;

  @IsString({ message: VALIDATION_ERROR.GROUP_ERROR })
  @IsNotEmpty({ message: VALIDATION_ERROR.GROUP_ERROR })
  group: string;
}
