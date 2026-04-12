import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { GroceryItem } from '../grocery/entities/grocery-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { GroceryService } from '../grocery/grocery.service';

@Injectable()
export class OrdersService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    private readonly groceryService: GroceryService,
  ) {}

  /**
   * USER: Create a new order
   * Uses a transaction to ensure atomicity between inventory deduction and order creation.
   */
  async createOrder(userId: number, dto: CreateOrderDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = new Order();
      order.user = { id: userId } as any;
      order.status = OrderStatus.PENDING;
      order.totalPrice = 0;

      const orderItems: OrderItem[] = [];
      let runningTotal = 0;

      for (const itemDto of dto.items) {
        // Lock the row to prevent concurrent modifications during checkout
        const groceryItem = await queryRunner.manager.findOne(GroceryItem, {
          where: { id: itemDto.groceryItemId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!groceryItem) {
          throw new NotFoundException(
            `Item with ID ${itemDto.groceryItemId} not found`,
          );
        }

        if (groceryItem.inventoryCount < itemDto.quantity) {
          throw new BadRequestException(
            `Insufficient stock for ${groceryItem.name}. Requested: ${itemDto.quantity}, Available: ${groceryItem.inventoryCount}`,
          );
        }

        // 1. Deduct Stock
        groceryItem.inventoryCount -= itemDto.quantity;
        await queryRunner.manager.save(groceryItem);

        // 2. Create OrderItem Snapshot
        const orderItem = new OrderItem();
        orderItem.groceryItem = groceryItem;
        orderItem.quantity = itemDto.quantity;
        orderItem.priceAtPurchase = groceryItem.price;

        runningTotal += Number(orderItem.priceAtPurchase) * itemDto.quantity;
        orderItems.push(orderItem);
      }

      order.items = orderItems;
      order.totalPrice = runningTotal;

      // 3. Save Order (Cascades to OrderItems)
      const savedOrder = await queryRunner.manager.save(Order, order);

      await queryRunner.commitTransaction();

      return {
        message: 'Order placed successfully and is currently pending.',
        orderId: savedOrder.id,
        status: savedOrder.status,
        totalAmount: savedOrder.totalPrice,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();

      if (
        err instanceof NotFoundException ||
        err instanceof BadRequestException
      ) {
        throw err;
      }
      throw new InternalServerErrorException(
        'An error occurred while placing your order.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * USER: Fetch orders for a specific user
   */
  async findUserOrders(userId: number): Promise<Order[]> {
    return await this.orderRepo.find({
      where: { user: { id: userId } },
      relations: ['items', 'items.groceryItem'],
      // This tells TypeORM to include soft-deleted grocery items
      // so the user can still see what they bought in the past.
      withDeleted: true,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * ADMIN: Fetch all orders in the system
   */
  async findAllOrders(): Promise<Order[]> {
    return await this.orderRepo.find({
      relations: ['items', 'items.groceryItem', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * ADMIN: Update order status (with restocking logic for cancellations)
   */
  async updateStatus(id: number, status: OrderStatus) {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['items', 'items.groceryItem'],
    });

    if (!order) throw new NotFoundException('Order not found');

    // Logic: If transitioning TO canceled, return stock to inventory
    if (
      status === OrderStatus.CANCELED &&
      order.status !== OrderStatus.CANCELED
    ) {
      for (const item of order.items) {
        // Reuse your existing grocery service logic
        await this.groceryService.addInventory(
          item.groceryItem.id,
          item.quantity,
        );
      }
    }

    order.status = status;
    return await this.orderRepo.save(order);
  }
}
