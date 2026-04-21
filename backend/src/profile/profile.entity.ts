import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from '../order/order.entity';

export type ProfileType = 'plus' | 'mid' | 'min';
export type OwnerType = 'system' | 'parent';

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  type: ProfileType;

  @Column({ type: 'text', nullable: true })
  parentId: string | null;

  @ManyToOne(() => Profile, (profile) => profile.children, { nullable: true, onDelete: 'CASCADE' })
  parent: Profile | null;

  @OneToMany(() => Profile, (profile) => profile.parent)
  children: Profile[];

  @Column({ type: 'real', default: 0 })
  commission: number;

  @Column({ type: 'text', nullable: true })
  paymentDueDate: string | null;

  @Column({ type: 'text', default: 'system' })
  ownerType: OwnerType;

  @OneToMany(() => Order, (order) => order.profile)
  orders: Order[];
}
