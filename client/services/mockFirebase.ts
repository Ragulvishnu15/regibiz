import { UserProfile, UserRole, UserStatus, ServiceDocument } from '../types';
import { generateUserId } from '../utils/helpers';

/**
 * Since we cannot use real Firebase keys in this generated response without exposing them or
 * breaking the app for the user who doesn't have keys, we act as a "Mock Firebase".
 * 
 * In a real deployment:
 * 1. Initialize Firebase App
 * 2. Export 'auth' and 'db'
 * 3. Replace these functions with Firestore calls.
 */

// Local Storage Keys
const USERS_KEY = 'regipro_users';
const DOCS_KEY = 'regipro_docs';
const CURRENT_USER_KEY = 'regipro_current_user';

// Initial Mock Data
const INITIAL_USERS: UserProfile[] = [
  {
    uid: 'super-1',
    displayName: 'Super Admin',
    email: 'super@regipro.com',
    phoneNumber: '+919876543210',
    role: UserRole.SUPERADMIN,
    status: 'active',
    userId: 'USR-2025-001',
    createdAt: Date.now(),
  },
  {
    uid: 'admin-1',
    displayName: 'Manager Admin',
    email: 'admin@regipro.com',
    phoneNumber: '+919876543211',
    role: UserRole.ADMIN,
    status: 'active',
    userId: 'USR-2025-002',
    createdAt: Date.now(),
  },
  {
    uid: 'cust-1',
    displayName: 'Rahul Customer',
    email: 'customer@regipro.com',
    phoneNumber: '+919876543212',
    role: UserRole.CUSTOMER,
    status: 'active',
    userId: 'USR-2025-003',
    createdAt: Date.now(),
  }
];

// Helper to get local data
const getLocalUsers = (): UserProfile[] => {
  const stored = localStorage.getItem(USERS_KEY);
  if (!stored) {
    localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  }
  return JSON.parse(stored);
};

const getLocalDocs = (): ServiceDocument[] => {
  const stored = localStorage.getItem(DOCS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const mockAuthService = {
  loginWithEmail: async (email: string): Promise<UserProfile> => {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 800));
    const users = getLocalUsers();
    const user = users.find(u => u.email === email);
    if (!user) throw new Error("User not found (Try super@regipro.com)");
    if (user.status === 'blocked') throw new Error("Account blocked");
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return user;
  },

  loginWithPhone: async (phone: string, otp: string): Promise<UserProfile> => {
    await new Promise(r => setTimeout(r, 800));
    if (otp !== '123456') throw new Error("Invalid OTP (Use 123456)");
    
    const users = getLocalUsers();
    let user = users.find(u => u.phoneNumber === phone);

    // Auto-register if new (Customer flow)
    if (!user) {
      user = {
        uid: `user-${Date.now()}`,
        displayName: 'New User',
        phoneNumber: phone,
        role: UserRole.CUSTOMER, // Default role
        status: 'active',
        userId: generateUserId(),
        createdAt: Date.now(),
      };
      users.push(user);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    if (user.status === 'blocked') throw new Error("Account blocked");
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return user;
  },

  getCurrentUser: (): UserProfile | null => {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};

export const mockDbService = {
  // Documents
  getDocuments: async (uid: string): Promise<ServiceDocument[]> => {
    await new Promise(r => setTimeout(r, 500));
    const allDocs = getLocalDocs();
    return allDocs.filter(d => d.userId === uid);
  },

  createDocument: async (doc: ServiceDocument): Promise<void> => {
    await new Promise(r => setTimeout(r, 800));
    const allDocs = getLocalDocs();
    allDocs.push(doc);
    localStorage.setItem(DOCS_KEY, JSON.stringify(allDocs));
  },

  // Admin User Management
  getAllUsers: async (): Promise<UserProfile[]> => {
    await new Promise(r => setTimeout(r, 500));
    return getLocalUsers();
  },

  updateUserRole: async (targetUid: string, newRole: UserRole): Promise<void> => {
    const users = getLocalUsers();
    const idx = users.findIndex(u => u.uid === targetUid);
    if (idx !== -1) {
      users[idx].role = newRole;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  },

  toggleUserBlock: async (targetUid: string, currentStatus: UserStatus): Promise<void> => {
    const users = getLocalUsers();
    const idx = users.findIndex(u => u.uid === targetUid);
    if (idx !== -1) {
      users[idx].status = currentStatus === 'active' ? 'blocked' : 'active';
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  },

  inviteUser: async (phone: string, role: UserRole): Promise<string> => {
    await new Promise(r => setTimeout(r, 600));
    // In real app: create invite doc, send SMS. Here just simulate success.
    const token = Math.random().toString(36).substring(7);
    console.log(`Invite generated: ${token} for ${phone} as ${role}`);
    
    // Create a pending user immediately for the table
    const users = getLocalUsers();
    if (!users.find(u => u.phoneNumber === phone)) {
        users.push({
            uid: `invited-${Date.now()}`,
            phoneNumber: phone,
            displayName: 'Invited User',
            role: role,
            status: 'invited',
            userId: 'PENDING',
            createdAt: Date.now()
        });
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
    return token;
  }
};
