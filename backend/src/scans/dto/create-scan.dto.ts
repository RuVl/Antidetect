import { IsBoolean, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateScanDto {
  @IsBoolean()
  @ApiProperty()
  useAntiDetect: boolean;

  @IsInt()
  @Min(1)
  @ApiProperty()
  userId: number;
}
