import { Controller, Get } from '@nestjs/common';
import { GroceryService } from '../grocery.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('public/items')
@Controller('public/items') // Full path: /api/public/items
export class PublicGroceryController {
  constructor(private readonly groceryService: GroceryService) {}

  @Get()
  @ApiOperation({ summary: 'View all available grocery items (Guest Access)' })
  async getAvailableItems() {
    // We call the 'findAllAvailable' method we created earlier in the service
    return this.groceryService.findAllAvailable();
  }
}
