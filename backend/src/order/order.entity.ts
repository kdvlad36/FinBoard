import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Profile } from '../profile/profile.entity';
import { Payment } from '../payment/payment.entity';

export type OrderStatus = 'unpaid' | 'partial' | 'paid';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  number: string;

  @Column({ type: 'text' })
  profileId: string;

  @ManyToOne(() => Profile, (profile) => profile.orders, { onDelete: 'CASCADE' })
  profile: Profile;

  @Column({ type: 'real' })
  amount: number;

  @Column({ type: 'real', default: 0 })
  paid: number;

  @OneToMany(() => Payment, (payment) => payment.order)
  payments: Payment[];
}

export function computeStatus(amount: number, paid: number): OrderStatus {
  if (paid <= 0) {
    return 'unpaid';
  }
  if (paid >= amount) {
    return 'paid';
  }
  return 'partial';
}
