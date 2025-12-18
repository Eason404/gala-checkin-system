// Add type declarations for test runner globals
declare var describe: any;
declare var test: any;
declare var expect: any;
declare var jest: any;

import { getUserRole } from './authService';
// We need to mock firebase/firestore to test getUserRole without connecting to real DB
const mockGetDoc = jest.fn();
const mockDoc = jest.fn();

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  doc: (...args: any[]) => mockDoc(...args),
  getDoc: (...args: any[]) => mockGetDoc(...args),
}));

jest.mock('../firebaseConfig', () => ({
  db: {},
  auth: {},
  googleProvider: {}
}));

describe('Auth Service', () => {
  test('getUserRole returns null if email is null', async () => {
    const role = await getUserRole(null);
    expect(role).toBeNull();
  });

  test('getUserRole returns role from Firestore if user exists', async () => {
    // Setup mock to return a document snapshot
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ role: 'admin' })
    });

    const role = await getUserRole('admin@example.com');
    expect(role).toBe('admin');
    // Verify it tried to fetch the correct doc
    expect(mockDoc).toHaveBeenCalledWith(expect.anything(), 'roles', 'admin@example.com');
  });

  test('getUserRole returns null if user document does not exist', async () => {
    // Setup mock to return non-existent doc
    mockGetDoc.mockResolvedValue({
      exists: () => false,
      data: () => undefined
    });

    const role = await getUserRole('random@example.com');
    expect(role).toBeNull();
  });

  test('getUserRole handles case sensitivity', async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ role: 'staff' })
    });

    await getUserRole('StaffUser@Example.com');
    // Should convert email to lowercase before querying
    expect(mockDoc).toHaveBeenCalledWith(expect.anything(), 'roles', 'staffuser@example.com');
  });
});
