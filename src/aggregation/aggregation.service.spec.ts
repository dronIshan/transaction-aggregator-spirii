import { Test, TestingModule } from '@nestjs/testing';
import { AggregationService } from './aggregation.service';
import { AggregationStore } from './data-store.interface';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { Transaction } from '../transactions/transaction.model';

describe('AggregationService', () => {
  let service: AggregationService;
  let store: jest.Mocked<AggregationStore>;
  let http: jest.Mocked<HttpService>;

  beforeEach(async () => {
    // 1) Mock in-memory store
    store = {
      increment: jest.fn().mockResolvedValue(0),
      getAll: jest.fn().mockResolvedValue({}),
      keys: jest.fn().mockImplementation(async function* () {}),
    };

    // 2) Mock HttpService
    http = {
      get: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AggregationService,
        { provide: 'AGG_STORE', useValue: store },
        { provide: HttpService, useValue: http },
      ],
    }).compile();

    service = module.get(AggregationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('handleCron() fetches and aggregates transactions', async () => {
    const now = new Date();
    const txs: Transaction[] = [
      { id: '1', userId: 'u1', createdAt: now, type: 'earned', amount: 10 },
      { id: '2', userId: 'u2', createdAt: now, type: 'payout', amount: 5 },
    ];

    // Mock the HTTP call to return our txs
    http.get.mockReturnValue(of({ data: { items: txs } } as any));

    // Invoke the private cron handler
    await (service as any).handleCron();

    // Should call external API once
    expect(http.get).toHaveBeenCalledWith(
      expect.stringContaining('/transactions'),
      expect.objectContaining({ params: expect.any(Object) }),
    );

    // Should increment for each transaction
    expect(store.increment).toHaveBeenCalledWith('user:u1', 'earned', 10);
    expect(store.increment).toHaveBeenCalledWith('user:u2', 'payout', 5);
    // And for payouts, also increment paidOut
    expect(store.increment).toHaveBeenCalledWith('user:u2', 'paidOut', 5);
  });

  it('getUserSummary() returns parsed numbers', async () => {
    // Prepare the store to return string-values
    store.getAll.mockResolvedValue({
      balance: '7',
      earned: '10',
      spent: '3',
      payout: '5',
      paidOut: '2',
    });

    const summary = await service.getUserSummary('u1');
    expect(summary).toEqual({
      balance: 7,
      earned: 10,
      spent: 3,
      payout: 5,
      paidOut: 2,
    });
  });

  it('listPayoutRequests() filters users with payout > 0', async () => {
    // Simulate two stored users
    store.keys.mockImplementation(async function* () {
      yield 'user:u1';
      yield 'user:u2';
    });
    // u1 has 0 payout, u2 has 8
    store.getAll
      .mockResolvedValueOnce({ payout: '0' })
      .mockResolvedValueOnce({ payout: '8' });

    const list = await service.listPayoutRequests();
    expect(list).toEqual([{ userId: 'u2', totalRequestedPayout: 8 }]);
  });
});
