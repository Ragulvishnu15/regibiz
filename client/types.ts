export enum UserRole {
  SUPERADMIN = 'superadmin',
  ADMIN = 'admin',
  SUPPORT = 'support',
  CUSTOMER = 'customer',
}

export type UserStatus = 'active' | 'invited' | 'blocked';

export interface UserProfile {
  uid: string;
  phoneNumber?: string;
  email?: string; // Added for static login option
  userId: string; // USR-{YYYY}-{NNN}
  role: UserRole;
  status: UserStatus;
  displayName: string;
  createdAt: number;
}

export interface ServiceDocument {
  id: string;
  type: 'gst' | 'pan' | 'trademark' | 'fssai' | 'msme'; // ← 'msme' added here
  title: string;
  serviceId: string; // GST-2026-089
  status: 'submitted' | 'processing' | 'approved' | 'rejected' | 'paid';
  submittedAt: number;
  formData: Record<string, any>;
  userId: string;
}

export interface Invite {
  token: string;
  phoneNumber: string;
  role: UserRole;
  expiresAt: number;
  createdAt: number;
  used: boolean;
}