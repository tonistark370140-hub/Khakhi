import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  target_exam: string;
  created_at: string;
  updated_at: string;
};

export type UserStats = {
  user_id: string;
  total_quizzes: number;
  total_correct: number;
  total_points: number;
  best_streak: number;
  current_streak: number;
  rank: number;
  updated_at: string;
};

export type News = {
  id: string;
  title: string;
  content: string;
  category: string;
  is_important: boolean;
  published_at: string;
  created_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
};
