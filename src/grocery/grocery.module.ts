import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroceryService } from './grocery.service';
import { GroceryController } from './grocery.controller';
import { GroceryItem } from './entities/grocery-item.entity';
import { PublicGroceryController } from './public-grocery/public-grocery.controller';

@Module({
  imports: [
    // This provides the Repository to the GroceryService
    TypeOrmModule.forFeature([GroceryItem]),
  ],
  controllers: [GroceryController, PublicGroceryController],
  providers: [GroceryService],
  exports: [GroceryService],
})
export class GroceryModule {}
