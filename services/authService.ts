import { auth, googleProvider, db } from '../firebaseConfig';
import { signInWithPopup, signOut as firebaseSignOut, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// FEATURE FLAG: Authentication & Access Control
// Set to 'true' to enforce Google Login and Role Checks (Admin/Staff).
// Set to 'false' to disable all security checks (Test Mode).
export const ENABLE_AUTH = false;

// Login with Google Popup
export const loginWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Login failed", error);
    throw error;
  }
};

export const logout = async () => {
  await firebaseSignOut(auth);
};

// Check Firestore 'roles' collection to see if user is 'admin' or 'staff'
export const getUserRole = async (email: string | null): Promise<'admin' | 'staff' | null> => {
  if (!email) return null;
  
  try {
    // We use email as the Document ID for easy lookup.
    // Ensure you create a collection 'roles' in Firestore.
    // Doc ID: 'user@email.com', Field: 'role': 'admin' or 'staff'
    const docRef = doc(db, 'roles', email.toLowerCase());
    const snapshot = await getDoc(docRef);
    
    if (snapshot.exists()) {
      const data = snapshot.data();
      return data.role as 'admin' | 'staff';
    }
    return null; // No role assigned
  } catch (e) {
    console.error("Error fetching role", e);
    return null;
  }
};