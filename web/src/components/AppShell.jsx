import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../lib/supabaseClient.js';

// [label, icon, path|null]
const NAV = {
  admin:  [['Dashboard','▚','/admin'],['Teams','👥','/admin/teams'],['Players','⚽','/admin/players'],['Trials','📋','/admin/trials'],['Reports','📊',null],['Settings','⚙',null]],
  coach:  [['Dashboard','▚','/coach'],['Log Training','➕','/coach/training'],['Log Match','⚽','/coach/match'],['Schedule','📅','/coach/schedule'],['Messages','💬',null]],
  parent: [['My Child','⚽','/parent'],['Schedule','📅','/schedule'],['Notifications','🔔','/notifications'],['Messages','💬',null]],
  player: [['My Profile','⚽','/player'],['Leaderboard','🏆',null],['Schedule','📅','/schedule']],
};

const initials = (n = '') => n.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

export default function AppShell({ active, title, children }) {
  const { profile, role, session, logout } = useAuth();
  const navigate = useNavigate();
  const items = NAV[role] || [];
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!session || session.demo) return;
    supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('read', false)
      .then(({ count }) => setUnread(count || 0));
  }, [session]);

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand"><span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--energy)' }} /> PitchIQ</div>
        {items.map(([label, icon, path]) => {
          const cls = `nav-item ${label === active ? 'active' : ''}`;
          const inner = <><span style={{ width: 18, textAlign: 'center' }}>{icon}</span> {label}</>;
          return path
            ? <Link key={label} to={path} className={cls}>{inner}</Link>
            : <div key={label} className={cls} style={{ opacity: .55, cursor: 'default' }} title="Coming soon">{inner}</div>;
        })}
        <div style={{ marginTop: 'auto' }}>
          <div className="nav-item" onClick={() => { logout(); navigate('/login'); }}>
            <span style={{ width: 18, textAlign: 'center' }}>↩</span> Exit
          </div>
        </div>
      </aside>

      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <header className="topbar">
          <h3 style={{ margin: 0 }}>{title}</h3>
          <div className="row">
            <button className="btn btn-ghost" style={{ position: 'relative', minHeight: 36, padding: '6px 10px' }}
              onClick={() => navigate('/notifications')} title="Notifications">
              🔔
              {unread > 0 && <span style={{ position: 'absolute', top: 2, right: 2, background: 'var(--danger)', color: '#fff', borderRadius: 999, fontSize: 10, fontWeight: 700, minWidth: 16, height: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>{unread}</span>}
            </button>
            <span className="badge badge-neutral">{profile?.org || 'PitchIQ'}</span>
            {session?.demo && <span className="badge badge-success">Demo mode</span>}
            <span className="avatar">{initials(profile?.name)}</span>
          </div>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
