import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
}
