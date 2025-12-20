
declare var describe: any;
declare var test: any;
declare var expect: any;
declare var jest: any;

import { getUserRole } from './authService';

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

describe('AuthService - Coverage & Robustness', () => {
  test('输入无效 Email 应立即返回 null', async () => {
    expect(await getUserRole(null)).toBeNull();
    expect(await getUserRole('')).toBeNull();
  });

  test('成功获取 Admin 角色', async () => {
    mockGetDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ role: 'admin' })
    });

    const role = await getUserRole('ADMIN@EXAMPLE.COM');
    expect(role).toBe('admin');
    // 确保查询时转为了小写
    expect(mockDoc).toHaveBeenCalledWith(expect.anything(), 'roles', 'admin@example.com');
  });

  test('Firestore 查询报错时应捕获异常并返回 null', async () => {
    // 模拟网络错误或权限不足
    mockGetDoc.mockRejectedValueOnce(new Error("Permission Denied"));
    
    const role = await getUserRole('error@test.com');
    expect(role).toBeNull();
  });

  test('文档不存在时应返回 null', async () => {
    mockGetDoc.mockResolvedValueOnce({
      exists: () => false
    });

    expect(await getUserRole('none@test.com')).toBeNull();
  });
});
