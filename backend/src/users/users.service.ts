import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createIfNotExist(createUserDto: CreateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { username: createUserDto.username },
    });

    return user ?? this.prisma.user.create({ data: createUserDto });
  }

  async findOne(id: number) {
    // await new Promise((f) => setTimeout(f, 1000));
    return this.prisma.user.findFirst({
      where: { id: id },
    });
  }
}
