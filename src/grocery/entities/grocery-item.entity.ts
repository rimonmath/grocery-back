// src/grocery/entities/grocery-item.entity.ts
import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('grocery_items')
export class GroceryItem extends BaseEntity {
  // id is now inherited from BaseEntity

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ default: 0 })
  inventoryCount: number;

  @Column({ nullable: true })
  description: string;
}
