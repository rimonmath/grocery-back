import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { OrdersService } from '../orders.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { GetUser } from '../../common/decorators/user.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('User - Orders')
@ApiBearerAuth('access-token')
@Controller('user/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.USER)
export class UserController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @GetUser('id') userId: number, // Extracts ID from the JWT payload
  ) {
    return this.ordersService.createOrder(userId, createOrderDto);
  }

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Get all orders for a user' })
  async findAll(@GetUser('id') userId: number) {
    return this.ordersService.findUserOrders(userId);
  }
}
