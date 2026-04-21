import type { ProfileDetails } from '../types';
import { formatMoney } from '../format';

interface Props {
  profile: ProfileDetails;
}

export function ProfileSummary({ profile }: Props) {
  const paidPercent =
    profile.totalAmount > 0 ? Math.min(100, (profile.paid / profile.totalAmount) * 100) : 0;
  const remainClass = profile.rest === 0 ? 'kpi remain zero' : 'kpi remain';

  return (
    <div className="section">
      <div className="section-head">
        <div className="title">Сводка профиля</div>
      </div>
      <div className="profile-grid">
        <div className="kv-grid">
          <Row label="ID" value={profile.id} mono />
          <Row label="Тип" value={profileLabelRu(profile.type)} plain />
          <Row label="Комиссия" value={`${profile.commission}%`} />
          <Row label="Срок оплаты" value={profile.paymentDueDate ?? '—'} />
          <Row
            label="Владелец"
            value={profile.ownerType === 'system' ? 'Система' : 'Родительский аккаунт'}
            plain
          />
          {profile.ancestors.length > 0 && (
            <Row
              label="Цепочка"
              value={profile.ancestors.map((a) => a.id.slice(0, 8)).join(' › ')}
              mono
            />
          )}
        </div>
        <div className="kpi-col">
          <div className="kpi">
            <div className="label">Общая сумма</div>
            <div className="value">
              {formatMoney(profile.totalAmount)}
              <span className="cur">₽</span>
            </div>
            <div className="meta">{profile.ordersCount} заказов</div>
            <div className="bar">
              <span style={{ width: `${paidPercent}%` }} />
            </div>
          </div>
          <div className="kpi paid">
            <div className="label">Оплачено</div>
            <div className="value">
              {formatMoney(profile.paid)}
              <span className="cur">₽</span>
            </div>
            <div className="meta">{paidPercent.toFixed(0)}% от суммы</div>
          </div>
          <div className={remainClass}>
            <div className="label">Остаток</div>
            <div className="value">
              {formatMoney(profile.rest)}
              <span className="cur">₽</span>
            </div>
            <div className="meta">
              {profile.rest === 0 ? 'Полностью оплачено' : 'К оплате'}
            </div>
          </div>
        </div>
      </div>
      <div className="metrics">
        <Metric label="Заказов" value={String(profile.ordersCount)} />
        <Metric
          label="Субаккаунтов"
          value={profile.type === 'min' ? '—' : String(profile.subAccountsCount)}
        />
        <Metric label="Комиссия" value={`${profile.commission}%`} />
        <Metric label="Срок оплаты" value={profile.paymentDueDate ?? '—'} small />
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
  plain,
}: {
  label: string;
  value: string;
  mono?: boolean;
  plain?: boolean;
}) {
  return (
    <div className="kv-row">
      <span className="k">{label}</span>
      <span className={`v${plain ? ' plain' : ''}`} style={mono ? undefined : undefined}>
        {value}
      </span>
    </div>
  );
}

function Metric({
  label,
  value,
  small,
}: {
  label: string;
  value: string;
  small?: boolean;
}) {
  return (
    <div className="metric">
      <div className="label">{label}</div>
      <div className={`value${small ? ' small' : ''}`}>{value}</div>
    </div>
  );
}

function profileLabelRu(type: ProfileDetails['type']): string {
  if (type === 'plus') return 'Profile+';
  if (type === 'mid') return 'Profile';
  return 'Profile min';
}
