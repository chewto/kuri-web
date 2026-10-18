export type ActivityType = 'note' | 'call' | 'email' | 'meeting';

export interface ActivityLog {
  id: string;
  contact_id: string;
  type: ActivityType;
  content: string;
  created_at: string;
  user_email?: string;
  user_id?: string;
}

export interface ActivityFormData {
  type: ActivityType;
  content: string;
}
