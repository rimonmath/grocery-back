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
import { GroceryService } from '../grocery.service';
import { CreateGroceryItemDto } from '../dto/create-grocery-item.dto';
import { UpdateGroceryItemDto } from '../dto/update-grocery-item.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UpdateInventoryDto } from '../dto/update-inventory.dto';

@Controller('admin/groceries') // Sets the base route to /admin/groceries
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminGroceryController {
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
    @Body() updateDto: UpdateGroceryItemDto, // Use the class here
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

  @Patch(':id/add-inventory')
  addInventory(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInventoryDto: UpdateInventoryDto,
  ) {
    return this.groceryService.addInventory(id, updateInventoryDto.count);
  }

  @Patch(':id/remove-inventory')
  removeInventory(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInventoryDto: UpdateInventoryDto,
  ) {
    return this.groceryService.removeInventory(id, updateInventoryDto.count);
  }
}
