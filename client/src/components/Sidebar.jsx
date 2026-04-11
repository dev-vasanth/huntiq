import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Inbox, Tag, BarChart2, Settings, LogOut, Megaphone, MessageCircle, Lightbulb, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const FOUNDER_EMAIL = 'vasanthbscit2016@gmail.com';

const NAV = [
  { to: '/dashboard',          icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/leads',              icon: Inbox,           label: 'Leads' },
  { to: '/campaigns',          icon: Megaphone,       label: 'Campaigns' },
  { to: '/conversations',      icon: MessageCircle,   label: 'Conversations' },
  { to: '/keywords',           icon: Tag,             label: 'Keywords' },
  { to: '/analytics',          icon: BarChart2,       label: 'Analytics' },
  { to: '/feature-requests',   icon: Lightbulb,       label: 'Feature Requests' },
  { to: '/settings',           icon: Settings,        label: 'Settings' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <aside className="w-56 shrink-0 flex flex-col h-screen sticky top-0 border-r"
      style={{ background: '#0a0a12', borderColor: '#1a1a2e' }}>

      {/* Logo */}
      <div className="p-4 border-b" style={{ borderColor: '#1a1a2e' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #f97316, #a855f7)' }}>
            <span className="text-white text-sm">🎯</span>
          </div>
          <div>
            <div className="font-bold text-sm text-white">HuntIQ</div>
            <div className="text-xs" style={{ color: '#2e2e52' }}>Reddit Lead Intel</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'nav-active' : ''}`
            }>
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
        {user?.email === FOUNDER_EMAIL && (
          <NavLink to="/admin"
            className={({ isActive }) => `nav-item ${isActive ? 'nav-active' : ''}`}>
            <ShieldCheck size={16} />
            Admin
          </NavLink>
        )}
      </nav>

      {/* User section */}
      <div className="p-3 border-t" style={{ borderColor: '#1a1a2e' }}>
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl mb-1">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg, #f97316, #a855f7)' }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">{user?.name}</div>
            <div className="text-xs capitalize" style={{ color: '#2e2e52' }}>{user?.plan} plan</div>
          </div>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm w-full transition-all"
          style={{ color: '#475569' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.background = 'transparent'; }}>
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
