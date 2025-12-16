// Add type declarations for test runner globals to avoid TS errors if @types/jest is missing
declare var describe: any;
declare var test: any;
declare var expect: any;

import { validatePhone } from './validation';

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
});