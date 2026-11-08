import api from './api';
import { InviteMemberFormData, Role, UserMember } from '../types/team';

export const getTeamMembers = async (): Promise<UserMember[]> => {
  const response = await api.get<{ items: UserMember[]; total: number }>('/api/team/members');
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return response.data.items || [];
};

export const inviteMember = async (data: InviteMemberFormData): Promise<UserMember> => {
  const response = await api.post<{ message: string; user: UserMember }>('/api/team/invite', data);
  return response.data.user;
};

export const updateMemberRole = async (
  userId: string,
  role: Role
): Promise<UserMember> => {
  const response = await api.put<{ message: string; user: UserMember }>(
    `/api/team/members/${userId}/role`,
    { role }
  );
  return response.data.user;
};

export const deleteMember = async (userId: string): Promise<void> => {
  await api.delete(`/api/team/members/${userId}`);
};
