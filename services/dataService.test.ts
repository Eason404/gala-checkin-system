
declare var describe: any;
declare var test: any;
declare var expect: any;
declare var beforeEach: any;
declare var jest: any;

import { 
  createReservation, 
  calculateStats, 
  updateReservation, 
  getReservations, 
  deleteReservation,
  generateLotteryNumber 
} from './dataService';
import { TicketType, CheckInStatus, PaymentStatus } from '../types';

// 内存数据库模拟
let mockDb: any[] = [];

// Firestore Mocks
const mockAddDoc = jest.fn((col: any, data: any) => {
  const newDoc = { ...data, id: data.id || 'CNY26-TEST', firebaseDocId: 'doc_' + Math.random() };
  mockDb.push(newDoc);
  return Promise.resolve({ id: newDoc.firebaseDocId });
});

const mockGetDocs = jest.fn((q: any) => {
  return Promise.resolve({
    docs: mockDb.map(data => ({
      id: data.firebaseDocId,
      data: () => ({
        ...data,
        createdTime: { toMillis: () => data.createdTime || Date.now() }
      }),
      ref: { id: data.firebaseDocId }
    })),
    empty: mockDb.length === 0
  });
});

const mockUpdateDoc = jest.fn((docRef: any, updates: any) => {
  const index = mockDb.findIndex(d => d.firebaseDocId === docRef.id);
  if (index !== -1) {
    mockDb[index] = { ...mockDb[index], ...updates };
    return Promise.resolve();
  }
  return Promise.reject(new Error("Document not found"));
});

const mockDeleteDoc = jest.fn((docRef: any) => {
  const index = mockDb.findIndex(d => d.firebaseDocId === docRef.id);
  if (index !== -1) {
    mockDb.splice(index, 1);
    return Promise.resolve();
  }
  return Promise.reject(new Error("Document not found"));
});

// Mock Firestore Module
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn((db, name) => name),
  addDoc: mockAddDoc,
  getDocs: mockGetDocs,
  updateDoc: mockUpdateDoc,
  deleteDoc: mockDeleteDoc,
  doc: (db: any, col: string, id: string) => ({ id }),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  Timestamp: {
    now: () => ({ toMillis: () => Date.now() }),
    fromMillis: (ms: number) => ({ toMillis: () => ms })
  }
}));

jest.mock('../firebaseConfig', () => ({
  db: {},
  analytics: {},
}));

jest.mock('firebase/analytics', () => ({
  getAnalytics: jest.fn(),
  logEvent: jest.fn()
}));

describe('DataService - Full Coverage Suite', () => {
  beforeEach(() => {
    mockDb = [];
    jest.clearAllMocks();
  });

  describe('Reservation Management', () => {
    test('成功创建预约应包含生成的 ID 和 默认状态', async () => {
      const res = await createReservation({
        contactName: 'Tester',
        phoneNumber: '508-555-0000',
        email: 'test@ex.com',
        adultsCount: 2
      });
      expect(res.id).toMatch(/^CNY26-\d{4}$/);
      expect(res.totalAmount).toBe(30); // 2 * 15 (EarlyBird)
      expect(res.checkInStatus).toBe(CheckInStatus.NotArrived);
    });

    test('更新预约状态应生效', async () => {
      const res = await createReservation({ contactName: 'UpdateMe', phoneNumber: '1112223333', email: 'u@ex.com' });
      await updateReservation(res.id, { checkInStatus: CheckInStatus.Arrived }, res.firebaseDocId);
      
      const all = await getReservations();
      expect(all[0].checkInStatus).toBe(CheckInStatus.Arrived);
    });

    test('删除预约应从列表中移除', async () => {
      const res = await createReservation({ contactName: 'DeleteMe', phoneNumber: '9998887777', email: 'd@ex.com' });
      await deleteReservation(res.firebaseDocId!);
      
      const all = await getReservations();
      expect(all.length).toBe(0);
    });
  });

  describe('Business Logic & Stats', () => {
    test('不同票种价格应正确应用', async () => {
      const regular = await createReservation({ 
        contactName: 'Reg', phoneNumber: '111', email: 'r@a.com', ticketType: TicketType.Regular, adultsCount: 1 
      });
      expect(regular.totalAmount).toBe(20);
    });

    test('统计应排除已取消的预约', async () => {
      await createReservation({ contactName: 'A', phoneNumber: '1', adultsCount: 1, email: 'a@a.com' }); // $15
      const b = await createReservation({ contactName: 'B', phoneNumber: '2', adultsCount: 1, email: 'b@a.com' }); // $15
      
      await updateReservation(b.id, { checkInStatus: CheckInStatus.Cancelled }, b.firebaseDocId);
      
      const stats = await calculateStats();
      expect(stats.totalReservations).toBe(1);
      expect(stats.totalRevenueExpected).toBe(15);
      expect(stats.cancelledCount).toBe(1);
    });

    test('抽奖号码生成应为 3 位数字字符串', () => {
      const num = generateLotteryNumber();
      expect(num).toMatch(/^\d{3}$/);
    });
  });
});
