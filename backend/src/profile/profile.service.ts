import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile, ProfileType } from './profile.entity';
import { Order, computeStatus } from '../order/order.entity';

export interface ProfileAggregates {
  totalAmount: number;
  paid: number;
  rest: number;
  ordersCount: number;
  subAccountsCount: number;
}

export interface ProfileListItem extends ProfileAggregates {
  id: string;
  type: ProfileType;
  parentId: string | null;
  commission: number;
  paymentDueDate: string | null;
  ownerType: 'system' | 'parent';
}

export interface TreeNode {
  id: string;
  type: ProfileType;
  parentId: string | null;
  rest: number;
  children: TreeNode[];
}

export interface ProfileDetails extends ProfileListItem {
  orders: Array<{
    id: string;
    number: string;
    amount: number;
    paid: number;
    rest: number;
    status: 'unpaid' | 'partial' | 'paid';
  }>;
  children: ProfileListItem[];
  ancestors: Array<{ id: string; type: ProfileType }>;
}

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async listByType(type: ProfileType): Promise<ProfileListItem[]> {
    const profiles = await this.profileRepository.find({ where: { type } });
    return Promise.all(profiles.map((profile) => this.toListItem(profile)));
  }

  async getTree(): Promise<TreeNode[]> {
    const all = await this.profileRepository.find();
    const byId = new Map<string, TreeNode>();
    for (const profile of all) {
      byId.set(profile.id, {
        id: profile.id,
        type: profile.type,
        parentId: profile.parentId,
        rest: 0,
        children: [],
      });
    }
    for (const profile of all) {
      const node = byId.get(profile.id)!;
      const stats = await this.computeAggregates(profile.id);
      node.rest = stats.rest;
    }
    const roots: TreeNode[] = [];
    for (const profile of all) {
      const node = byId.get(profile.id)!;
      if (profile.type === 'plus') {
        roots.push(node);
        continue;
      }
      if (profile.parentId && byId.has(profile.parentId)) {
        byId.get(profile.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }
    return roots;
  }

  async getDetails(id: string): Promise<ProfileDetails> {
    const profile = await this.profileRepository.findOne({ where: { id } });
    if (!profile) {
      throw new NotFoundException(`Profile ${id} not found`);
    }
    const orders = await this.orderRepository.find({ where: { profileId: id } });
    const children = await this.profileRepository.find({ where: { parentId: id } });
    const childItems = await Promise.all(children.map((child) => this.toListItem(child)));
    const ancestors = await this.loadAncestors(profile);
    const base = await this.toListItem(profile);
    return {
      ...base,
      orders: orders.map((order) => ({
        id: order.id,
        number: order.number,
        amount: order.amount,
        paid: order.paid,
        rest: Math.max(0, order.amount - order.paid),
        status: computeStatus(order.amount, order.paid),
      })),
      children: childItems,
      ancestors,
    };
  }

  private async toListItem(profile: Profile): Promise<ProfileListItem> {
    const aggregates = await this.computeAggregates(profile.id);
    return {
      id: profile.id,
      type: profile.type,
      parentId: profile.parentId,
      commission: profile.commission,
      paymentDueDate: profile.paymentDueDate,
      ownerType: profile.ownerType,
      ...aggregates,
    };
  }

  private async computeAggregates(profileId: string): Promise<ProfileAggregates> {
    const orderStats = await this.orderRepository
      .createQueryBuilder('order')
      .select('COALESCE(SUM(order.amount), 0)', 'total')
      .addSelect('COALESCE(SUM(order.paid), 0)', 'paid')
      .addSelect('COUNT(order.id)', 'count')
      .where('order.profileId = :profileId', { profileId })
      .getRawOne<{ total: string; paid: string; count: string }>();
    const subCount = await this.profileRepository.count({ where: { parentId: profileId } });
    const totalAmount = Number(orderStats?.total ?? 0);
    const paid = Number(orderStats?.paid ?? 0);
    return {
      totalAmount,
      paid,
      rest: Math.max(0, totalAmount - paid),
      ordersCount: Number(orderStats?.count ?? 0),
      subAccountsCount: subCount,
    };
  }

  private async loadAncestors(profile: Profile): Promise<Array<{ id: string; type: ProfileType }>> {
    const chain: Array<{ id: string; type: ProfileType }> = [];
    let current = profile;
    while (current.parentId) {
      const parent = await this.profileRepository.findOne({ where: { id: current.parentId } });
      if (!parent) {
        break;
      }
      chain.unshift({ id: parent.id, type: parent.type });
      current = parent;
    }
    return chain;
  }
}
