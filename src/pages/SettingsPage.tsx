import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Moon, Volume2, Shield, Eye, Check } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 select-none text-right">
      
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-[#1F3A4A] tracking-tight">
          إعدادات المنصة والتجربة ⚙️
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          تخصيص تجربة التعلّم وسهولة الاستخدام.
        </p>
      </div>

      {savedNotice && (
        <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-teal-600" />
          <span>تم حفظ تفضيلاتك بنجاح!</span>
        </div>
      )}

      {/* Preferences List */}
      <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-100 shadow-xs space-y-6">
        
        {/* Sound Effects */}
        <div className="flex items-center justify-between py-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-[#1F3A4A]">المؤثرات الصوتية للأوسمة</h3>
            <p className="text-xs text-slate-500">تشغيل نغمات احتفالية لطيفة عند الترقية أو فتح إنجاز جديد</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2EC4C6]"></div>
          </label>
        </div>

        {/* Reduced Motion Toggle */}
        <div className="flex items-center justify-between py-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-[#1F3A4A]">تقليل الحركات البصرية (Reduced Motion)</h3>
            <p className="text-xs text-slate-500">إيقاف دوران حلزون DNA وجزيئات الخلفية لتحسين الأداء وراحة العين</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={(e) => setReducedMotion(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2EC4C6]"></div>
          </label>
        </div>

        {/* Theme Specification note */}
        <div className="py-2 border-b border-slate-100">
          <h3 className="text-sm font-bold text-[#1F3A4A]">السمة البصرية للمنصة</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            المنصة تعتمد حصريًا سمة الشعار الرسمية الفاتحة (الأبيض، الكريمي، الفيروزي، والسماوي) لضمان راحة القراءة والوضوح التام للرسومات البيولوجية.
          </p>
        </div>

        {/* Save Button */}
        <div className="pt-2">
          <button
            onClick={handleSave}
            className="py-2.5 px-6 rounded-xl bg-[#2EC4C6] hover:bg-[#2EC4C6]/90 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            حفظ التفضيلات
          </button>
        </div>

      </div>

    </div>
  );
};
