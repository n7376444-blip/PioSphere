import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, User as UserIcon, AlertCircle, ShieldAlert } from 'lucide-react';
import { User } from '../types.ts';

interface BioBotPageProps {
  user: User;
}

interface Message {
  role: 'user' | 'bot';
  content: string;
}

export const BioBotPage: React.FC<BioBotPageProps> = ({ user }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      content: `أهلاً بك يا ${user.nickname} (${user.rankTitle}) في مختبر الاستفسارات العلمية! أنا "المرشد الحيوي" (BioBot) 🤖🧬.\nأنا مستعد ومتحمس لتلقي أي سؤال أحيائي يراودك، شرح المفاهيم المعقدة، حل وتفسير أسئلة التحصيلي، وتوضيح أسباب الإجابات الصحيحة والخاطئة بصدق ودقة علمية تامة. ما هو سؤالك اليوم؟`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const token = localStorage.getItem('biosphere_token');

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickPrompts = [
    'سؤال تحصيلي: ما وظيفة النفرون في الكلية وكيف يعيد الامتصاص؟',
    'اشرح لي كيف نميز بين بدائيات وحقيقيات النوى علمياً؟',
    'ما هي آلية تضاعف حلزون DNA وتكوين الروابط الهيدروجينية؟',
    'ما الفرق البيئي الدقيق بين التعاقب الأولي والتعاقب الثانوي؟',
    'لماذا يمتلك قلب الطيور والثدييات 4 حجرات بدلاً من 3؟'
  ];

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    setInput('');
    const newHistory: Message[] = [...messages, { role: 'user', content: query }];
    setMessages(newHistory);
    setLoading(true);

    try {
      const res = await fetch('/api/biobot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: query,
          conversationHistory: newHistory.slice(-6)
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'تعذر التواصل مع المرشد الحيوي حالياً.');
      }

      setMessages((prev) => [...prev, { role: 'bot', content: data.reply }]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          content: err.message || 'عذراً يا باحثنا، حدث خلل بسيط أثناء معالجة السؤال، يرجى المحاولة لاحقاً.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-12 select-none">
      
      {/* Header */}
      <div className="p-5 rounded-3xl bg-white border border-[#2EC4C6]/20 shadow-xs flex items-center justify-between text-right">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#2EC4C6]/15 to-[#7CC6F2]/20 border border-[#2EC4C6]/30 flex items-center justify-center text-2xl shadow-2xs glow-breathing">
            🤖
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-[#1F3A4A] flex items-center gap-2">
              <span>المرشد الحيوي (BioBot)</span>
              <span className="text-[10px] font-semibold bg-[#2EC4C6]/10 text-[#2EC4C6] px-2 py-0.5 rounded-full">
                متصل
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              مدرّس ومرشد أحياء افتراضي مدعوم بالذكاء الاصطناعي — مخصص لمنهج الثانوية والتحصيلي.
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="bg-white rounded-3xl border border-slate-100 p-4 md:p-6 shadow-xs min-h-[420px] max-h-[520px] overflow-y-auto space-y-4 flex flex-col">
        {messages.map((m, idx) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={idx}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse self-start' : 'self-end'} max-w-[85%]`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 shadow-2xs ${
                isUser ? 'bg-slate-900 text-white' : 'bg-[#2EC4C6]/15 text-[#2EC4C6] border border-[#2EC4C6]/30'
              }`}>
                {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line text-right ${
                isUser
                  ? 'bg-slate-900 text-white rounded-tr-none'
                  : 'bg-[#FAF8F2] border border-slate-200/80 text-[#1F3A4A] rounded-tl-none'
              }`}>
                {m.content}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 self-end p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-3.5 h-3.5 border-2 border-[#2EC4C6]/30 border-t-[#2EC4C6] rounded-full animate-spin" />
            <span>المرشد الحيوي يحلل السؤال ويبسط المفهوم...</span>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Suggested Quick Biology Prompts */}
      <div className="space-y-1.5 text-right">
        <span className="text-[11px] font-semibold text-slate-400 block px-1">
          أسئلة تحصيلية شائعة يمكنك النقر عليها:
        </span>
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(p)}
              className="text-xs px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-[#2EC4C6] hover:bg-[#2EC4C6]/5 text-slate-700 transition-colors text-right cursor-pointer"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Input Field */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="relative"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="اسأل المرشد عن أي مفهوم في الأحياء، الخلية، الوراثة، أو التحصيلي..."
          disabled={loading}
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-xs sm:text-sm text-[#1F3A4A] focus:outline-none focus:ring-2 focus:ring-[#2EC4C6] focus:border-transparent transition-all shadow-xs"
        />

        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="absolute left-2 top-2 p-2 rounded-xl bg-[#2EC4C6] hover:bg-[#2EC4C6]/90 text-white transition-colors cursor-pointer disabled:opacity-40"
          aria-label="إرسال"
        >
          <Send className="w-4 h-4 rotate-180" />
        </button>
      </form>

      {/* Integrity lock notice */}
      <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
        <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
        <span>ملاحظة أمان: يُعطل المرشد تلقائيًا أثناء الاختبارات لضمان النزاهة والاعتماد على النفس.</span>
      </p>

    </div>
  );
};
