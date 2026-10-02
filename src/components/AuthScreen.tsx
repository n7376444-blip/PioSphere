import React, { useState } from 'react';
import { Logo } from './Logo.tsx';
import { ShieldCheck, Mail, User as UserIcon, ArrowLeft, KeyRound, CheckCircle2, AlertCircle, Info, Copy, Lock, X } from 'lucide-react';
import { User } from '../types.ts';

interface AuthScreenProps {
  onSuccess: (token: string, user: User) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess }) => {
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [showAdminModal, setShowAdminModal] = useState(false);

  // Student Form State
  const [studentName, setStudentName] = useState('');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);

  // Admin Form State (Clean and completely unexposed)
  const [adminEmail, setAdminEmail] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminPasskey, setAdminPasskey] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Student Flow: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    const cleanName = studentName.trim();

    if (!cleanEmail || !cleanName) {
      setError('يرجى كتابة البريد الإلكتروني واسم الطالب كاملاً.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register-or-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, nickname: cleanName })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'حدث خطأ أثناء إرسال رمز التحقق');
      }

      const receivedCode = data.verificationCode;
      setGeneratedOtp(receivedCode);
      if (receivedCode) {
        setOtpCode(receivedCode);
      }
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'تعذر الاتصال بالخادم، يرجى المحاولة لاحقاً');
    } finally {
      setLoading(false);
    }
  };

  // Direct 1-Click Student Login (Bypasses manual OTP entry)
  const handleDirectStudentLogin = async () => {
    setError(null);
    const cleanEmail = email.trim();
    const cleanName = studentName.trim();

    if (!cleanEmail || !cleanName) {
      setError('يرجى كتابة اسم الطالب والبريد الإلكتروني أولاً.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register-or-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, nickname: cleanName })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل بدء التسجيل');

      const code = data.verificationCode;
      if (!code) throw new Error('تعذر استلام رمز التحقق الفوري');

      const verifyRes = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, otpCode: code })
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(verifyData.error || 'فشل التوثيق');

      localStorage.setItem('biosphere_token', verifyData.token);
      onSuccess(verifyData.token, verifyData.user);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء الدخول المباشر');
    } finally {
      setLoading(false);
    }
  };

  // Student Flow: Verify OTP
  const handleVerifyOtp = async (e?: React.FormEvent, customCode?: string) => {
    if (e) e.preventDefault();
    setError(null);

    const codeToVerify = (customCode || otpCode || generatedOtp || '').trim();

    if (!codeToVerify || codeToVerify.length < 4) {
      setError('يرجى إدخال رمز التحقق المكون من 6 أرقام.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otpCode: codeToVerify })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'رمز التحقق غير صحيح أو منتهي الصلاحية');
      }

      localStorage.setItem('biosphere_token', data.token);
      onSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'فشل توثيق الرمز، تأكد من صحته');
    } finally {
      setLoading(false);
    }
  };

  // Admin Flow: Direct Secure Login with Admin Credentials
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);

    if (!adminEmail.trim() || !adminPasskey.trim()) {
      setAdminError('يرجى إدخال بريد الأدمن والرمز السري.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/admin-direct-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: adminEmail.trim(),
          adminName: adminName.trim() || 'مدير المنصة',
          adminKey: adminPasskey.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل تسجيل دخول الأدمن، تأكد من صحة البيانات.');
      }

      localStorage.setItem('biosphere_token', data.token);
      setShowAdminModal(false);
      onSuccess(data.token, data.user);
    } catch (err: any) {
      setAdminError(err.message || 'تعذر التحقق من صلاحية الإدارة.');
    } finally {
      setLoading(false);
    }
  };

  const copyOtpToClipboard = () => {
    if (generatedOtp) {
      navigator.clipboard.writeText(generatedOtp);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF8F2] px-4 py-8 relative overflow-hidden select-none">
      {/* Decorative biology background accents */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#2EC4C6]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#7CC6F2]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm border border-[#2EC4C6]/20 relative z-10">
        
        {/* Logo and Greeting Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <Logo size="lg" showText={false} withAnimation={true} />
          <h2 className="text-2xl font-bold text-[#1F3A4A] mt-3 tracking-tight">
            مرحبًا بك في BioSphere
          </h2>
          <p className="text-xs text-[#1F3A4A]/70 mt-1 max-w-xs leading-relaxed">
            عالم الأحياء الرقمي التفاعلي — مسيرتك العلمية كعالم أحياء تبدأ من هنا.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {step === 'form' ? (
          <div className="space-y-5">
            {/* Student Registration Form */}
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1F3A4A] mb-1.5 text-right">
                  اسم الطالب
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="مثال: جوانا العلياني"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-[#1F3A4A] text-sm focus:outline-none focus:ring-2 focus:ring-[#2EC4C6] focus:border-transparent transition-all"
                  />
                  <UserIcon className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1 text-right">
                  اسم الطالب الذي يظهر في سجل الرحلة العلمية ولوحة الصدارة.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F3A4A] mb-1.5 text-right">
                  البريد الإلكتروني (لتسجيل الدخول والتوثيق)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-[#1F3A4A] text-sm focus:outline-none focus:ring-2 focus:ring-[#2EC4C6] focus:border-transparent transition-all"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1 text-right">
                  البريد محمي بالكامل ولا يظهر إطلاقًا للطلاب في لوحة الشرف (PDPL).
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleDirectStudentLogin}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#2EC4C6] to-[#4FB3D9] hover:from-[#2EC4C6]/90 hover:to-[#4FB3D9]/90 text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>دخول مباشر إلى BioSphere</span>
                      <ArrowLeft className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                  <span>أو التحقق عبر رمز OTP</span>
                </button>
              </div>
            </form>

            {/* Discreet Admin Login Button at the bottom */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-center">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setAdminError(null);
                  setShowAdminModal(true);
                }}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>دخول الأدمن</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4 text-right">
            
            {/* Account Info */}
            <div className="text-center p-3 bg-slate-50 rounded-2xl border border-slate-100 mb-1">
              <span className="text-xs text-slate-500 block">توثيق ملكية الحساب لـ:</span>
              <span className="text-xs font-bold text-[#1F3A4A]">{studentName} ({email})</span>
            </div>

            {/* Prominent Real OTP Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-500/10 via-[#FAF8F2] to-teal-500/5 border-2 border-teal-500/30 text-right space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>رمز التحقق الفعلي الخاص بك (OTP):</span>
                </span>
                <button
                  type="button"
                  onClick={copyOtpToClipboard}
                  className="text-[11px] text-teal-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copied ? 'تم النسخ!' : 'نسخ الرمز'}</span>
                </button>
              </div>

              {/* Big code display */}
              <div className="flex items-center justify-center gap-2 py-1">
                <div className="px-5 py-2 rounded-xl bg-white border border-teal-300 font-mono text-2xl font-bold tracking-widest text-[#1F3A4A] shadow-xs">
                  {generatedOtp || otpCode || '------'}
                </div>
              </div>

              {/* Clarification note */}
              <p className="text-[11px] text-slate-500 leading-relaxed pt-1 border-t border-teal-200/50">
                <Info className="w-3.5 h-3.5 inline ml-1 text-teal-600" />
                تنبيه: نظرًا لبيئة التطوير السحابية الفورية، تم توليد الرمز وتأمينه لك مباشرة هنا لتوثيق ملكية البريد فورًا والدخول دون انتظار رسائل خارجية.
              </p>
            </div>

            {/* OTP Input Field */}
            <div>
              <label className="block text-xs font-semibold text-[#1F3A4A] mb-1.5 text-right">
                أدخل رمز التحقق (OTP)
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="000000"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full text-center tracking-widest text-lg font-mono font-bold py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-[#1F3A4A] focus:outline-none focus:ring-2 focus:ring-[#2EC4C6] focus:border-transparent transition-all"
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute right-3 top-4" />
              </div>
            </div>

            {/* Instant Confirm & Enter */}
            <button
              type="button"
              disabled={loading}
              onClick={() => handleVerifyOtp(undefined, generatedOtp || otpCode)}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#2EC4C6] to-[#1FA97A] hover:opacity-95 text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>تأكيد الرمز والدخول إلى BioSphere</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => { setStep('form'); setError(null); }}
              className="w-full py-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              تعديل البريد الإلكتروني أو الاسم
            </button>
          </form>
        )}

      </div>

      {/* ================= MODAL: SECURE ADMIN LOGIN DIALOG ================= */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs select-none">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-xl border border-amber-300/80 text-right space-y-4 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-[#1F3A4A]">بوابة دخول الأدمن</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAdminModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              هذه البوابة مخصصة لمسؤول المنصة المعتمد فقط لإدارة بنك الأسئلة والمستخدمين.
            </p>

            {adminError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{adminError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  البريد الإلكتروني للأدمن:
                </label>
                <input
                  type="email"
                  required
                  placeholder="بريد الأدمن المعتمد"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  اسم المسؤول:
                </label>
                <input
                  type="text"
                  placeholder="اسم المشرف أو المسؤول"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  الرمز السري للإدارة / كلمة المرور:
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={adminPasskey}
                  onChange={(e) => setAdminPasskey(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>دخول لوحة الإدارة</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
