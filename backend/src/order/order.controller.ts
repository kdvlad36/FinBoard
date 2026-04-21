import { Body, Controller, Param, Post } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post(':id/payments')
  addPayment(@Param('id') id: string, @Body() dto: CreatePaymentDto) {
    return this.orderService.addPayment(id, dto.amount);
  }
}
