import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Topbar } from '../components/Topbar';
import { listProfiles } from '../api';
import type { ProfileListItem } from '../types';
import { formatMoney, profileLabel, shortId } from '../format';

export function ProfileListPage() {
  const [profiles, setProfiles] = useState<ProfileListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    listProfiles('plus')
      .then((items) => {
        if (!cancelled) {
          setProfiles(items);
          setLoading(false);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const crumbs = [{ id: null, type: 'root' as const, label: 'Profile+ аккаунты' }];
  const totals = profiles.reduce(
    (acc, profile) => ({
      total: acc.total + profile.totalAmount,
      paid: acc.paid + profile.paid,
      rest: acc.rest + profile.rest,
      orders: acc.orders + profile.ordersCount,
    }),
    { total: 0, paid: 0, rest: 0, orders: 0 },
  );

  return (
    <>
      <Topbar crumbs={crumbs} />
      <div className="content">
        <header className="page-header">
          <div>
            <h1>
              <span className="kind-pill profile-plus">Profile+</span>
              Корневые аккаунты
            </h1>
            <div className="sub">Все Profile+ в системе с агрегатами по заказам</div>
          </div>
        </header>

        {error && <div className="empty">Ошибка: {error}</div>}
        {loading && !error && <div className="empty">Загрузка…</div>}

        {!loading && !error && (
          <>
            <div className="section">
              <div className="metrics">
                <Metric label="Profile+ всего" value={String(profiles.length)} />
                <Metric label="Общая сумма" value={`${formatMoney(totals.total)} ₽`} />
                <Metric label="Оплачено" value={`${formatMoney(totals.paid)} ₽`} />
                <Metric label="Остаток" value={`${formatMoney(totals.rest)} ₽`} />
              </div>
            </div>

            <div className="section">
              <div className="section-head">
                <div className="title">
                  Profile+ <span className="count">{profiles.length}</span>
                </div>
              </div>
              <table className="tbl">
                <thead>
                  <tr>
                    <th className="idx">#</th>
                    <th>ID</th>
                    <th className="num">Комиссия</th>
                    <th>Срок оплаты</th>
                    <th className="num">Сумма</th>
                    <th className="num">Оплачено</th>
                    <th className="num">Остаток</th>
                    <th className="num">Заказов</th>
                    <th className="num">Суб-акк.</th>
                    <th className="actions-col"></th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map((profile, index) => (
                    <tr
                      key={profile.id}
                      className="row-drill"
                      onClick={() => navigate(`/profiles/${profile.id}`)}
                    >
                      <td className="idx">{index + 1}</td>
                      <td className="id">
                        {shortId(profile.id)} <span className="muted">· {profileLabel(profile.type)}</span>
                      </td>
                      <td className="num">{profile.commission}%</td>
                      <td className="muted">{profile.paymentDueDate ?? '—'}</td>
                      <td className="num">{formatMoney(profile.totalAmount)}</td>
                      <td className="num">{formatMoney(profile.paid)}</td>
                      <td className={profile.rest === 0 ? 'num remain-ok' : 'num remain-warn'}>
                        {formatMoney(profile.rest)}
                      </td>
                      <td className="num">{profile.ordersCount}</td>
                      <td className="num">{profile.subAccountsCount}</td>
                      <td className="actions-col">
                        <button className="open-btn" onClick={(event) => event.stopPropagation()}>
                          Открыть →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <div className="label">{label}</div>
      <div className="value small">{value}</div>
    </div>
  );
}
