import { PartialType } from '@nestjs/swagger';
import { CreateGroceryItemDto } from './create-grocery-item.dto';

// PartialType makes all fields from CreateGroceryItemDto optional
// AND tells Swagger to display them in the UI.
export class UpdateGroceryItemDto extends PartialType(CreateGroceryItemDto) {}
