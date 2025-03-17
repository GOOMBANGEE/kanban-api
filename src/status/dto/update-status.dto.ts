import { PartialType } from '@nestjs/mapped-types';
import { CreateStatusDto } from './create-status.dto';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { VALIDATION_ERROR } from '../../common/exception/valid.exception';

export class UpdateStatusDto extends PartialType(CreateStatusDto) {
  @IsOptional()
  @IsString({ message: VALIDATION_ERROR.TITLE_ERROR })
  title: string;

  @IsOptional()
  @IsString({ message: VALIDATION_ERROR.COLOR_ERROR })
  color: string;

  @IsOptional()
  @IsNumber({}, { message: VALIDATION_ERROR.DISPLAY_ORDER_ERROR })
  displayOrder: number;

  @IsOptional()
  @IsString({ message: VALIDATION_ERROR.GROUP_ERROR })
  group: string;
}
