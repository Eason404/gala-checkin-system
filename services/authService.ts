

import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const SESSION_KEY = 'cny_access_token';
const ROLE_KEY = 'cny_access_role';
const COLLECTION_NAME = 'access_keys';

export const ENABLE_AUTH = true;

export type UserRole = 'admin' | 'staff' | null;

export const loginWithCode = async (code: string): Promise<{ success: boolean; role: UserRole; error?: string }> => {
  // REMOVED: .toUpperCase() enforcement. 
  // This allows for complex, case-sensitive passphrases (e.g. "MySecurePass2026").
  // Users must now enter the code exactly as it is stored in Firestore Document ID.
  const cleanCode = code.trim();
  
  if (!cleanCode) return { success: false, role: null };

  console.log(`[Auth] 尝试验证代码...`);

  try {
    const docRef = doc(db, COLLECTION_NAME, cleanCode);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const role = data.role as UserRole;
      
      sessionStorage.setItem(SESSION_KEY, cleanCode);
      sessionStorage.setItem(ROLE_KEY, role || 'staff');
      
      return { success: true, role };
    } else {
      // 文档不存在
      return { success: false, role: null, error: 'NOT_FOUND' };
    }
  } catch (error: any) {
    console.error("[Auth] Firebase 错误:", error);
    // 如果报权限错误，通常是集合不存在或 Rules 限制
    if (error.code === 'permission-denied') {
        return { success: false, role: null, error: 'PERMISSION_DENIED' };
    }
    return { success: false, role: null, error: error.message };
  }
};

export const logout = () => {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(ROLE_KEY);
  window.location.reload();
};

export const getCurrentUserCode = (): string => {
  return sessionStorage.getItem(SESSION_KEY) || 'PUBLIC';
};

export const getCurrentUserRole = (): UserRole => {
  return (sessionStorage.getItem(ROLE_KEY) as UserRole) || null;
};
