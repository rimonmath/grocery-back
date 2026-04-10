import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroceryService } from './grocery.service';
import { GroceryItem } from './entities/grocery-item.entity';
import { AdminGroceryController } from './controllers/admin.controller';
import { PublicGroceryController } from './controllers/public.controller';

@Module({
  imports: [
    // This provides the Repository to the GroceryService
    TypeOrmModule.forFeature([GroceryItem]),
  ],
  controllers: [AdminGroceryController, PublicGroceryController],
  providers: [GroceryService],
  exports: [GroceryService],
})
export class GroceryModule {}
