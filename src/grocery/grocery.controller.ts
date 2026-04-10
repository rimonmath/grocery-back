import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { GroceryService } from './grocery.service';
import { CreateGroceryItemDto } from './dto/create-grocery-item.dto';

@Controller('admin/groceries') // Sets the base route to /admin/groceries
export class GroceryController {
  constructor(private readonly groceryService: GroceryService) {}

  @Post()
  create(@Body() createGroceryItemDto: CreateGroceryItemDto) {
    return this.groceryService.create(createGroceryItemDto);
  }

  @Get()
  findAll() {
    return this.groceryService.findAll();
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: Partial<CreateGroceryItemDto>,
  ) {
    return this.groceryService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.groceryService.remove(id);
  }

  @Get('/items')
  findAllAvailable() {
    return this.groceryService.findAllAvailable();
  }
}
