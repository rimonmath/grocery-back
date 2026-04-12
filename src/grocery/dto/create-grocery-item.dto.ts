import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  IsNotEmpty,
} from 'class-validator';

export class CreateGroceryItemDto {
  @ApiProperty({ example: 'Apple' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 1.5 })
  @IsNumber()
  @Min(0.01)
  price: number;

  @ApiProperty({ example: 'Fresh organic apples', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
