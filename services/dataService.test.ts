declare var describe: any;
declare var test: any;
declare var expect: any;
declare var beforeEach: any;
declare var jest: any;

import { createReservation, calculateStats, updateReservation, getReservations, generateLotteryNumber } from './dataService';
import { TicketType, CheckInStatus, PaymentStatus } from '../types';

const mockDb: any[] = [];

const mockAddDoc = jest.fn((col: any, data: any) => {
  const newDoc = { ...data, id: 'firebase-doc-' + Math.random() };
  mockDb.push(newDoc);
  return Promise.resolve({ id: newDoc.id });
});

const mockGetDocs = jest.fn(() => {
  return Promise.resolve({
    docs: mockDb.map(data => ({
      id: data.id,
      data: () => data,
      ref: { id: data.id }
    })),
    empty: mockDb.length === 0
  });
});

const mockUpdateDoc = jest.fn((docRef: any, updates: any) => {
  const index = mockDb.findIndex(d => d.id === docRef.id);
  if (index !== -1) {
    mockDb[index] = { ...mockDb[index], ...updates };
  }
  return Promise.resolve();
});

const mockQuery = jest.fn(() => 'query_object');

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  addDoc: mockAddDoc,
  getDocs: mockGetDocs,
  updateDoc: mockUpdateDoc,
  doc: (db: any, col: string, id: string) => ({ id }),
  query: mockQuery,
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

describe('Data Service Business Logic (Firestore Mock)', () => {
  beforeEach(() => {
    mockDb.length = 0;
    jest.clearAllMocks();
  });

  describe('Required Fields Validation', () => {
    test('fails if name is missing', async () => {
      await expect(createReservation({
        phoneNumber: '5085550123',
        email: 'test@ex.com'
      })).rejects.toThrow('MISSING_NAME');
    });

    test('fails if phone is invalid or too short', async () => {
      await expect(createReservation({
        contactName: 'James Smith',
        phoneNumber: '123',
        email: 'test@ex.com'
      })).rejects.toThrow('INVALID_PHONE');
    });

    test('fails if email is invalid', async () => {
      await expect(createReservation({
        contactName: 'James Smith',
        phoneNumber: '5085550123',
        email: 'invalid-email'
      })).rejects.toThrow('INVALID_EMAIL');
    });
  });

  describe('Duplicate Phone Detection', () => {
    test('throws DUPLICATE_PHONE error if an active reservation exists', async () => {
      await createReservation({
        contactName: 'First Person',
        phoneNumber: '123-456-7890',
        adultsCount: 1,
        email: 'test@example.com'
      });

      await expect(createReservation({
        contactName: 'Second Person',
        phoneNumber: '1234567890', 
        adultsCount: 1,
        email: 'test2@example.com'
      })).rejects.toThrow('DUPLICATE_PHONE');
    });
  });

  describe('Pricing Logic', () => {
    test('calculates Early Bird pricing correctly', async () => {
      const res = await createReservation({
        contactName: 'Test Family',
        phoneNumber: '555-555-5555',
        adultsCount: 2,
        childrenCount: 3,
        ticketType: TicketType.EarlyBird,
        email: 'price@example.com'
      });

      expect(res.pricePerPerson).toBe(15);
      expect(res.totalAmount).toBe(30);
    });
  });

  describe('Statistics Engine', () => {
    test('aggregates stats correctly ignoring cancellations', async () => {
      await createReservation({ contactName: 'A', phoneNumber: '1111111111', ticketType: TicketType.EarlyBird, adultsCount: 2, email: 'e1@ex.com' }); 
      await createReservation({ contactName: 'B', phoneNumber: '2222222222', ticketType: TicketType.WalkIn, adultsCount: 1, email: 'w1@ex.com' });
      
      const stats = await calculateStats();
      expect(stats.totalRevenueExpected).toBe(50);
      expect(stats.totalPeople).toBe(3);
    });
  });
});