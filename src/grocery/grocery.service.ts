import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { GroceryItem } from './entities/grocery-item.entity';
import { CreateGroceryItemDto } from './dto/create-grocery-item.dto';

@Injectable()
export class GroceryService {
  constructor(
    @InjectRepository(GroceryItem)
    private readonly groceryRepository: Repository<GroceryItem>,
  ) {}

  // 1. Add new grocery items
  async create(dto: CreateGroceryItemDto): Promise<GroceryItem> {
    const newItem = this.groceryRepository.create(dto);
    return await this.groceryRepository.save(newItem);
  }

  // 2. View existing grocery items
  async findAll(): Promise<GroceryItem[]> {
    return await this.groceryRepository.find();
  }

  // 3. Remove grocery items
  async remove(id: number): Promise<void> {
    const result = await this.groceryRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Grocery item with ID ${id} not found`);
    }
  }

  // 4. Update details & 5. Manage inventory levels
  async update(
    id: number,
    dto: Partial<CreateGroceryItemDto>,
  ): Promise<GroceryItem> {
    const item = await this.groceryRepository.preload({
      id,
      ...dto,
    });

    if (!item) {
      throw new NotFoundException(`Grocery item with ID ${id} not found`);
    }

    return await this.groceryRepository.save(item);
  }

  async addInventory(id: number, count: number): Promise<GroceryItem> {
    // We use the DataSource to start a transaction
    const queryRunner =
      this.groceryRepository.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Find the item within the transaction (optional: use a row lock)
      const item = await queryRunner.manager.findOne(GroceryItem, {
        where: { id },
        lock: { mode: 'pessimistic_write' }, // Prevents other transactions from reading/writing this row
      });

      if (!item) {
        throw new NotFoundException(`Grocery item with ID ${id} not found`);
      }

      // 2. Update the inventory
      item.inventoryCount += count;
      const updatedItem = await queryRunner.manager.save(item);

      // 3. Commit the changes
      await queryRunner.commitTransaction();
      return updatedItem;
    } catch (err) {
      // 4. If anything goes wrong, rollback all changes
      await queryRunner.rollbackTransaction();

      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Transaction failed');
    } finally {
      // 5. Always release the query runner
      await queryRunner.release();
    }
  }

  async removeInventory(id: number, count: number): Promise<GroceryItem> {
    const queryRunner =
      this.groceryRepository.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Find the item with a lock to ensure we have the latest stock count
      const item = await queryRunner.manager.findOne(GroceryItem, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!item) {
        throw new NotFoundException(`Grocery item with ID ${id} not found`);
      }

      // 2. Validation: Ensure we don't go below zero
      if (item.inventoryCount < count) {
        throw new BadRequestException(
          `Insufficient stock. Available: ${item.inventoryCount}, Requested: ${count}`,
        );
      }

      // 3. Update the inventory
      item.inventoryCount -= count;
      const updatedItem = await queryRunner.manager.save(item);

      // 4. Commit
      await queryRunner.commitTransaction();
      return updatedItem;
    } catch (err) {
      // 5. Rollback on any error
      await queryRunner.rollbackTransaction();

      if (
        err instanceof NotFoundException ||
        err instanceof BadRequestException
      ) {
        throw err;
      }
      throw new InternalServerErrorException(
        'Transaction failed during inventory removal',
      );
    } finally {
      // 6. Release the runner
      await queryRunner.release();
    }
  }

  // Add to GroceryService
  async findAllAvailable(): Promise<GroceryItem[]> {
    return await this.groceryRepository.find({
      where: {
        inventoryCount: MoreThan(0),
      },
    });
  }
}
