
declare var describe: any;
declare var test: any;
declare var expect: any;

import { validatePhone, validateEmail } from './validation';

describe('Validation Utils - Coverage Suite', () => {
  describe('validatePhone', () => {
    test('应接受标准美国手机号格式', () => {
      expect(validatePhone('508-555-0123')).toBe(true);
      expect(validatePhone('(508) 555-0123')).toBe(true);
      expect(validatePhone('508.555.0123')).toBe(true);
      expect(validatePhone('508 555 0123')).toBe(true);
      expect(validatePhone('5085550123')).toBe(true);
    });

    test('应接受带国家码的美国号码', () => {
      expect(validatePhone('+1 508-555-0123')).toBe(true);
      expect(validatePhone('15085550123')).toBe(true);
    });

    test('应拒绝无效格式', () => {
      expect(validatePhone('12345')).toBe(false); // 太短
      expect(validatePhone('508-555-012')).toBe(false); // 缺位
      expect(validatePhone('abc-def-ghij')).toBe(false); // 非数字
      expect(validatePhone('   ')).toBe(false); // 全空格
      expect(validatePhone('')).toBe(false); // 空字符串
      expect(validatePhone('508-555-01234')).toBe(false); // 太长
      expect(validatePhone('508-555-0123-')).toBe(false); // 结尾特殊字符
    });
  });

  describe('validateEmail', () => {
    test('应接受标准邮箱格式', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@gmail.co.uk')).toBe(true);
      expect(validateEmail('123@abc.org')).toBe(true);
    });

    test('应拒绝无效邮箱', () => {
      expect(validateEmail('plainaddress')).toBe(false);
      expect(validateEmail('@missinguser.com')).toBe(false);
      expect(validateEmail('user@.com')).toBe(false);
      expect(validateEmail('user@com')).toBe(false);
      expect(validateEmail('user @example.com')).toBe(false); // 带空格
      expect(validateEmail('user@example.com ')).toBe(false); // 结尾空格
      expect(validateEmail('')).toBe(false);
    });
  });
});
