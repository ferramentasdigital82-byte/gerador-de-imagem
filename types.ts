
export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

// FIX: Add 'Reseller' to UserPlan to allow it as a valid plan type.
export type UserPlan = 'Free' | 'Starter' | 'Pro' | 'Ultimate' | 'Reseller';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  status: 'Active' | 'Blocked';
  imagesGenerated: number;
  plan: UserPlan;
}