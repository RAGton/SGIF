export interface Account {
  id: string;
  user_id: string;
  name: string;
  account_type: "wallet" | "bank" | "credit_card" | "investment";
  currency: string;
  initial_balance: number;
  current_balance: number;
  color: string;
  icon: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  category_type: "income" | "expense";
  parent_id: string | null;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  category_id: string | null;
  amount: number;
  description: string;
  transaction_type: "income" | "expense" | "transfer";
  date: string;
  notes: string | null;
  is_recurring: boolean;
  created_at: string;
  updated_at: string;
}
