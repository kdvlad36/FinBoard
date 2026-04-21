import type { ProfileType } from './types';

const moneyFormatter = new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

export function formatMoney(value: number): string {
  return moneyFormatter.format(value);
}

const TYPE_LABEL: Record<ProfileType, string> = {
  plus: 'Profile+',
  mid: 'Profile',
  min: 'Profile min',
};

export function profileLabel(type: ProfileType): string {
  return TYPE_LABEL[type];
}

export function shortId(id: string): string {
  return id.slice(0, 8);
}
