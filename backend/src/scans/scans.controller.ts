import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ScansService } from './scans.service';
import { CreateScanDto } from './dto/create-scan.dto';
import { DeleteScansDto } from './dto/delete-scans.dto';

@Controller('scans')
export class ScansController {
  constructor(private readonly scansService: ScansService) {}

  @Post()
  create(@Body() createScanDto: CreateScanDto) {
    return this.scansService.create(createScanDto);
  }

  @Get()
  findAll() {
    return this.scansService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.scansService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.scansService.removeOne(id);
  }

  @Delete()
  removeMany(@Body() deleteScansDto: DeleteScansDto) {
    return this.scansService.removeMany(deleteScansDto);
  }
}
