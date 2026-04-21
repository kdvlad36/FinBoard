import type { OrderView, ProfileDetails, ProfileListItem, ProfileType, TreeNode } from './types';

const BASE = '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function listProfiles(type: ProfileType): Promise<ProfileListItem[]> {
  return request<ProfileListItem[]>(`/profiles?type=${type}`);
}

export function getTree(): Promise<TreeNode[]> {
  return request<TreeNode[]>('/profiles/tree');
}

export function getProfile(id: string): Promise<ProfileDetails> {
  return request<ProfileDetails>(`/profiles/${id}`);
}

export function addPayment(orderId: string, amount: number): Promise<OrderView> {
  return request<OrderView>(`/orders/${orderId}/payments`, {
    method: 'POST',
    body: JSON.stringify({ amount }),
  });
}
