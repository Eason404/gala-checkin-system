

import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const SESSION_KEY = 'cny_access_token';
const ROLE_KEY = 'cny_access_role';
const DISPLAY_NAME_KEY = 'cny_access_display_name';
const COLLECTION_NAME = 'access_keys';

// Rate-limiting keys
const ATTEMPT_COUNT_KEY = 'cny_login_attempts';
const ATTEMPT_TIMESTAMP_KEY = 'cny_login_attempt_ts';
const MAX_ATTEMPTS_BEFORE_LOCKOUT = 3;
const BASE_LOCKOUT_MS = 5000; // 5 seconds base, doubles each time

export const ENABLE_AUTH = true;

export type UserRole = 'admin' | 'gm' | 'staff' | 'observer' | 'host' | null;

/**
 * Check if login attempts are rate-limited.
 * Returns { allowed: true } or { allowed: false, waitMs: remaining lockout time }
 */
export const checkLoginRateLimit = (): { allowed: boolean; waitMs: number } => {
  const attempts = parseInt(sessionStorage.getItem(ATTEMPT_COUNT_KEY) || '0', 10);
  const lastAttemptTs = parseInt(sessionStorage.getItem(ATTEMPT_TIMESTAMP_KEY) || '0', 10);

  if (attempts < MAX_ATTEMPTS_BEFORE_LOCKOUT) {
    return { allowed: true, waitMs: 0 };
  }

  // Exponential backoff: 5s, 10s, 20s, 40s ...
  const lockoutMs = BASE_LOCKOUT_MS * Math.pow(2, attempts - MAX_ATTEMPTS_BEFORE_LOCKOUT);
  const elapsed = Date.now() - lastAttemptTs;

  if (elapsed >= lockoutMs) {
    return { allowed: true, waitMs: 0 };
  }

  return { allowed: false, waitMs: lockoutMs - elapsed };
};

/** Record a failed login attempt for rate-limiting */
export const recordFailedAttempt = (): void => {
  const attempts = parseInt(sessionStorage.getItem(ATTEMPT_COUNT_KEY) || '0', 10);
  sessionStorage.setItem(ATTEMPT_COUNT_KEY, String(attempts + 1));
  sessionStorage.setItem(ATTEMPT_TIMESTAMP_KEY, String(Date.now()));
};

/** Clear rate-limiting on successful login */
const clearAttempts = (): void => {
  sessionStorage.removeItem(ATTEMPT_COUNT_KEY);
  sessionStorage.removeItem(ATTEMPT_TIMESTAMP_KEY);
};

export const loginWithCode = async (code: string): Promise<{ success: boolean; role: UserRole; error?: string }> => {
  // Rate-limit check
  const rateCheck = checkLoginRateLimit();
  if (!rateCheck.allowed) {
    return { success: false, role: null, error: 'RATE_LIMITED' };
  }

  const cleanCode = code.trim();

  if (!cleanCode) return { success: false, role: null };

  console.log(`[Auth] 尝试验证代码...`);

  try {
    const docRef = doc(db, COLLECTION_NAME, cleanCode);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const role = data.role as UserRole;
      const displayName = data.displayName || 'Unknown User';

      sessionStorage.setItem(SESSION_KEY, cleanCode);
      sessionStorage.setItem(ROLE_KEY, role || 'staff');
      sessionStorage.setItem(DISPLAY_NAME_KEY, displayName);
      clearAttempts();

      return { success: true, role };
    } else {
      recordFailedAttempt();
      return { success: false, role: null, error: 'NOT_FOUND' };
    }
  } catch (error: any) {
    console.error("[Auth] Firebase 错误:", error);
    if (error.code === 'permission-denied') {
      return { success: false, role: null, error: 'PERMISSION_DENIED' };
    }
    recordFailedAttempt();
    return { success: false, role: null, error: error.message };
  }
};

/**
 * Re-verify stored session against Firestore.
 * Prevents sessionStorage tampering (e.g. manually changing role to 'admin').
 * Returns the verified role, or null if session is invalid (forces logout).
 */
export const verifyStoredSession = async (): Promise<{ role: UserRole; valid: boolean }> => {
  const storedCode = sessionStorage.getItem(SESSION_KEY);
  const storedRole = sessionStorage.getItem(ROLE_KEY) as UserRole;

  if (!storedCode || storedCode === 'PUBLIC') {
    return { role: null, valid: false };
  }

  try {
    const docRef = doc(db, COLLECTION_NAME, storedCode);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      // Code no longer valid — force logout
      forceLogout();
      return { role: null, valid: false };
    }

    const data = docSnap.data();
    const actualRole = data.role as UserRole;

    // Check if stored role matches actual role in database
    if (storedRole !== actualRole) {
      console.warn('[Auth] Role mismatch detected — sessionStorage tampered or role changed in DB');
      // Correct the stored role to match database
      sessionStorage.setItem(ROLE_KEY, actualRole || 'staff');
      return { role: actualRole, valid: true };
    }

    return { role: actualRole, valid: true };
  } catch (error) {
    console.error('[Auth] Session verification failed:', error);
    // On network error, trust stored role to avoid blocking offline usage
    return { role: storedRole, valid: true };
  }
};

const forceLogout = () => {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(ROLE_KEY);
  sessionStorage.removeItem(DISPLAY_NAME_KEY);
};

export const logout = () => {
  forceLogout();
  window.location.reload();
};

export const getCurrentUserCode = (): string => {
  return sessionStorage.getItem(SESSION_KEY) || 'PUBLIC';
};

export const getCurrentUserRole = (): UserRole => {
  return (sessionStorage.getItem(ROLE_KEY) as UserRole) || null;
};

export const getCurrentUserDisplayName = (): string => {
  return sessionStorage.getItem(DISPLAY_NAME_KEY) || 'Unknown User';
};
