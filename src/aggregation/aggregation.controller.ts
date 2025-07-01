import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AggregationService } from './aggregation.service';
import { CreateAggregationDto } from './dto/create-aggregation.dto';
import { UpdateAggregationDto } from './dto/update-aggregation.dto';

@Controller('aggregation')
export class AggregationController {
  constructor(private readonly aggregationService: AggregationService) {}

  @Post()
  create(@Body() createAggregationDto: CreateAggregationDto) {
    return this.aggregationService.create(createAggregationDto);
  }

  @Get()
  findAll() {
    return this.aggregationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.aggregationService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAggregationDto: UpdateAggregationDto) {
    return this.aggregationService.update(+id, updateAggregationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.aggregationService.remove(+id);
  }
}
