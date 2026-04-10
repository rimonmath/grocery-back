import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Order } from './order.entity';
import { GroceryItem } from '../../grocery/entities/grocery-item.entity';

@Entity('order_items')
export class OrderItem extends BaseEntity {
  @Column()
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  priceAtPurchase: number; // Snapshot of the price when booked

  @ManyToOne(() => Order, (order) => order.items)
  order: Order;

  @ManyToOne(() => GroceryItem)
  groceryItem: GroceryItem;
}
