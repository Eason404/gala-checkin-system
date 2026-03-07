

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
      // 1. Handle where clauses
      const whereClauses = q.args.filter((a: any) => a && a.type === 'where');
      whereClauses.forEach((w: any) => {
        if (w.field === 'phoneNumber') {
          filteredDb = filteredDb.filter(d => w.val.includes(d.phoneNumber));
        }
      });

      // 2. Handle orderBy (desc)
      const order = q.args.find((a: any) => a && a.type === 'orderBy');
      if (order && order.field === 'createdTime') {
        filteredDb.sort((a, b) => b.createdTime - a.createdTime);
      }

      // 3. Handle startAfter
      const startAfterToken = q.args.find((a: any) => a && a.type === 'startAfter');
      if (startAfterToken && startAfterToken.doc) {
        const index = filteredDb.findIndex(d => d.firebaseDocId === startAfterToken.doc.id);
        if (index !== -1) {
          filteredDb = filteredDb.slice(index + 1);
        }
      }

      // 4. Handle limit
      const limitVal = q.args.find((a: any) => a && a.type === 'limit');
      if (limitVal && limitVal.limit) {
        filteredDb = filteredDb.slice(0, limitVal.limit);
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
      size: filteredDb.length,
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
    // Handle reservations for generateId loop and createReservation
    if (docRef.path.startsWith('reservations/')) {
      const docId = docRef.id;
      const data = mockDb.find(d => d.id === docId || d.firebaseDocId === docId);
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
    if (docRef.path.startsWith('reservations/')) {
      const docId = docRef.id;
      const index = mockDb.findIndex(d => d.firebaseDocId === docId || d.id === docId);
      if (index !== -1) {
        mockDb[index] = { ...mockDb[index], ...data };
      } else {
        mockDb.push({ ...data, firebaseDocId: docId });
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
    limit: jest.fn((limitCount) => ({ type: 'limit', limit: limitCount })),
    startAfter: jest.fn((doc) => ({ type: 'startAfter', doc })),
    onSnapshot: jest.fn((docRef: any, callback: any) => {
      const docId = docRef.id;
      const data = mockSystemConfig[docId];
      if (data) {
        callback({
          exists: () => !!data,
          data: () => data
        });
      } else {
        callback({
          exists: () => false,
          data: () => undefined
        });
      }
      return jest.fn(); // Return unsubscribe function
    }),
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

// Mock DOMPurify
jest.mock('dompurify', () => ({
  __esModule: true,
  default: {
    sanitize: jest.fn((str: string) => str)
  }
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
  getReservationsPaged,
  deleteReservation,
  generateLotteryNumber,
  getTicketConfig,
  updateTicketConfig,
  updateLotteryState,
  subscribeToLotteryState,
  getRecentReservations,
  sendCancellationEmail,
  sendDiscountEmail,
  sendEventReminderEmail
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
      expect(mailCall[1].message.subject).toContain('Natick 2026 春晚预约确认');
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

    test('创建预约应验证必填项', async () => {
      await expect(createReservation({ contactName: 'M' })).rejects.toThrow('MISSING_PHONE');
      await expect(createReservation({ phoneNumber: '123' })).rejects.toThrow('MISSING_NAME');
    });

    test('getReservations should fail gracefully and return empty array', async () => {
      const getDocsMock = jest.requireMock('firebase/firestore').getDocs;
      getDocsMock.mockReturnValueOnce(Promise.reject(new Error('Network Error')));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const res = await getReservations();
      expect(res).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith("Error fetching", expect.any(Error));
      consoleSpy.mockRestore();
    });

    test('Email functions should handle errors safely', async () => {
      const addDocMock = jest.requireMock('firebase/firestore').addDoc;
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Test Confirmation Email error via createReservation
      addDocMock.mockReturnValueOnce(Promise.reject(new Error('Network Error')));
      await createReservation({ contactName: 'O', phoneNumber: '9999999', email: 'o@p.com' });
      await new Promise(r => setTimeout(r, 10)); // allow promise to evaluate catch block

      // Test Cancellation Email
      await sendCancellationEmail({ id: '1', contactName: 'N', email: 'test@ex.com' } as any);
      await sendCancellationEmail({ id: '1', contactName: 'N' } as any); // no email
      addDocMock.mockReturnValueOnce(Promise.reject(new Error('Network Error')));
      await sendCancellationEmail({ id: '1', contactName: 'N', email: 'test@ex.com' } as any);

      // Test Discount Email
      await sendDiscountEmail({ id: '1', contactName: 'N', email: 'test@ex.com', totalAmount: 100, discountAmount: 10, coupons: [{ code: 'A', amount: 10 }] } as any);
      await sendDiscountEmail({ id: '1', contactName: 'N', email: 'test@ex.com', totalAmount: 100, discountAmount: 10, couponCode: 'B' } as any); // Legacy 
      await sendDiscountEmail({ id: '1', contactName: 'N' } as any); // no email
      addDocMock.mockReturnValueOnce(Promise.reject(new Error('Network Error')));
      await sendDiscountEmail({ id: '1', contactName: 'N', email: 'test@ex.com' } as any);

      // Test Event Reminder Email
      await sendEventReminderEmail([], { id: 'rem-1', contactName: 'N' } as any); // empty emails
      addDocMock.mockReturnValueOnce(Promise.reject(new Error('Network Error')));
      await expect(sendEventReminderEmail(['test@ex.com'], { id: '1', firebaseDocId: 'doc-1', contactName: 'N', totalAmount: 10 } as any)).rejects.toThrow('Network Error');

      // Expect error log from confirmation and cancellation/discount failures
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test('sendEventReminderEmail should write to mail collection and update reservation', async () => {
      const addDocMock = jest.requireMock('firebase/firestore').addDoc;
      const updateDocMock = jest.requireMock('firebase/firestore').updateDoc;

      // Seed the mock database so updateDoc finds the document
      mockDb.push({ firebaseDocId: 'test-doc-id' });

      await sendEventReminderEmail(['success@ex.com'], { id: 'test-id', firebaseDocId: 'test-doc-id', contactName: 'Tester', totalAmount: 0 } as any);

      const calls = addDocMock.mock.calls;
      const mailCall = calls.find((c: any) => c[0].id === 'mail' && c[1].to.includes('success@ex.com'));
      expect(mailCall).toBeDefined();
      expect(mailCall[1].message.html).toContain('test-id');
      expect(mailCall[1].message.html).toContain('Tester');

      // Verify updateDoc was called to set isReminderEmailSent
      expect(updateDocMock).toHaveBeenCalledWith(
        { id: 'test-doc-id', path: 'reservations/test-doc-id' },
        { isReminderEmailSent: true }
      );
    });

    test('sendEventReminderEmail should throw error if failed', async () => {
      const addDocMock = jest.requireMock('firebase/firestore').addDoc;
      addDocMock.mockReturnValueOnce(Promise.reject(new Error('Network Error')));

      await expect(sendEventReminderEmail(['test@ex.com'], { id: '1', firebaseDocId: 'doc-1', contactName: 'N', totalAmount: 10 } as any)).rejects.toThrow('Network Error');
    });

    test('删除预约应从列表中移除', async () => {
      const res = await createReservation({ contactName: 'DeleteMe', phoneNumber: '9998887777', email: 'd@ex.com' });
      await deleteReservation(res.firebaseDocId!);

      const all = await getReservations();
      expect(all.length).toBe(0);
    });

    test('updateReservation 应能保存 editHistory 并且 mapDocToReservation 能够还原', async () => {
      const res = await createReservation({ contactName: 'AuditMe', phoneNumber: '12345678', email: 'a@ex.com' });

      const historyEntry = {
        timestamp: Date.now(),
        operatorId: 'TEST_USER',
        reason: 'GM discount applied: discount $10 - Reason: Manual override'
      };

      await updateReservation(res.id, {
        editHistory: [historyEntry],
        coupons: [{ code: 'GM_OVERRIDE', amount: 10, reason: 'Manual override' }]
      }, res.firebaseDocId);

      const all = await getReservations();
      const updated = all.find(r => r.id === res.id);

      expect(updated?.editHistory).toHaveLength(1);
      expect(updated?.editHistory![0].reason).toContain('Manual override');
      expect(updated?.coupons).toHaveLength(1);
      expect(updated?.coupons![0].reason).toBe('Manual override');
      expect(updated?.coupons![0].code).toBe('GM_OVERRIDE');
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

    test('updateLotteryState and subscribeToLotteryState should work correctly', async () => {
      await updateLotteryState({ isRunning: true, winners: ['123'] });

      let stateCallback = jest.fn();
      const unsubscribe = subscribeToLotteryState(stateCallback);

      expect(stateCallback).toHaveBeenCalledWith({ isRunning: true, winners: ['123'] });
      expect(typeof unsubscribe).toBe('function');
    });

    test('subscribeToLotteryState fallback safely when doc missing', async () => {
      // Clear mock
      mockSystemConfig['lotteryState'] = undefined;

      let stateCallback = jest.fn();
      subscribeToLotteryState(stateCallback);

      // Callback shouldn't be called if missing
      expect(stateCallback).not.toHaveBeenCalled();
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

    test('统计 coupon usage including legacy couponCode string', async () => {
      const stats = await calculateStats([{
        checkInStatus: CheckInStatus.NotArrived,
        totalPeople: 2,
        adultsCount: 2,
        totalAmount: 30,
        paidAmount: 0,
        ticketType: TicketType.EarlyBird,
        couponCode: 'LEGACY_TEST_CODE',
        coupons: undefined // Override the array fallback for this test
      } as any]);

      expect(stats.couponUsage['LEGACY_TEST_CODE']).toBe(1);
    });

    test('应该计算所有的 demographic count 和 lunch box 调整', async () => {
      const stats = await calculateStats([
        {
          checkInStatus: CheckInStatus.NotArrived,
          totalPeople: 3,
          adultsCount: 3,
          isPerformer: true,
          coupons: [{ code: 'VOLUNTEER_NO_LUNCH', amount: 0 }],
          ticketType: TicketType.Regular,
        } as any,
        {
          checkInStatus: CheckInStatus.NotArrived,
          totalPeople: 2,
          adultsCount: 2,
          coupons: [{ code: 'SPONSOR', amount: 0 }],
          ticketType: TicketType.WalkIn,
          // Removed legacy couponCode here so it doesn't trigger 'isVolunteer'
        } as any,
        {
          checkInStatus: CheckInStatus.NotArrived,
          totalPeople: 4,
          adultsCount: 2,
          coupons: [{ code: 'PERFORMER_PARENTS', amount: 0 }, { code: '', amount: 0 }],
          ticketType: TicketType.WalkIn,
        } as any,
        {
          checkInStatus: CheckInStatus.NotArrived,
          totalPeople: 1,
          adultsCount: 1,
          coupons: [{ code: 'VOLUNTEER', amount: 0 }],
          ticketType: TicketType.WalkIn,
        } as any,
        {
          // Extra guest for legacy code
          checkInStatus: CheckInStatus.NotArrived,
          totalPeople: 1,
          adultsCount: 1,
          ticketType: TicketType.WalkIn,
          couponCode: 'VOLUNTEER_NO_LUNCH', // this technically makes them a volunteer too
        } as any
      ]);

      expect(stats.totalPerformersCount).toBe(3);
      expect(stats.totalSponsorsCount).toBe(2);
      expect(stats.totalPerformerParentsCount).toBe(4);
      expect(stats.totalVolunteersCount).toBe(2); // 1 from VOLUNTEER, 1 from VOLUNTEER_NO_LUNCH legacy
      // lunches: 2 + 2 + 2 + 1 + 0 = 7
      expect(stats.lunchBoxCount).toBe(7);
      // None are checked in, so checkedInMealCount should be 0
      expect(stats.checkedInMealCount).toBe(0);
      // noShowMealReserve should equal lunchBoxCount when nobody checked in
      expect(stats.noShowMealReserve).toBe(7);
    });

    test('盒饭追踪：已签到 vs 未签到的饭卡分配 (Meal tracking with mixed check-in status)', async () => {
      const stats = await calculateStats([
        {
          // Arrived: 3 adults, 1 child => 3 meals claimed
          checkInStatus: CheckInStatus.Arrived,
          totalPeople: 4,
          adultsCount: 3,
          childrenCount: 1,
          ticketType: TicketType.EarlyBird,
          totalAmount: 45,
          paidAmount: 45,
        } as any,
        {
          // Arrived with NO_LUNCH: 2 adults, 1 NO_LUNCH => 1 meal claimed
          checkInStatus: CheckInStatus.Arrived,
          totalPeople: 2,
          adultsCount: 2,
          coupons: [{ code: 'VOLUNTEER_NO_LUNCH', amount: 0 }],
          ticketType: TicketType.Regular,
          totalAmount: 0,
          paidAmount: 0,
        } as any,
        {
          // NotArrived: 2 adults => 2 meals reserved but not claimed
          checkInStatus: CheckInStatus.NotArrived,
          totalPeople: 2,
          adultsCount: 2,
          ticketType: TicketType.Regular,
          totalAmount: 40,
          paidAmount: 0,
        } as any,
        {
          // Cancelled: should not count
          checkInStatus: CheckInStatus.Cancelled,
          totalPeople: 5,
          adultsCount: 5,
          ticketType: TicketType.Regular,
          totalAmount: 100,
          paidAmount: 0,
        } as any,
      ]);

      // lunchBoxCount: 3 + 1 + 2 = 6 (cancelled excluded)
      expect(stats.lunchBoxCount).toBe(6);
      // checkedInMealCount: 3 + 1 = 4 (only Arrived)
      expect(stats.checkedInMealCount).toBe(4);
      // noShowMealReserve: 6 - 4 = 2
      expect(stats.noShowMealReserve).toBe(2);
    });

    test('getRecentReservations returns recent items safely', async () => {
      await createReservation({ contactName: 'Recent', phoneNumber: '55667788', adultsCount: 1 });
      const recent = await getRecentReservations(5);
      expect(recent.length).toBeGreaterThan(0);
      expect(recent[0].phoneNumber).toBe('55667788');
    });

    test('getRecentReservations fails gracefully by returning empty array', async () => {
      const getDocsMock = jest.requireMock('firebase/firestore').getDocs;
      // Temporarily mock error
      getDocsMock.mockImplementationOnce(() => Promise.reject(new Error('Test error')));
      const recent = await getRecentReservations(5);
      expect(recent.length).toBe(0);
    });

    test('getReservationsPaged should return chunked data and total count', async () => {
      // Seed 25 docs
      for (let i = 0; i < 25; i++) {
        mockDb.push({ id: `PAGE-${i}`, firebaseDocId: `PAGE-${i}`, createdTime: Date.now() - i });
      }

      const result = await getReservationsPaged(10);
      expect(result.reservations).toHaveLength(10);
      expect(result.totalCount).toBe(25);
      expect(result.lastDoc).toBeDefined();

      const result2 = await getReservationsPaged(10, result.lastDoc);
      expect(result2.reservations).toHaveLength(10);
      expect(result2.reservations[0].id).toBe('PAGE-10');
    });
  });

  describe('Duplicate Prevention', () => {
    test('Should throw error for duplicate phone number', async () => {
      await createReservation({
        contactName: 'First',
        phoneNumber: '5081112222',
        adultsCount: 1
      });

      await expect(createReservation({
        contactName: 'Second',
        phoneNumber: '508-111-2222', // Formatted differently but same normalization
        adultsCount: 1
      })).rejects.toThrow('DUPLICATE_PHONE');
    });

    test('Should allow registration with a duplicate phone number if previous was cancelled', async () => {
      const res1 = await createReservation({
        contactName: 'First',
        phoneNumber: '5081119999',
        adultsCount: 1
      });
      await updateReservation(res1.id, { checkInStatus: CheckInStatus.Cancelled }, res1.firebaseDocId);

      // Now create again with the same phone
      const res2 = await createReservation({
        contactName: 'Second',
        phoneNumber: '5081119999',
        adultsCount: 1
      });

      expect(res2.id).toBeDefined();
      expect(res2.id).not.toBe(res1.id);
    });

    test('Should handle ID collision and retry (Simulated via mock)', async () => {
      // Pre-fill mockDb with an ID
      mockDb.push({ id: 'CNY26-1234', firebaseDocId: 'CNY26-1234' });

      // Override Math.random to return something that results in 1234 first, then 5678
      let callCount = 0;
      const originalRandom = Math.random;
      Math.random = jest.fn(() => {
        callCount++;
        // 1000 + R * 9000 = ID => R = (ID - 1000) / 9000
        if (callCount === 1) return (1234 - 1000) / 9000;
        return (5678 - 1000) / 9000;
      });

      const res = await createReservation({
        contactName: 'RetryTester',
        phoneNumber: '9990001111',
        adultsCount: 1
      });

      expect(res.id).toBe('CNY26-5678');
      expect(res.id).not.toBe('CNY26-1234');
      Math.random = originalRandom;
    });
  });
});
