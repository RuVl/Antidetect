import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateScanDto } from './dto/create-scan.dto';
import { PrismaService } from '../prisma.service';
import { DeleteScansDto } from './dto/delete-scans.dto';

@Injectable()
export class ScansService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createScanDto: CreateScanDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: createScanDto.userId },
    });

    if (!user) {
      throw new NotFoundException(
        `User with id=${createScanDto.userId} not found`,
      );
    }

    return this.prisma.scan.create({ data: createScanDto });
  }

  async findAll() {
    return this.prisma.scan.findMany();
  }

  async findOne(id: number) {
    return this.prisma.scan.findFirst({
      where: { id: id },
    });
  }

  async removeOne(id: number) {
    const scan = await this.prisma.scan.findUnique({
      where: { id: id },
    });

    if (!scan) {
      throw new NotFoundException(`User with id=${id} not found`);
    }

    return this.prisma.scan.delete({
      where: { id: id },
    });
  }

  async removeMany({ ids }: DeleteScansDto) {
    const existingScans = await this.prisma.scan.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    });
    const existingIds = new Set(existingScans.map((scan) => scan.id));

    if (existingIds.size !== ids.length) {
      const notFoundIds = ids.filter((id) => !existingIds.has(id));
      throw new NotFoundException(
        `No scans found for the ids: ${notFoundIds.join(',')}`,
      );
    }

    const result = await this.prisma.$transaction(
      async (prisma) =>
        await prisma.scan.deleteMany({
          where: { id: { in: Array.from(existingIds) } },
        }),
    );

    return { deletedCount: result.count };
  }
}
