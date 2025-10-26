import { IsArray, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteScansDto {
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @ApiProperty()
  ids: number[];
}
