import { useNavigate } from 'react-router-dom';
import type { ProfileListItem } from '../types';
import { formatMoney, profileLabel, shortId } from '../format';

interface Props {
  title: string;
  items: ProfileListItem[];
}

export function SubProfilesTable({ title, items }: Props) {
  const navigate = useNavigate();

  return (
    <div className="section">
      <div className="section-head">
        <div className="title">
          {title} <span className="count">{items.length}</span>
        </div>
      </div>
      {items.length === 0 ? (
        <div className="empty">
          <div className="icon">∅</div>
          <h3>Нет вложенных профилей</h3>
          <p>Этот профиль пока не имеет суб-аккаунтов.</p>
        </div>
      ) : (
        <table className="tbl">
          <thead>
            <tr>
              <th className="idx">#</th>
              <th>Тип</th>
              <th>ID</th>
              <th className="num">Сумма</th>
              <th className="num">Оплачено</th>
              <th className="num">Остаток</th>
              <th className="num">Заказов</th>
              <th className="num">Суб-акк.</th>
              <th className="num">Комиссия</th>
              <th>Срок</th>
              <th className="actions-col"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((profile, index) => (
              <tr
                key={profile.id}
                className="row-drill"
                onClick={() => navigate(`/profiles/${profile.id}`)}
              >
                <td className="idx">{index + 1}</td>
                <td>
                  <span className="kind-pill">{profileLabel(profile.type)}</span>
                </td>
                <td className="id">{shortId(profile.id)}</td>
                <td className="num">{formatMoney(profile.totalAmount)}</td>
                <td className="num">{formatMoney(profile.paid)}</td>
                <td className={profile.rest === 0 ? 'num remain-ok' : 'num remain-warn'}>
                  {formatMoney(profile.rest)}
                </td>
                <td className="num">{profile.ordersCount}</td>
                <td className="num">
                  {profile.type === 'min' ? '—' : profile.subAccountsCount}
                </td>
                <td className="num">{profile.commission}%</td>
                <td className="muted">{profile.paymentDueDate ?? '—'}</td>
                <td className="actions-col">
                  <button className="open-btn" onClick={(event) => event.stopPropagation()}>
                    Открыть →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
