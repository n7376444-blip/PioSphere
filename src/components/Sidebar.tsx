import React from 'react';
import { Logo } from './Logo.tsx';
import {
  Home,
  Dna,
  FileQuestion,
  Zap,
  Sprout,
  Compass,
  Trophy,
  Award,
  Bot,
  User as UserIcon,
  FlaskConical,
  Info,
  Settings as SettingsIcon,
  LogOut,
  GraduationCap,
  ShieldAlert,
  X
} from 'lucide-react';
import { User } from '../types.ts';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  user: User;
  onLogout: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  user,
  onLogout,
  isOpenMobile,
  onCloseMobile
}) => {
  const mainNavItems = [
    { id: 'home', label: 'الرئيسية', icon: Home },
    { id: 'journey', label: 'رحلتي العلمية', icon: Dna },
    { id: 'quizzes', label: 'الاختبارات', icon: FileQuestion },
    { id: 'daily', label: 'سؤال اليوم', icon: Zap, badge: 'يومي' },
    { id: 'garden', label: 'حديقة الإنجازات', icon: Sprout },
    { id: 'map', label: 'خريطة الأحياء', icon: Compass },
    { id: 'leaderboard', label: 'لوحة الصدارة', icon: Trophy },
    { id: 'achievements', label: 'إنجازاتي', icon: Award },
    { id: 'biobot', label: 'المرشد الحيوي', icon: Bot, badge: 'ذكاء' },
    { id: 'secret_lab', label: 'المختبر السري', icon: FlaskConical, locked: !user.unlockedSecretLab && user.role !== 'admin' },
    { id: 'profile', label: 'ملفي الشخصي', icon: UserIcon },
    { id: 'about', label: 'حول المنصة', icon: Info }
  ];

  const handleItemClick = (id: string, locked?: boolean) => {
    if (locked) {
      alert('المختبر السري مقفل! حافظ على سلسلة 7 أيام متتالية أو أحرز 80% في التحصيلي لفتحه.');
      return;
    }
    onSelectTab(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 right-0 z-50 w-72 bg-white border-l border-slate-100 flex flex-col transition-transform duration-300 md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-xl' : 'translate-x-full md:translate-x-0'
        }`}
      >
        {/* Header with Official Logo */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <Logo size="sm" showText={true} withAnimation={true} />
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Mini Profile Badge */}
        <div className="mx-3 my-3 p-3 rounded-2xl bg-gradient-to-br from-[#FAF8F2] to-white border border-[#2EC4C6]/20 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2EC4C6]/15 flex items-center justify-center text-xl shrink-0">
            {user.level === 8 ? '🌎' : user.level >= 6 ? '🧠' : user.level >= 4 ? '🧬' : user.level >= 2 ? '🔬' : '🌱'}
          </div>
          <div className="overflow-hidden text-right flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#1F3A4A] truncate">{user.nickname}</span>
              {user.role === 'admin' && (
                <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-sm shrink-0">
                  أدمن
                </span>
              )}
              {user.role === 'teacher' && (
                <span className="text-[9px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.2 rounded-sm shrink-0">
                  معلم
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
              <span className="text-[#1FA97A] font-medium">{user.rankTitle}</span>
              <span>·</span>
              <span className="font-mono tabular-nums text-slate-600 font-semibold">{user.xp} XP</span>
            </div>
          </div>
        </div>

        {/* Navigation Items (Scrollable) */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id, item.locked)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#2EC4C6]/15 text-[#1F3A4A] font-bold shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                } ${item.locked ? 'opacity-55' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#2EC4C6]' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-[#2EC4C6]/10 text-[#2EC4C6]">
                      {item.badge}
                    </span>
                  )}
                  {item.locked && (
                    <span className="text-[10px] text-slate-400">🔒</span>
                  )}
                </div>
              </button>
            );
          })}

          {/* Conditional Teacher Dashboard Item */}
          {(user.role === 'teacher' || user.role === 'admin') && (
            <div className="pt-2">
              <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                إدارة التعليم
              </div>
              <button
                onClick={() => handleItemClick('teacher_dashboard')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  currentTab === 'teacher_dashboard'
                    ? 'bg-indigo-50 text-indigo-900 font-bold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-indigo-500" />
                <span>لوحة المعلمين</span>
              </button>
            </div>
          )}

          {/* STRICT Conditional Admin Dashboard Item (Admin ONLY: n7376444@gmail.com) */}
          {user.role === 'admin' && (
            <div className="pt-2">
              <div className="px-3 py-1 text-[10px] font-semibold text-amber-600 uppercase tracking-wider flex items-center gap-1">
                <span>الإدارة العليا للمنصة</span>
              </div>
              <button
                onClick={() => handleItemClick('admin_dashboard')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  currentTab === 'admin_dashboard'
                    ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200'
                    : 'text-slate-700 hover:bg-amber-50/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span className="font-bold">لوحة الإدارة (الأدمن)</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </button>
            </div>
          )}
        </nav>

        {/* Footer actions */}
        <div className="p-3 border-t border-slate-100 space-y-1 bg-slate-50/40">
          <button
            onClick={() => handleItemClick('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors ${
              currentTab === 'settings' ? 'bg-slate-100 font-bold' : ''
            }`}
          >
            <SettingsIcon className="w-4 h-4 text-slate-400" />
            <span>الإعدادات</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>
    </>
  );
};
