export type ProfileType = 'plus' | 'mid' | 'min';
export type OrderStatus = 'unpaid' | 'partial' | 'paid';
export type OwnerType = 'system' | 'parent';

export interface ProfileListItem {
  id: string;
  type: ProfileType;
  parentId: string | null;
  commission: number;
  paymentDueDate: string | null;
  ownerType: OwnerType;
  totalAmount: number;
  paid: number;
  rest: number;
  ordersCount: number;
  subAccountsCount: number;
}

export interface OrderView {
  id: string;
  number: string;
  amount: number;
  paid: number;
  rest: number;
  status: OrderStatus;
}

export interface ProfileDetails extends ProfileListItem {
  orders: OrderView[];
  children: ProfileListItem[];
  ancestors: Array<{ id: string; type: ProfileType }>;
}

export interface TreeNode {
  id: string;
  type: ProfileType;
  parentId: string | null;
  rest: number;
  children: TreeNode[];
}
