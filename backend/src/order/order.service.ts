import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Order, computeStatus } from './order.entity';
import { Payment } from '../payment/payment.entity';

export interface OrderView {
  id: string;
  number: string;
  profileId: string;
  amount: number;
  paid: number;
  rest: number;
  status: 'unpaid' | 'partial' | 'paid';
}

@Injectable()
export class OrderService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async addPayment(orderId: string, amount: number): Promise<OrderView> {
    if (!(amount > 0)) {
      throw new BadRequestException('Payment amount must be positive');
    }
    return this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(Order, { where: { id: orderId } });
      if (!order) {
        throw new NotFoundException(`Order ${orderId} not found`);
      }
      const rest = order.amount - order.paid;
      if (amount > rest + 1e-9) {
        throw new BadRequestException(`Payment exceeds remaining balance (${rest})`);
      }
      order.paid = Number((order.paid + amount).toFixed(2));
      await manager.save(order);
      await manager.save(manager.create(Payment, { orderId, amount }));
      return toView(order);
    });
  }
}

function toView(order: Order): OrderView {
  return {
    id: order.id,
    number: order.number,
    profileId: order.profileId,
    amount: order.amount,
    paid: order.paid,
    rest: Math.max(0, Number((order.amount - order.paid).toFixed(2))),
    status: computeStatus(order.amount, order.paid),
  };
}
