import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { GroceryItem } from '../grocery/entities/grocery-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
  ) {}

  async createOrder(dto: CreateOrderDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = new Order();
      // In a real app, you'd get user from Request. For now, we'll omit user or use a dummy ID.
      const savedOrder = await queryRunner.manager.save(order);
      const orderItems: OrderItem[] = [];

      for (const itemDto of dto.items) {
        const groceryItem = await queryRunner.manager.findOne(GroceryItem, {
          where: { id: itemDto.groceryItemId },
          lock: { mode: 'pessimistic_write' }, // Prevents other transactions from editing this row
        });

        if (!groceryItem) {
          throw new NotFoundException(
            `Item ${itemDto.groceryItemId} not found`,
          );
        }

        if (groceryItem.inventoryCount < itemDto.quantity) {
          throw new BadRequestException(
            `Insufficient stock for ${groceryItem.name}`,
          );
        }

        // Update Stock
        groceryItem.inventoryCount -= itemDto.quantity;
        await queryRunner.manager.save(groceryItem);

        // Create Order Item
        const orderItem = new OrderItem();
        orderItem.order = savedOrder;
        orderItem.groceryItem = groceryItem;
        orderItem.quantity = itemDto.quantity;
        orderItem.priceAtPurchase = groceryItem.price;
        orderItems.push(orderItem);
      }

      await queryRunner.manager.save(OrderItem, orderItems);
      await queryRunner.commitTransaction();

      return { message: 'Order placed successfully', orderId: savedOrder.id };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
