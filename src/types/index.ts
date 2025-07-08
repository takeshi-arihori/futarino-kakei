export interface User {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Couple {
  id: string;
  user1Id: string;
  user2Id: string;
  name: string | null;
  createdAt: Date;
}

export interface Expense {
  id: string;
  coupleId: string;
  userId: string;
  amount: number;
  description: string | null;
  category: string;
  date: Date;
  isSettled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Settlement {
  id: string;
  coupleId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  periodStart: Date;
  periodEnd: Date;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
}
