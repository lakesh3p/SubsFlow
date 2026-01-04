
export enum BillingCycle {
  MONTHLY = 'monthly',
  YEARLY = 'yearly'
}

export interface Subscription {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: BillingCycle;
  category: string;
}

export interface Flow {
  id: string;
  title: string;
  subscriptions: Subscription[];
  updatedAt: number;
}

export interface UserSettings {
  currency: string;
  theme: 'light' | 'dark';
  language: 'en' | 'ru';
  compactMode: boolean;
}

export type SortField = 'manual' | 'price' | 'name' | 'category';
export type SortDirection = 'asc' | 'desc';
