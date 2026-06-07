import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Handshake, 
  UserCheck, 
  BarChart3, 
  Bell,
  ChevronLeft,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { useAppStore } from '@/store';
import { cn } from '@/utils/format';

const menuItems = [
  { path: '/dashboard', label: '风险总览', icon: LayoutDashboard },
  { path: '/clues', label: '线索登记', icon: FileText },
  { path: '/visits', label: '入户走访', icon: Users },
  { path: '/mediation', label: '调解流转', icon: Handshake },
  { path: '/key-persons', label: '重点人员', icon: UserCheck },
  { path: '/statistics', label: '统计分析', icon: BarChart3 },
  { path: '/messages', label: '消息中心', icon: Bell },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, messages } = useAppStore();
  const unreadCount = messages.filter(m => !m.isRead).length;

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-full bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 z-40 flex flex-col",
      sidebarCollapsed ? "w-16" : "w-60"
    )}>
      <div className="h-16 flex items-center justify-center border-b border-slate-700/50 px-4">
        {sidebarCollapsed ? (
          <ShieldAlert className="w-8 h-8 text-blue-400" />
        ) : (
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-base font-bold leading-tight">综治矛盾</h1>
              <p className="text-xs text-slate-400 leading-tight">风险排查系统</p>
            </div>
          </div>
        )}
      </div>
      
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                    isActive 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" 
                      : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                  )}
                >
                  <Icon className={cn(
                    "w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110",
                    sidebarCollapsed && "mx-auto"
                  )} />
                  {!sidebarCollapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                  {!sidebarCollapsed && item.path === '/messages' && unreadCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                      {unreadCount}
                    </span>
                  )}
                  {sidebarCollapsed && item.path === '/messages' && unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <button
        onClick={toggleSidebar}
        className="h-12 border-t border-slate-700/50 flex items-center justify-center hover:bg-slate-700/50 transition-colors"
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronLeft className="w-5 h-5 text-slate-400" />
        )}
      </button>
    </aside>
  );
}
