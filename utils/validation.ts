
/**
 * Validates US phone numbers.
 * Supports formats: (555) 555-5555, 555-555-5555, 5555555555
 */
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^(\+?1)?[ -. ]?\(?([0-9]{3})\)?[ -. ]?([0-9]{3})[ -. ]?([0-9]{4})$/;
  return phoneRegex.test(phone);
};

/**
 * Validates basic email format.
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
