import React, { useState } from 'react';
import { User as UserIcon, Shield, Mail, Calendar, Award, Flame, Sprout, Download, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { User } from '../types.ts';
import { exportStudentPersonalData } from '../lib/firebase.ts';

interface ProfilePageProps {
  user: User;
  onLogout: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, onLogout }) => {
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleExportMyData = async () => {
    setExporting(true);
    try {
      const dataStr = await exportStudentPersonalData(user.id);
      const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `biosphere_student_backup_${user.nickname.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 select-none text-right">
      
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-[#1F3A4A] tracking-tight">
          الملف الشخصي والخصوصية 👤
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          إدارة بيانات حسابك، الخصوصية، وتصدير سجلك الأكاديمي الدائم.
        </p>
      </div>

      {exportSuccess && (
        <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-teal-600 shrink-0" />
          <span>تم تنزيل نسختك الاحتياطية الشخصية (JSON) بنجاح! السجل محفوظ سحابياً بـ Firestore.</span>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-100 shadow-xs space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#2EC4C6]/20 to-[#7CC6F2]/20 border border-[#2EC4C6]/30 flex items-center justify-center text-3xl shadow-xs">
            {user.level === 8 ? '🌎' : user.level >= 6 ? '🧠' : user.level >= 4 ? '🧬' : user.level >= 2 ? '🔬' : '🌱'}
          </div>

          <div className="space-y-0.5">
            <h2 className="text-xl font-bold text-[#1F3A4A]">{user.nickname}</h2>
            <div className="text-xs text-[#2EC4C6] font-semibold">{user.rankTitle} · المستوى {user.level}</div>
            <div className="text-[11px] text-slate-400 font-mono">معرف الطالب الدائم: {user.id.slice(0, 16)}...</div>
          </div>
        </div>

        {/* Cloud Persistence Guarantee Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-500/10 via-[#FAF8F2] to-sky-500/10 border border-[#2EC4C6]/30 text-xs text-slate-700 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-[#1F3A4A]">
            <Shield className="w-4 h-4 text-[#1FA97A]" />
            <span>حفظ سحابي مركزي دائم (Cloud Firestore):</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            بياناتك، نقاط XP، وسلسلة أيامك (Streak) مربوطة بسجل Firestore الموثق سحابياً وتتزامن تلقائياً عبر أي جهاز أو جوال تسجل منه. لا يتم تخزين أي بيانات جوهرية محلياً.
          </p>
        </div>

        {/* Grid Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-[11px] text-slate-400 block">إجمالي XP</span>
            <div className="text-lg font-bold font-mono text-[#2EC4C6] tabular-nums mt-0.5">{user.xp}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-[11px] text-slate-400 block">السلسلة</span>
            <div className="text-lg font-bold font-mono text-amber-600 tabular-nums mt-0.5">{user.streak}d</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-[11px] text-slate-400 block">الأوسمة</span>
            <div className="text-lg font-bold font-mono text-slate-700 tabular-nums mt-0.5">{user.unlockedAchievements?.length || 0}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-[11px] text-slate-400 block">نباتات الحديقة</span>
            <div className="text-lg font-bold font-mono text-emerald-600 tabular-nums mt-0.5">{user.gardenPlants}</div>
          </div>
        </div>

        {/* Student Self-Service Backup Export */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-[#1F3A4A]">تصدير سجلي الأكاديمي (النسخة الاحتياطية)</h3>
              <p className="text-[11px] text-slate-400">تنزيل نسخة كاملة من إنجازاتك وسجل XP واختباراتك بصيغة JSON</p>
            </div>
            <button
              onClick={handleExportMyData}
              disabled={exporting}
              className="py-2 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors disabled:opacity-60"
            >
              {exporting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5 text-[#2EC4C6]" />
              )}
              <span>تصدير سجلي</span>
            </button>
          </div>
        </div>

        {/* Logout Option */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-700">إنهاء الجلسة</div>
            <div className="text-[11px] text-slate-400">تسجيل الخروج من هذا الجهاز بأمان</div>
          </div>
          <button
            onClick={onLogout}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
          >
            تسجيل الخروج
          </button>
        </div>

      </div>

    </div>
  );
};
