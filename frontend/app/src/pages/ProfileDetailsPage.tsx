import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProfile } from '../api';
import type { ProfileDetails } from '../types';
import { Topbar } from '../components/Topbar';
import type { Crumb } from '../components/Topbar';
import { ProfileSummary } from '../components/ProfileSummary';
import { OrdersTable } from '../components/OrdersTable';
import { SubProfilesTable } from '../components/SubProfilesTable';
import { profileLabel, shortId } from '../format';

const CHILD_TITLE: Record<ProfileDetails['type'], string> = {
  plus: 'Вложенные Profile',
  mid: 'Вложенные Profile min',
  min: '',
};

export function ProfileDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<ProfileDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) {
      return;
    }
    try {
      const data = await getProfile(id);
      setProfile(data);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [id]);

  useEffect(() => {
    setProfile(null);
    setError(null);
    void load();
  }, [load]);

  const crumbs: Crumb[] = [{ id: null, type: 'root', label: 'Profile+' }];
  if (profile) {
    for (const ancestor of profile.ancestors) {
      crumbs.push({ id: ancestor.id, type: ancestor.type, label: '' });
    }
    crumbs.push({ id: profile.id, type: profile.type, label: '' });
  }

  return (
    <>
      <Topbar crumbs={crumbs} />
      <div className="content">
        {error && <div className="empty">Ошибка: {error}</div>}
        {!profile && !error && <div className="empty">Загрузка…</div>}
        {profile && (
          <>
            <header className="page-header">
              <div>
                <h1>
                  <span className={`kind-pill${profile.type === 'plus' ? ' profile-plus' : ''}`}>
                    {profileLabel(profile.type)}
                  </span>
                  Карточка профиля
                </h1>
                <div className="sub">
                  Комиссия {profile.commission}% · срок оплаты {profile.paymentDueDate ?? '—'}
                </div>
              </div>
              <span className="id">{shortId(profile.id)}</span>
            </header>

            <ProfileSummary profile={profile} />
            <OrdersTable orders={profile.orders} onPaid={load} />
            {profile.type !== 'min' && (
              <SubProfilesTable
                title={CHILD_TITLE[profile.type]}
                items={profile.children}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}
