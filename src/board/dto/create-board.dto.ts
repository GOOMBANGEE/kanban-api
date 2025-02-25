import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { VALIDATION_ERROR } from '../../common/exception/valid.exception';

export class CreateBoardDto {
  @IsString({ message: VALIDATION_ERROR.TITLE_ERROR })
  @IsNotEmpty({ message: VALIDATION_ERROR.TITLE_ERROR })
  title: string;

  @IsOptional()
  @IsString({ message: VALIDATION_ERROR.ICON_ERROR })
  icon: string;
}
