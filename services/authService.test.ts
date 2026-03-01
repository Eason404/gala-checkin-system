
declare var describe: any;
declare var test: any;
declare var expect: any;
declare var beforeEach: any;
declare var jest: any;

// Mock Storage
const mockStorage: Record<string, string> = {};

// Mock Firestore
// We use a mock database to simulate existing keys
const mockAuthDb: Record<string, any> = {
  'ADMIN123': { role: 'admin' },
  'STAFF456': { role: 'staff' }
};

jest.mock('firebase/firestore', () => {
  const mockGetDoc = jest.fn((docRef: any) => {
    const code = docRef.id; // We mocked doc() to return { id: code }
    const data = mockAuthDb[code];
    return Promise.resolve({
      exists: () => !!data,
      data: () => data
    });
  });

  return {
    getFirestore: jest.fn(),
    doc: jest.fn((db, col, id) => ({ id, path: `${col}/${id}` })),
    getDoc: mockGetDoc
  };
});

import { loginWithCode, logout, getCurrentUserRole, getCurrentUserCode } from './authService';

describe('AuthService - Database based access', () => {
  beforeEach(() => {
    // Reset Session Storage
    for (const key in mockStorage) delete mockStorage[key];
    
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn((key: string) => mockStorage[key] || null),
        setItem: jest.fn((key: string, value: string) => { mockStorage[key] = value; }),
        removeItem: jest.fn((key: string) => { delete mockStorage[key]; }),
        clear: jest.fn(() => { for (const key in mockStorage) delete mockStorage[key]; }),
      },
      writable: true
    });

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { reload: jest.fn() },
    });
    
    jest.clearAllMocks();
  });

  describe('loginWithCode', () => {
    test('使用有效 Admin 代码应登录成功', async () => {
      const result = await loginWithCode('ADMIN123');
      expect(result.success).toBe(true);
      expect(result.role).toBe('admin');
      expect(sessionStorage.setItem).toHaveBeenCalledWith('cny_access_token', 'ADMIN123');
      expect(sessionStorage.setItem).toHaveBeenCalledWith('cny_access_role', 'admin');
    });

    test('使用有效 Staff 代码应登录成功', async () => {
      const result = await loginWithCode('STAFF456');
      expect(result.success).toBe(true);
      expect(result.role).toBe('staff');
    });

    test('使用无效代码应返回 NOT_FOUND', async () => {
      const result = await loginWithCode('WRONGCODE');
      expect(result.success).toBe(false);
      expect(result.role).toBeNull();
      expect(result.error).toBe('NOT_FOUND');
      expect(sessionStorage.setItem).not.toHaveBeenCalled();
    });

    test('空代码应直接返回失败', async () => {
      const result = await loginWithCode('');
      expect(result.success).toBe(false);
    });

    test('模拟 Firebase 权限错误 (Permission Denied)', async () => {
      mockGetDoc.mockImplementationOnce(() => Promise.reject({ code: 'permission-denied' }));
      const result = await loginWithCode('ADMIN123');
      expect(result.success).toBe(false);
      expect(result.error).toBe('PERMISSION_DENIED');
    });
  });

  describe('Session Management', () => {
    test('logout 应清除 SessionStorage 并刷新页面', () => {
      logout();
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('cny_access_token');
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('cny_access_role');
      expect(window.location.reload).toHaveBeenCalled();
    });

    test('getCurrentUserCode 应返回存储的代码或默认为 PUBLIC', () => {
      expect(getCurrentUserCode()).toBe('PUBLIC'); // Default

      mockStorage['cny_access_token'] = 'TEST_CODE';
      expect(getCurrentUserCode()).toBe('TEST_CODE');
    });

    test('getCurrentUserRole 应返回存储的角色或 null', () => {
      expect(getCurrentUserRole()).toBeNull();

      mockStorage['cny_access_role'] = 'admin';
      expect(getCurrentUserRole()).toBe('admin');
    });
  });
});
