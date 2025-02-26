import { PartialType } from '@nestjs/mapped-types';
import { CreateTicketDto } from './create-ticket.dto';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';
import { VALIDATION_ERROR } from '../../common/exception/valid.exception';

export class UpdateTicketDto extends PartialType(CreateTicketDto) {
  @IsOptional()
  @IsString({ message: VALIDATION_ERROR.TITLE_ERROR })
  title: string;

  @IsOptional()
  @IsString({ message: VALIDATION_ERROR.CONTENT_ERROR })
  content: string;

  @IsOptional()
  @IsNumber({}, { message: VALIDATION_ERROR.DISPLAY_ORDER_ERROR })
  displayOrder: number;

  @IsOptional()
  @IsDateString({}, { message: VALIDATION_ERROR.DATE_ERROR })
  startDate: string;

  @IsOptional()
  @IsDateString({}, { message: VALIDATION_ERROR.DATE_ERROR })
  endDate: string;

  @IsOptional()
  @IsNumber({}, { message: VALIDATION_ERROR.STATUS_ERROR })
  statusId: number;
}
