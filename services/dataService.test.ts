

declare var describe: any;
declare var test: any;
declare var expect: any;
declare var beforeEach: any;
declare var jest: any;

// 内存数据库模拟
let mockDb: any[] = [];
let mockSystemConfig: any = {}; // Store for system/config docs

jest.mock('firebase/firestore', () => {
  // Firestore Mocks
  const mockAddDoc = jest.fn((colRef: any, data: any) => {
    // Check if it's the 'mail' collection (Trigger Extension)
    if (colRef.id === 'mail') {
      return Promise.resolve({ id: 'mail_trigger_' + Math.random() });
    }

    // Normal reservations
    const newDoc = { ...data, id: data.id || 'CNY26-TEST', firebaseDocId: 'doc_' + Math.random() };
    mockDb.push(newDoc);
    return Promise.resolve({ id: newDoc.firebaseDocId });
  });

  const mockGetDocs = jest.fn((q: any) => {
    let filteredDb = [...mockDb];
    if (q && q.args) {
      const whereClause = q.args.find((a: any) => a && a.type === 'where');
      if (whereClause && whereClause.field === 'phoneNumber') {
        filteredDb = filteredDb.filter(d => whereClause.val.includes(d.phoneNumber));
      }
    }
    return Promise.resolve({
      docs: filteredDb.map(data => ({
        id: data.firebaseDocId,
        data: () => ({
          ...data,
          createdTime: data.createdTime
        }),
        ref: { id: data.firebaseDocId }
      })),
      empty: filteredDb.length === 0
    });
  });

  const mockGetDoc = jest.fn((docRef: any) => {
    // Handle system config
    if (docRef.path.startsWith('system/')) {
      const docId = docRef.id;
      const data = mockSystemConfig[docId];
      return Promise.resolve({
        exists: () => !!data,
        data: () => data
      });
    }
    return Promise.resolve({ exists: () => false });
  });

  const mockSetDoc = jest.fn((docRef: any, data: any, options: any) => {
    if (docRef.path.startsWith('system/')) {
      if (options?.merge) {
        mockSystemConfig[docRef.id] = { ...mockSystemConfig[docRef.id], ...data };
      } else {
        mockSystemConfig[docRef.id] = data;
      }
      return Promise.resolve();
    }
    return Promise.resolve();
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

  return {
    getFirestore: jest.fn(),
    collection: jest.fn((db, name) => ({ id: name, path: name })), // enhanced mock to check collection name
    addDoc: mockAddDoc,
    getDocs: mockGetDocs,
    getDoc: mockGetDoc,
    setDoc: mockSetDoc,
    updateDoc: mockUpdateDoc,
    deleteDoc: mockDeleteDoc,
    doc: (db: any, col: string, id: string) => ({ id, path: `${col}/${id}` }),
    query: jest.fn((col, ...args) => ({ col, args })),
    where: jest.fn((field, op, val) => ({ type: 'where', field, op, val })),
    orderBy: jest.fn((field, dir) => ({ type: 'orderBy', field, dir })),
    Timestamp: class Timestamp {
      ms: number;
      constructor(ms: number) { this.ms = ms; }
      toMillis() { return this.ms; }
      static now() { return new Timestamp(Date.now()); }
      static fromMillis(ms: number) { return new Timestamp(ms); }
    }
  };
});

jest.mock('../firebaseConfig', () => ({
  db: {},
  analytics: {},
}));

jest.mock('firebase/analytics', () => ({
  getAnalytics: jest.fn(),
  logEvent: jest.fn()
}));

// Mock AuthService to track operator
jest.mock('./authService', () => ({
  getCurrentUserCode: jest.fn(() => 'TEST_USER')
}));

import {
  createReservation,
  calculateStats,
  updateReservation,
  getReservations,
  deleteReservation,
  generateLotteryNumber,
  getTicketConfig,
  updateTicketConfig
} from './dataService';
import { TicketType, CheckInStatus, PaymentStatus } from '../types';

describe('DataService - Full Coverage Suite', () => {
  beforeEach(() => {
    mockDb = [];
    mockSystemConfig = {};
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
      expect(res.operatorId).toBe('TEST_USER');
    });

    test('创建预约应触发邮件发送 (Mail Collection Write)', async () => {
      await createReservation({
        contactName: 'Email Tester',
        phoneNumber: '508-555-1111',
        email: 'valid@email.com',
        adultsCount: 1
      });

      // Check if addDoc was called for the 'mail' collection
      const calls = require('firebase/firestore').addDoc.mock.calls;
      const mailCall = calls.find((c: any) => c[0].id === 'mail');
      expect(mailCall).toBeDefined();
      expect(mailCall[1].to).toContain('valid@email.com');
      expect(mailCall[1].message.subject).toContain('预约确认');
    });

    test('验证儿童免费逻辑 (Children should not be charged)', async () => {
      const res = await createReservation({
        contactName: 'Family Tester',
        phoneNumber: '508-555-9999',
        adultsCount: 2,
        childrenCount: 3,
        ticketType: TicketType.EarlyBird
      });
      // 应该是 2 * 15 = 30，而不是 5 * 15 = 75
      expect(res.totalAmount).toBe(30);
      expect(res.totalPeople).toBe(5);
    });

    test('更新预约状态应生效', async () => {
      const res = await createReservation({ contactName: 'UpdateMe', phoneNumber: '1112223333', email: 'u@ex.com' });
      await updateReservation(res.id, { checkInStatus: CheckInStatus.Arrived }, res.firebaseDocId);

      const all = await getReservations();
      expect(all[0].checkInStatus).toBe(CheckInStatus.Arrived);
      expect(all[0].lastModifiedBy).toBe('TEST_USER');
    });

    test('删除预约应从列表中移除', async () => {
      const res = await createReservation({ contactName: 'DeleteMe', phoneNumber: '9998887777', email: 'd@ex.com' });
      await deleteReservation(res.firebaseDocId!);

      const all = await getReservations();
      expect(all.length).toBe(0);
    });
  });

  describe('Configuration Management', () => {
    test('getTicketConfig 应返回默认值 (当 DB 为空时)', async () => {
      const config = await getTicketConfig();
      expect(config.totalCapacity).toBe(400); // Default fallback
    });

    test('updateTicketConfig 应更新 DB 并可通过 getTicketConfig 读取', async () => {
      await updateTicketConfig({
        totalCapacity: 500,
        totalHeadcountCap: 600,
        earlyBirdCap: 100,
        regularCap: 100,
        walkInCap: 300
      });

      const config = await getTicketConfig();
      expect(config.totalCapacity).toBe(500);
      expect(config.totalHeadcountCap).toBe(600);
      expect(config.walkInCap).toBe(300);
    });
  });

  describe('Business Logic & Stats', () => {
    test('不同票种价格应正确应用 (EarlyBird: $15, Regular: $20)', async () => {
      const early = await createReservation({
        contactName: 'Early', phoneNumber: '111', email: 'e@a.com', ticketType: TicketType.EarlyBird, adultsCount: 1
      });
      expect(early.totalAmount).toBe(15);

      const regular = await createReservation({
        contactName: 'Reg', phoneNumber: '222', email: 'r@a.com', ticketType: TicketType.Regular, adultsCount: 1
      });
      expect(regular.totalAmount).toBe(20);
    });

    test('统计应正确计算各项指标 (已签到 vs 未签到 vs 已取消)', async () => {
      // 1. 普通未签到
      await createReservation({ contactName: 'Normal', phoneNumber: '1', adultsCount: 2, ticketType: TicketType.Regular }); // +$40

      // 2. 已签到
      const arrived = await createReservation({ contactName: 'Arrived', phoneNumber: '2', adultsCount: 1, ticketType: TicketType.EarlyBird, paidAmount: 15 }); // +$15
      await updateReservation(arrived.id, { checkInStatus: CheckInStatus.Arrived }, arrived.firebaseDocId);

      // 3. 已取消 (不应计入 Revenue 和 Headcount)
      const cancelled = await createReservation({ contactName: 'Cancel', phoneNumber: '3', adultsCount: 5, ticketType: TicketType.Regular });
      await updateReservation(cancelled.id, { checkInStatus: CheckInStatus.Cancelled }, cancelled.firebaseDocId);

      const stats = await calculateStats();

      expect(stats.totalReservations).toBe(2); // Cancelled excluded
      expect(stats.totalPeople).toBe(3); // 2 + 1
      expect(stats.totalRevenueExpected).toBe(55); // 40 + 15
      expect(stats.totalRevenueCollected).toBe(15); // Arrived one paid
      expect(stats.checkedInCount).toBe(1); // Only the arrived one
      expect(stats.cancelledCount).toBe(5);
    });

    test('抽奖号码生成应为 3 位数字字符串', async () => {
      const num = await generateLotteryNumber();
      expect(num).toMatch(/^\d{3}$/);
    });
  });
});
