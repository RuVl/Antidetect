import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Length(4, 50)
  @ApiProperty()
  username: string;
}
