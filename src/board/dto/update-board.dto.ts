import { PartialType } from '@nestjs/mapped-types';
import { CreateBoardDto } from './create-board.dto';
import { IsOptional, IsString } from 'class-validator';
import { VALIDATION_ERROR } from '../../common/exception/valid.exception';

export class UpdateBoardDto extends PartialType(CreateBoardDto) {
  @IsOptional()
  @IsString({ message: VALIDATION_ERROR.TITLE_ERROR })
  title: string;
}
