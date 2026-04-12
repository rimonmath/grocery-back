import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger'; // Add these
import { GroceryService } from '../grocery.service';
import { CreateGroceryItemDto } from '../dto/create-grocery-item.dto';
import { UpdateGroceryItemDto } from '../dto/update-grocery-item.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UpdateInventoryDto } from '../dto/update-inventory.dto';

@ApiTags('Admin - Groceries') // Groups these endpoints in Swagger
@ApiBearerAuth('access-token') // Links this controller to your Swagger security config
@Controller('admin/groceries')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminGroceryController {
  constructor(private readonly groceryService: GroceryService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new grocery item' })
  create(@Body() createGroceryItemDto: CreateGroceryItemDto) {
    return this.groceryService.create(createGroceryItemDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all grocery items' })
  findAll() {
    return this.groceryService.findAll();
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update grocery item details' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateGroceryItemDto,
  ) {
    return this.groceryService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a grocery item' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.groceryService.remove(id);
  }

  @Patch(':id/add-inventory')
  @ApiOperation({ summary: 'Increase inventory count' })
  addInventory(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInventoryDto: UpdateInventoryDto,
  ) {
    return this.groceryService.addInventory(id, updateInventoryDto.count);
  }

  @Patch(':id/remove-inventory')
  @ApiOperation({ summary: 'Decrease inventory count' })
  removeInventory(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInventoryDto: UpdateInventoryDto,
  ) {
    return this.groceryService.removeInventory(id, updateInventoryDto.count);
  }
}
