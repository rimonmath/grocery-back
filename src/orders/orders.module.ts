import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { UserController } from './controllers/user.controller';
import { AdminController } from './controllers/admin.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { GroceryItem } from '../grocery/entities/grocery-item.entity';
import { GroceryModule } from '../grocery/grocery.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, GroceryItem]),
    GroceryModule,
  ],
  controllers: [UserController, AdminController],
  providers: [OrdersService],
})
export class OrdersModule {}
