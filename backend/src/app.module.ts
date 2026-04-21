import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from './profile/profile.entity';
import { Order } from './order/order.entity';
import { Payment } from './payment/payment.entity';
import { ProfileModule } from './profile/profile.module';
import { OrderModule } from './order/order.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'finboard.sqlite',
      entities: [Profile, Order, Payment],
      synchronize: true,
    }),
    ProfileModule,
    OrderModule,
    SeedModule,
  ],
})
export class AppModule {}
