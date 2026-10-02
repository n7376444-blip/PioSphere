import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Edit2,
  Trash2,
  RotateCcw,
  Copy,
  Eye,
  CheckCircle2,
  XCircle,
  FileText,
  Users,
  Settings as SettingsIcon,
  Clock,
  Sparkles,
  BarChart2,
  Activity,
  Database,
  RefreshCw,
  Server,
  HardDrive
} from 'lucide-react';
import { Question, AuditLog, User } from '../types.ts';
import { getFirestoreSystemDiagnostics, exportEntireFirestoreDatabase } from '../lib/firebase.ts';

interface AdminDashboardPageProps {
  currentUser: User;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'questions' | 'import' | 'users' | 'audit' | 'settings' | 'diagnostics'>('questions');
  
  // Questions State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [includeDeleted, setIncludeDeleted] = useState(false);
  
  // Question Modal (Add / Edit / Preview)
  const [editingQuestion, setEditingQuestion] = useState<Partial<Question> | null>(null);
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);
  const [isNewQuestion, setIsNewQuestion] = useState(false);

  // Bulk Import State
  const [importJsonText, setImportJsonText] = useState('');
  const [importFeedback, setImportFeedback] = useState<string | null>(null);

  // Users State
  const [usersList, setUsersList] = useState<any[]>([]);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Settings State
  const [settingsData, setSettingsData] = useState<any>(null);

  // Diagnostics & Backup State
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [diagLoading, setDiagLoading] = useState(false);
  const [backupDownloading, setBackupDownloading] = useState(false);

  const token = localStorage.getItem('biosphere_token');

  // Load Questions
  const loadQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const url = `/api/admin/questions?search=${encodeURIComponent(searchTerm)}&category=${categoryFilter}&difficulty=${difficultyFilter}&type=${typeFilter}&includeDeleted=${includeDeleted}`;
      const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setQuestions(data.questions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'questions') loadQuestions();
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'audit') loadAuditLogs();
    if (activeTab === 'settings') loadSettings();
    if (activeTab === 'diagnostics') loadDiagnostics();
  }, [activeTab, categoryFilter, difficultyFilter, typeFilter, includeDeleted]);

  const loadDiagnostics = async () => {
    setDiagLoading(true);
    try {
      const data = await getFirestoreSystemDiagnostics();
      setDiagnostics(data);
    } catch (e) {
      console.error('Diagnostics error:', e);
    } finally {
      setDiagLoading(false);
    }
  };

  const handleDownloadFullBackup = async () => {
    setBackupDownloading(true);
    try {
      const jsonStr = await exportEntireFirestoreDatabase();
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `biosphere_full_firestore_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export full database backup:', err);
    } finally {
      setBackupDownloading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setUsersList(data.users || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadAuditLogs = async () => {
    try {
      const res = await fetch('/api/admin/audit-logs', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setAuditLogs(data.auditLogs || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setSettingsData(data.settings);
    } catch (err) {
      console.error(err);
    }
  };

  // Save / Add Question
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;

    try {
      const isCreate = isNewQuestion;
      const url = isCreate ? '/api/admin/questions' : `/api/admin/questions/${editingQuestion.id}`;
      const method = isCreate ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingQuestion)
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'فشلت العملية');
        return;
      }

      setEditingQuestion(null);
      setIsNewQuestion(false);
      loadQuestions();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Question (Soft Delete)
  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من الحذف الناعم لهذا السؤال؟ يمكنك استعادته لاحقاً.')) return;
    try {
      await fetch(`/api/admin/questions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      loadQuestions();
    } catch (err) {
      console.error(err);
    }
  };

  // Restore Question
  const handleRestore = async (id: string) => {
    try {
      await fetch(`/api/admin/questions/${id}/restore`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      loadQuestions();
    } catch (err) {
      console.error(err);
    }
  };

  // Duplicate Question
  const handleDuplicate = async (id: string) => {
    try {
      await fetch(`/api/admin/questions/${id}/duplicate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      loadQuestions();
    } catch (err) {
      console.error(err);
    }
  };

  // Export questions to JSON
  const handleExport = async () => {
    try {
      const res = await fetch('/api/admin/questions/export', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data.questions, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `بنك_اسئلة_BioSphere_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    } catch (err) {
      console.error(err);
    }
  };

  // Bulk Import
  const handleBulkImport = async () => {
    try {
      let items: any[] = [];
      try {
        items = JSON.parse(importJsonText);
      } catch {
        alert('صيغة JSON غير صالحة. يرجى التأكد من التنسيق.');
        return;
      }

      const res = await fetch('/api/admin/questions/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'فشل الاستيراد');
        return;
      }

      setImportFeedback(`تم استيراد ${data.importedCount} سؤال بنجاح!`);
      setImportJsonText('');
      loadQuestions();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء الاستيراد');
    }
  };

  // Change User Role
  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      if (!res.ok) {
        const d = await res.json();
        alert(d.error || 'فشل تغيير الدور');
        return;
      }
      loadUsers();
    } catch (err) {
      console.error(err);
    }
  };

  // Suspend / Unsuspend user
  const handleToggleSuspend = async (userId: string) => {
    try {
      await fetch(`/api/admin/users/${userId}/suspend`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      loadUsers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-l from-amber-500/10 via-white to-white border border-amber-300 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-right">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-1">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
            <span>لوحة المالك والمسؤول المعتمد</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1F3A4A]">
            الإدارة العليا لمنصة BioSphere
          </h1>
          <p className="text-xs text-slate-500 font-mono">
            المشرف الحالي: {currentUser.email}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-2xl">
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
              activeTab === 'questions' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            بنك الأسئلة
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
              activeTab === 'import' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الاستيراد الجماعي
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
              activeTab === 'users' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            المستخدمين والأدوار
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
              activeTab === 'audit' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            سجل التدقيق (Audit)
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
              activeTab === 'settings' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            قيم XP والرتب
          </button>
          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'diagnostics' ? 'bg-amber-600 text-white shadow-xs font-bold' : 'text-amber-800 bg-amber-50/80 hover:bg-amber-100'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>فحص السحابة والنسخ الاحتياطي</span>
          </button>
        </div>
      </div>

      {/* ================= TAB 1: QUESTIONS MANAGEMENT ================= */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          
          {/* Actions & Filters Bar */}
          <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs flex flex-wrap items-center justify-between gap-3 text-right">
            
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setIsNewQuestion(true);
                  setEditingQuestion({
                    text: '',
                    options: ['', '', '', ''],
                    correctAnswer: 0,
                    explanation: '',
                    category: 'bio1',
                    unit: 'الوحدة الأولى',
                    difficulty: 'medium',
                    type: 'tahsili',
                    status: 'published'
                  });
                }}
                className="py-2 px-4 rounded-xl bg-[#2EC4C6] hover:bg-[#2EC4C6]/90 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة سؤال جديد</span>
              </button>

              <button
                onClick={handleExport}
                className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تصدير البنك (JSON)</span>
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadQuestions()}
                  placeholder="بحث في نص السؤال..."
                  className="pl-3 pr-8 py-1.5 rounded-xl border border-slate-200 text-xs text-[#1F3A4A] focus:outline-none focus:ring-1 focus:ring-[#2EC4C6]"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="py-1.5 px-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white"
              >
                <option value="all">كل الأقسام</option>
                <option value="bio1">أحياء 1</option>
                <option value="bio2">أحياء 2</option>
                <option value="ecology">علم البيئة</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="py-1.5 px-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white"
              >
                <option value="all">كل الأنواع</option>
                <option value="tahsili">التحصيلي</option>
                <option value="post_unit">ما بعد الوحدة</option>
                <option value="daily">سؤال اليوم</option>
                <option value="secret_lab">المختبر السري</option>
              </select>

              <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer mr-2">
                <input
                  type="checkbox"
                  checked={includeDeleted}
                  onChange={(e) => setIncludeDeleted(e.target.checked)}
                  className="rounded text-[#2EC4C6]"
                />
                <span>المحذوفة</span>
              </label>
            </div>

          </div>

          {/* Questions Table */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
            <div className="p-3.5 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>إجمالي الأسئلة المسترجعة: <strong className="text-[#1F3A4A] font-mono">{questions.length}</strong></span>
            </div>

            <div className="divide-y divide-slate-100">
              {questions.map((q) => {
                const acc = q.stats && q.stats.timesAnswered > 0
                  ? Math.round((q.stats.timesCorrect / q.stats.timesAnswered) * 100)
                  : 0;

                return (
                  <div
                    key={q.id}
                    className={`p-4 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      q.isDeleted ? 'bg-rose-50/40 opacity-70' : 'hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="space-y-1.5 text-right flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-[11px]">
                        <span className="font-mono text-slate-400">[{q.id}]</span>
                        <span className="font-bold text-[#2EC4C6]">{q.categoryLabel || q.category}</span>
                        <span>·</span>
                        <span className="text-slate-500">{q.unit}</span>
                        <span>·</span>
                        <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-sm text-[10px]">
                          {q.type}
                        </span>
                        {q.isDeleted && (
                          <span className="bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded-sm text-[10px] font-bold">
                            محذوف ناعم
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-[#1F3A4A] leading-relaxed">
                        {q.text}
                      </h3>

                      <div className="text-[11px] text-slate-400 flex items-center gap-4">
                        <span>إجابات الطلاب: {q.stats?.timesAnswered || 0}</span>
                        <span>دقة السؤال: {acc}%</span>
                        <span>متوسط الوقت: {q.stats?.avgTimeSeconds || 15} ثانية</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5 self-end md:self-auto shrink-0">
                      <button
                        onClick={() => setPreviewQuestion(q)}
                        title="معاينة السؤال كما يظهر للطالب"
                        className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          setIsNewQuestion(false);
                          setEditingQuestion({ ...q });
                        }}
                        title="تعديل السؤال"
                        className="p-2 rounded-xl text-teal-600 hover:bg-teal-50 cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDuplicate(q.id)}
                        title="نسخ السؤال"
                        className="p-2 rounded-xl text-sky-600 hover:bg-sky-50 cursor-pointer"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      {q.isDeleted ? (
                        <button
                          onClick={() => handleRestore(q.id)}
                          title="استعادة السؤال المحذوف"
                          className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDelete(q.id)}
                          title="حذف ناعم"
                          className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* ================= TAB 2: BULK IMPORT ================= */}
      {activeTab === 'import' && (
        <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-xs text-right space-y-6">
          <div>
            <h2 className="text-lg font-bold text-[#1F3A4A]">الاستيراد الجماعي للأسئلة (JSON / Excel Template)</h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              قم بلصق مصفوفة JSON تحتوي على الأسئلة المستخرجة من جدول الإكسل لإضافتها فورياً إلى بنك الأسئلة دون توقف.
            </p>
          </div>

          {importFeedback && (
            <div className="p-3 bg-teal-50 border border-teal-200 text-teal-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
              <span>{importFeedback}</span>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">بيانات الأسئلة بتنسيق JSON:</span>
              <button
                type="button"
                onClick={() => {
                  setImportJsonText(JSON.stringify([
                    {
                      text: "سؤال تجريبي مستورد: ما وظيفة الميتوكندريا؟",
                      options: ["إنتاج الطاقة ATP", "بناء الجدار الخلوي", "التحكم في النواة", "تخزين النشا"],
                      correctAnswer: 0,
                      explanation: "الميتوكندريا هي محطة توليد الطاقة في الخلية.",
                      category: "bio1",
                      unit: "تركيب الخلية",
                      difficulty: "easy",
                      type: "tahsili"
                    }
                  ], null, 2));
                }}
                className="text-xs text-[#2EC4C6] font-bold hover:underline cursor-pointer"
              >
                تحميل نموذج تجريبي للتعبئة
              </button>
            </div>

            <textarea
              rows={12}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder='[ { "text": "...", "options": ["أ", "ب", "ج", "د"], "correctAnswer": 0, "category": "bio1", "unit": "...", "explanation": "..." } ]'
              className="w-full p-4 rounded-2xl border border-slate-200 font-mono text-xs text-left direction-ltr focus:outline-none focus:ring-2 focus:ring-[#2EC4C6]"
            />
          </div>

          <button
            onClick={handleBulkImport}
            disabled={!importJsonText.trim()}
            className="py-3 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            بدء التحقق والاستيراد الجماعي
          </button>
        </div>
      )}

      {/* ================= TAB 3: USERS & ROLES ================= */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 text-right">
            <h3 className="text-base font-bold text-[#1F3A4A]">إدارة المستخدمين والأدوار</h3>
            <p className="text-xs text-slate-400">
              يمكنك ترقية أي طالب موثوق إلى دور "معلم" لمتابعة صفوفه وتقاريرهم. لا يمكن تغيير الأدمن إلا من إعدادات البيئة على السيرفر.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="p-3.5">اسم الطالب</th>
                  <th className="p-3.5">البريد الإلكتروني</th>
                  <th className="p-3.5">الدور الحالي</th>
                  <th className="p-3.5">الرتبة العلمية</th>
                  <th className="p-3.5">الحالة</th>
                  <th className="p-3.5 text-center">إجراءات الصلاحية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 font-bold text-[#1F3A4A]">{u.nickname}</td>
                    <td className="p-3.5 font-mono text-slate-500">{u.email}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        u.role === 'admin' ? 'bg-amber-100 text-amber-900' :
                        u.role === 'teacher' ? 'bg-indigo-100 text-indigo-900' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {u.role === 'admin' ? 'مدير المنصة' : u.role === 'teacher' ? 'معلم' : 'طالب'}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600">{u.rankTitle}</td>
                    <td className="p-3.5">
                      {u.isSuspended ? (
                        <span className="text-rose-600 font-bold">موقوف</span>
                      ) : (
                        <span className="text-emerald-600 font-bold">نشط وموثق</span>
                      )}
                    </td>
                    <td className="p-3.5 text-center space-x-2">
                      {u.role !== 'admin' && (
                        <>
                          <button
                            onClick={() => handleChangeRole(u.id, u.role === 'teacher' ? 'student' : 'teacher')}
                            className="px-2.5 py-1 rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold text-[11px] cursor-pointer"
                          >
                            {u.role === 'teacher' ? 'سحب صلاحية معلم' : 'منح دور معلم'}
                          </button>

                          <button
                            onClick={() => handleToggleSuspend(u.id)}
                            className="px-2.5 py-1 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-[11px] cursor-pointer"
                          >
                            {u.isSuspended ? 'إلغاء الإيقاف' : 'إيقاف الحساب'}
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 4: AUDIT LOGS ================= */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden text-right">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-[#1F3A4A]">سجل التدقيق والتغييرات (Audit Trail)</h3>
            <p className="text-xs text-slate-400">توثيق زمني غير قابل للتعديل لجميع عمليات الإضافة والتعديل والحذف</p>
          </div>

          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 space-y-1 hover:bg-slate-50/50">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#1F3A4A]">{log.adminNickname} ({log.adminEmail})</span>
                  <span className="font-mono text-slate-400 text-[11px]">{new Date(log.timestamp).toLocaleString('ar-SA')}</span>
                </div>
                <p className="text-xs text-slate-600">{log.details}</p>
                <div className="text-[10px] font-mono text-slate-400">إجراء: {log.action}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 5: SETTINGS ================= */}
      {activeTab === 'settings' && settingsData && (
        <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-100 shadow-xs text-right space-y-6">
          <div>
            <h2 className="text-lg font-bold text-[#1F3A4A]">ضبط قيم XP وعتبات الرتب العلمية</h2>
            <p className="text-xs text-slate-500 mt-1">تحديد المكافآت الممنوحة للطلاب عند حل الاختبارات</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">XP الإجابة الصحيحة:</label>
              <input
                type="number"
                value={settingsData.xpValues.correct}
                onChange={(e) => setSettingsData({ ...settingsData, xpValues: { ...settingsData.xpValues, correct: parseInt(e.target.value, 10) } })}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">XP إكمال الاختبار:</label>
              <input
                type="number"
                value={settingsData.xpValues.completeQuiz}
                onChange={(e) => setSettingsData({ ...settingsData, xpValues: { ...settingsData.xpValues, completeQuiz: parseInt(e.target.value, 10) } })}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">XP العلامة الكاملة:</label>
              <input
                type="number"
                value={settingsData.xpValues.perfectScore}
                onChange={(e) => setSettingsData({ ...settingsData, xpValues: { ...settingsData.xpValues, perfectScore: parseInt(e.target.value, 10) } })}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={async () => {
              await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(settingsData)
              });
              alert('تم حفظ إعدادات XP بنجاح!');
            }}
            className="py-2.5 px-6 rounded-xl bg-[#2EC4C6] text-white text-xs font-bold hover:bg-[#2EC4C6]/90 cursor-pointer shadow-xs"
          >
            حفظ إعدادات المنصة
          </button>
        </div>
      )}

      {/* ================= EDIT / CREATE MODAL ================= */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs select-none">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-200 text-right space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-[#1F3A4A]">
              {isNewQuestion ? 'إضافة سؤال جديد' : `تعديل السؤال [${editingQuestion.id}]`}
            </h3>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">نص السؤال:</label>
                <textarea
                  rows={3}
                  required
                  value={editingQuestion.text}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, text: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2EC4C6]"
                />
              </div>

              {/* 4 Options */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">الخيارات الأربعة (حدد الإجابة الصحيحة بالدائرة):</label>
                {(editingQuestion.options || ['', '', '', '']).map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctChoice"
                      checked={editingQuestion.correctAnswer === i}
                      onChange={() => setEditingQuestion({ ...editingQuestion, correctAnswer: i })}
                      className="cursor-pointer"
                    />
                    <input
                      type="text"
                      required
                      placeholder={`الخيار ${['أ', 'ب', 'ج', 'د'][i]}`}
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...(editingQuestion.options || [])];
                        newOpts[i] = e.target.value;
                        setEditingQuestion({ ...editingQuestion, options: newOpts as any });
                      }}
                      className="flex-1 p-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#2EC4C6]"
                    />
                  </div>
                ))}
              </div>

              {/* Category & Difficulty */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">القسم:</label>
                  <select
                    value={editingQuestion.category}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, category: e.target.value as any })}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs"
                  >
                    <option value="bio1">أحياء 1</option>
                    <option value="bio2">أحياء 2</option>
                    <option value="ecology">علم البيئة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">الوحدة / الموضوع:</label>
                  <input
                    type="text"
                    required
                    value={editingQuestion.unit}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, unit: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">الصعوبة:</label>
                  <select
                    value={editingQuestion.difficulty}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, difficulty: e.target.value as any })}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs"
                  >
                    <option value="easy">سهل</option>
                    <option value="medium">متوسط</option>
                    <option value="hard">صعب</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">النوع:</label>
                  <select
                    value={editingQuestion.type}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, type: e.target.value as any })}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs"
                  >
                    <option value="tahsili">التحصيلي</option>
                    <option value="post_unit">ما بعد الوحدة</option>
                    <option value="daily">سؤال اليوم</option>
                    <option value="secret_lab">المختبر السري</option>
                  </select>
                </div>
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">الشرح العلمي للإجابة:</label>
                <textarea
                  rows={2}
                  value={editingQuestion.explanation}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2EC4C6]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2EC4C6] hover:bg-[#2EC4C6]/90 text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  حفظ التغييرات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= STUDENT PREVIEW MODAL ================= */}
      {previewQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs select-none">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-xl border border-slate-200 text-right space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-[#2EC4C6]">معاينة السؤال كما يظهر للطالب</span>
              <button
                onClick={() => setPreviewQuestion(null)}
                className="text-xs text-slate-400 hover:text-slate-700"
              >
                إغلاق
              </button>
            </div>

            <div className="text-[11px] text-slate-400">
              {previewQuestion.categoryLabel} · {previewQuestion.unit}
            </div>

            <h3 className="text-base font-bold text-[#1F3A4A]">
              {previewQuestion.text}
            </h3>

            <div className="space-y-2">
              {previewQuestion.options.map((opt, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                    previewQuestion.correctAnswer === i
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-900 font-bold'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  <span>{opt}</span>
                  {previewQuestion.correctAnswer === i && (
                    <span className="text-[10px] text-emerald-700 font-bold">✓ الإجابة المحددة بالبنك</span>
                  )}
                </div>
              ))}
            </div>

            {previewQuestion.explanation && (
              <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-600 border border-slate-100">
                <span className="font-bold text-[#2EC4C6] block">🧬 الشرح:</span>
                {previewQuestion.explanation}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
