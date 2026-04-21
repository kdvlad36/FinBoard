import { Link } from 'react-router-dom';
import { profileLabel, shortId } from '../format';
import type { ProfileType } from '../types';

export interface Crumb {
  id: string | null;
  type: ProfileType | 'root';
  label: string;
}

interface Props {
  crumbs: Crumb[];
}

export function Topbar({ crumbs }: Props) {
  return (
    <div className="topbar">
      <nav className="crumbs">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          const content =
            crumb.type === 'root' ? (
              <span>{crumb.label}</span>
            ) : (
              <>
                <span className="kind-tag">{profileLabel(crumb.type as ProfileType)}</span>
                <span>{crumb.id ? shortId(crumb.id) : ''}</span>
              </>
            );
          return (
            <span key={`${crumb.id ?? 'root'}-${index}`} className="flex">
              {isLast ? (
                <span className="crumb current">{content}</span>
              ) : (
                <Link
                  to={crumb.id ? `/profiles/${crumb.id}` : '/'}
                  className="crumb"
                  style={{ textDecoration: 'none' }}
                >
                  {content}
                </Link>
              )}
              {!isLast && <span className="sep">/</span>}
            </span>
          );
        })}
      </nav>
      <div className="topbar-right">
        <span className="hint-chip">FinBoard MVP</span>
      </div>
    </div>
  );
}
