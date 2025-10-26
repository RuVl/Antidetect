import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { username: createUserDto.username },
    });

    if (user) {
      throw new BadRequestException(
        `User with username=${createUserDto.username} already exists`,
      );
    }

    return this.prisma.user.create({ data: createUserDto });
  }
}
