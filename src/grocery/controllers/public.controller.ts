import { Controller, Get } from '@nestjs/common';
import { GroceryService } from '../grocery.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Public - Groceries') // Groups these endpoints in Swagger
@Controller('public/groceries') // Full path: /api/public/groceries
export class PublicGroceryController {
  constructor(private readonly groceryService: GroceryService) {}

  @Get()
  @ApiOperation({ summary: 'View all available grocery items (Guest Access)' })
  async getAvailableItems() {
    // We call the 'findAllAvailable' method we created earlier in the service
    return this.groceryService.findAllAvailable();
  }
}
