import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Profile } from '../profile/profile.entity';
import { Order } from '../order/order.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async onApplicationBootstrap(): Promise<void> {
    const count = await this.dataSource.getRepository(Profile).count();
    if (count > 0) {
      return;
    }
    await this.seed();
    this.logger.log('Seed data created');
  }

  private async seed(): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const profileRepo = manager.getRepository(Profile);
      const orderRepo = manager.getRepository(Order);

      const plusA = await profileRepo.save(
        profileRepo.create({
          type: 'plus',
          parentId: null,
          commission: 5,
          paymentDueDate: '2026-05-15',
          ownerType: 'system',
        }),
      );
      const plusB = await profileRepo.save(
        profileRepo.create({
          type: 'plus',
          parentId: null,
          commission: 4,
          paymentDueDate: '2026-06-01',
          ownerType: 'system',
        }),
      );

      const midA1 = await profileRepo.save(
        profileRepo.create({
          type: 'mid',
          parentId: plusA.id,
          commission: 3,
          paymentDueDate: '2026-05-20',
          ownerType: 'parent',
        }),
      );
      const midA2 = await profileRepo.save(
        profileRepo.create({
          type: 'mid',
          parentId: plusA.id,
          commission: 2.5,
          paymentDueDate: '2026-05-25',
          ownerType: 'parent',
        }),
      );
      const midSystem = await profileRepo.save(
        profileRepo.create({
          type: 'mid',
          parentId: null,
          commission: 3.5,
          paymentDueDate: '2026-05-28',
          ownerType: 'system',
        }),
      );

      const minA1a = await profileRepo.save(
        profileRepo.create({
          type: 'min',
          parentId: midA1.id,
          commission: 1.5,
          paymentDueDate: '2026-05-22',
          ownerType: 'parent',
        }),
      );
      const minA1b = await profileRepo.save(
        profileRepo.create({
          type: 'min',
          parentId: midA1.id,
          commission: 1.0,
          paymentDueDate: '2026-05-23',
          ownerType: 'parent',
        }),
      );
      const minA2a = await profileRepo.save(
        profileRepo.create({
          type: 'min',
          parentId: midA2.id,
          commission: 1.2,
          paymentDueDate: '2026-05-26',
          ownerType: 'parent',
        }),
      );

      await orderRepo.save([
        orderRepo.create({ number: 'A-1001', profileId: plusA.id, amount: 1500, paid: 500 }),
        orderRepo.create({ number: 'A-1002', profileId: plusA.id, amount: 800, paid: 800 }),
        orderRepo.create({ number: 'A-1003', profileId: plusA.id, amount: 1200, paid: 0 }),
        orderRepo.create({ number: 'B-2001', profileId: plusB.id, amount: 3000, paid: 1000 }),
        orderRepo.create({ number: 'M-3001', profileId: midA1.id, amount: 500, paid: 250 }),
        orderRepo.create({ number: 'M-3002', profileId: midA1.id, amount: 700, paid: 0 }),
        orderRepo.create({ number: 'M-3003', profileId: midA2.id, amount: 900, paid: 900 }),
        orderRepo.create({ number: 'M-3004', profileId: midSystem.id, amount: 400, paid: 100 }),
        orderRepo.create({ number: 'N-4001', profileId: minA1a.id, amount: 200, paid: 0 }),
        orderRepo.create({ number: 'N-4002', profileId: minA1a.id, amount: 150, paid: 150 }),
        orderRepo.create({ number: 'N-4003', profileId: minA1b.id, amount: 300, paid: 100 }),
        orderRepo.create({ number: 'N-4004', profileId: minA2a.id, amount: 250, paid: 0 }),
      ]);
    });
  }
}
