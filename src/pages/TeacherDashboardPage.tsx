import React, { useState, useEffect } from 'react';
import { GraduationCap, Search, Download, Users, Flame, Award, Target, ShieldCheck } from 'lucide-react';
import { User } from '../types.ts';

interface StudentRow {
  id: string;
  nickname: string;
  email?: string;
  role: string;
  rankTitle: string;
  level: number;
  xp: number;
  streak: number;
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
  accuracy: number;
  lastActiveDate: string;
  gardenPlants: number;
  unlockedSecretLab: boolean;
}

interface TeacherDashboardPageProps {
  currentUser: User;
}

export const TeacherDashboardPage: React.FC<TeacherDashboardPageProps> = ({ currentUser }) => {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('biosphere_token');

  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await fetch('/api/teacher/students', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setStudents(data.students || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, [token]);

  const filteredStudents = students.filter(s =>
    s.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const exportCsv = () => {
    const headers = ['اسم الطالب', 'الرتبة العلمية', 'المستوى', 'نقاط XP', 'الأسئلة المحلولة', 'الدقة %', 'سلسلة الأيام', 'آخر نشاط'];
    const rows = filteredStudents.map(s => [
      `"${s.nickname}"`,
      `"${s.rankTitle}"`,
      s.level,
      s.xp,
      s.totalQuestionsAnswered,
      `${s.accuracy}%`,
      s.streak,
      s.lastActiveDate
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `تقرير_طلاب_BioSphere_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-right">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-50 text-indigo-800 text-xs font-semibold mb-1">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
            <span>بوابة المعلم والتقييم التربوي</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1F3A4A] tracking-tight">
            لوحة المعلمين والتحليلات الصفية
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            متابعة دقيقة لمستوى استيعاب الطلاب ونقاط قوتهم ومعدلات الدقة دون المساس بخصوصيتهم.
          </p>
        </div>

        <button
          onClick={exportCsv}
          className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>تصدير تقرير الطلاب (CSV)</span>
        </button>
      </div>

      {/* Quick Class Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-right">
        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-2xs space-y-1">
          <span className="text-xs text-slate-400">إجمالي الطلاب المسجلين</span>
          <div className="text-2xl font-bold font-mono text-[#1F3A4A] tabular-nums">
            {students.length}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-2xs space-y-1">
          <span className="text-xs text-slate-400">متوسط الدقة الصفية</span>
          <div className="text-2xl font-bold font-mono text-[#1FA97A] tabular-nums">
            {students.length > 0 ? Math.round(students.reduce((a, b) => a + b.accuracy, 0) / students.length) : 0}%
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-2xs space-y-1">
          <span className="text-xs text-slate-400">الأسئلة المنجزة صفياً</span>
          <div className="text-2xl font-bold font-mono text-sky-700 tabular-nums">
            {students.reduce((a, b) => a + b.totalQuestionsAnswered, 0)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-2xs space-y-1">
          <span className="text-xs text-slate-400">مؤهلين للمختبر السري</span>
          <div className="text-2xl font-bold font-mono text-indigo-700 tabular-nums">
            {students.filter(s => s.unlockedSecretLab).length}
          </div>
        </div>
      </div>

      {/* Student List Table with Search */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
        
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث باسم الطالب (مثال: جوانا العلياني)..."
              className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-200 text-xs text-[#1F3A4A] focus:outline-none focus:ring-2 focus:ring-[#2EC4C6]"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          </div>

          <div className="text-xs text-slate-400 font-mono">
            عرض {filteredStudents.length} من {students.length} طالب
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50/70 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="p-3.5">اسم الطالب</th>
                {currentUser.role === 'admin' && <th className="p-3.5">البريد (أدمن فقط)</th>}
                <th className="p-3.5">الرتبة العلمية</th>
                <th className="p-3.5">XP</th>
                <th className="p-3.5">الأسئلة المحلولة</th>
                <th className="p-3.5">الدقة</th>
                <th className="p-3.5">السلسلة</th>
                <th className="p-3.5">نباتات الحديقة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-3.5 font-bold text-[#1F3A4A]">{s.nickname}</td>
                  {currentUser.role === 'admin' && (
                    <td className="p-3.5 font-mono text-slate-500">{s.email || '—'}</td>
                  )}
                  <td className="p-3.5 text-slate-600 font-medium">{s.rankTitle}</td>
                  <td className="p-3.5 font-mono font-bold text-[#2EC4C6] tabular-nums">{s.xp}</td>
                  <td className="p-3.5 font-mono tabular-nums">{s.totalQuestionsAnswered}</td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded-md font-mono font-bold ${
                      s.accuracy >= 80 ? 'bg-emerald-100 text-emerald-800' :
                      s.accuracy >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {s.accuracy}%
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-amber-700 font-semibold">
                    <span className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      {s.streak}d
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-emerald-700">{s.gardenPlants}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
