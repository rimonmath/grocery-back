import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdateInventoryDto {
  @ApiProperty({
    example: 10,
    description: 'The quantity to change (must be a positive integer)',
  })
  @IsInt({ message: 'Count must be a whole number' })
  @Min(1, { message: 'Count must be at least 1' })
  count: number;
}
