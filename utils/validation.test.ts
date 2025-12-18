
// Add type declarations for test runner globals to avoid TS errors if @types/jest is missing
declare var describe: any;
declare var test: any;
declare var expect: any;

import { validatePhone, validateEmail } from './validation';

describe('Validation Utils', () => {
  describe('validatePhone', () => {
    test('accepts valid US formats', () => {
      expect(validatePhone('508-555-0123')).toBe(true);
      expect(validatePhone('(508) 555-0123')).toBe(true);
      expect(validatePhone('5085550123')).toBe(true);
      expect(validatePhone('1-508-555-0123')).toBe(true);
    });

    test('rejects invalid formats', () => {
      expect(validatePhone('123')).toBe(false);
      expect(validatePhone('abc-def-ghij')).toBe(false);
      expect(validatePhone('555-555-555')).toBe(false); // Too short
      expect(validatePhone('')).toBe(false);
    });
  });

  describe('validateEmail', () => {
    test('accepts valid emails', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@gmail.co.uk')).toBe(true);
    });

    test('rejects invalid emails', () => {
      expect(validateEmail('plainaddress')).toBe(false);
      expect(validateEmail('#@%^%#$@#$@#.com')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('joe smith@example.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });
});
