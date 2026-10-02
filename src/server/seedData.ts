/**
 * BioSphere High School Biology Question Bank Seed Data
 * Curated for Saudi Secondary School Curriculum:
 * - أحياء 1 (Biology 1)
 * - أحياء 2 (Biology 2)
 * - علم البيئة (Ecology)
 *
 * Options and correct answers are naturally distributed across 0 (أ), 1 (ب), 2 (ج), 3 (د).
 */

export interface Question {
  id: string;
  text: string;
  options: [string, string, string, string];
  correctAnswer: number; // 0 (أ), 1 (ب), 2 (ج), 3 (د)
  explanation: string;
  category: 'bio1' | 'bio2' | 'ecology';
  categoryLabel: string;
  unit: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'tahsili' | 'post_unit' | 'daily' | 'secret_lab';
  status: 'published' | 'draft';
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
  stats: {
    timesAnswered: number;
    timesCorrect: number;
    avgTimeSeconds: number;
  };
}

export const initialQuestions: Question[] = [
  // --- أحياء 1 (Biology 1) ---
  {
    id: "q-bio1-01",
    text: "أي التراكيب التالية توجد في خلايا بدائيات النوى والخلايا حقيقية النوى على حد سواء؟",
    options: ["الميتوكندريا والنواة", "البلاستيدات الخضراء والغلاف النووي", "الغشاء البلازمي والريبوسومات", "الشبكة الإندوبلازمية وجهاز جولجي"],
    correctAnswer: 2, // ج
    explanation: "كلا النوعين من الخلايا يمتلكان غشاءً بلازمياً يفصل محتويات الخلية عن البيئة الخارجية، وريبوسومات مسؤولة عن تصنيع البروتين، بينما تفتقر بدائيات النوى للعضيات المحاطة بأغشية.",
    category: "bio1",
    categoryLabel: "أحياء 1",
    unit: "تركيب الخلية ووظائفها",
    difficulty: "easy",
    type: "tahsili",
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: { timesAnswered: 48, timesCorrect: 42, avgTimeSeconds: 14 }
  },
  {
    id: "q-bio1-02",
    text: "تسمى المادة الكيميائية التي تفرزها الطحالب وتُستخدم في صناعة معاجين الأسنان وهلام الحلوى:",
    options: ["السيليكا", "الألجين والأجار", "البكتين الحيواني", "الكايتين"],
    correctAnswer: 1, // ب
    explanation: "تنتج الطحالب الحمراء مادة الأجار، والطحالب البنية مادة الألجين، وتُستخدمان كعوامل تثبيت وتكثيف في المنتجات الغذائية والصناعية.",
    category: "bio1",
    categoryLabel: "أحياء 1",
    unit: "الطلائعيات والفطريات",
    difficulty: "medium",
    type: "tahsili",
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: { timesAnswered: 35, timesCorrect: 26, avgTimeSeconds: 21 }
  },
  {
    id: "q-bio1-03",
    text: "أي مما يلي يُعد المكون الأساسي لجدار الخلية في الفطريات؟",
    options: ["السيليلوز", "الببتيدوجلايكان", "اللجنين", "الكايتين"],
    correctAnswer: 3, // د
    explanation: "يتكون الجدار الخلوي للفطريات من مركب الكايتين (مركب سكري معقد)، على عكس جدار الخلايا النباتية المكون من السيليلوز.",
    category: "bio1",
    categoryLabel: "أحياء 1",
    unit: "الفطريات",
    difficulty: "easy",
    type: "tahsili",
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: { timesAnswered: 52, timesCorrect: 47, avgTimeSeconds: 11 }
  },
  {
    id: "q-bio1-04",
    text: "عند فحص كائن دقيق وُجد أنه يتكون من مادة وراثية DNA أو RNA محاطة بغلاف بروتيني ولا يستطيع التكاثر ذاتياً، هذا الكائن يصنف ضمن:",
    options: ["الفيروسات", "البكتيريا الحقيقية", "الأوليات الحيوانية", "البدائيات"],
    correctAnswer: 0, // أ
    explanation: "الفيروسات ليست كائنات حية خلوية، بل جزيئات تتكون من حمض نووي ومحفظة بروتينية، وتتطفل إجبارياً على خلايا العائل للتضاعف.",
    category: "bio1",
    categoryLabel: "أحياء 1",
    unit: "الفيروسات والبكتيريا",
    difficulty: "easy",
    type: "tahsili",
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: { timesAnswered: 60, timesCorrect: 56, avgTimeSeconds: 12 }
  },
  {
    id: "q-bio1-05",
    text: "ما نوع التناظر في حيوان نجم البحر البالغ مقارنة بيرقته؟",
    options: ["جانبي في البالغ، وشعاعي في اليرقة", "شعاعي في البالغ، وجانبي في اليرقة", "عديم التناظر في البالغ، وجانبي في اليرقة", "شعاعي في كلتا المرحلتين"],
    correctAnswer: 1, // ب
    explanation: "شوكيات الجلد (مثل نجم البحر) تتميز بتناظر جانبي في طور اليرقة، ويتحول إلى تناظر شعاعي خماسي في الطور البالغ.",
    category: "bio1",
    categoryLabel: "أحياء 1",
    unit: "اللافقاريات وشوكيات الجلد",
    difficulty: "hard",
    type: "tahsili",
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: { timesAnswered: 39, timesCorrect: 22, avgTimeSeconds: 27 }
  },
  {
    id: "q-bio1-06",
    text: "العضو المسؤول عن الإخراج في الديدان المفلطحة مثل البلاناريا هو:",
    options: ["أنابيب ملبيجي", "النفريديا", "الخلايا اللهبية", "الكليتان"],
    correctAnswer: 2, // ج
    explanation: "الخلايا اللهبية (Flame cells) هي وحدات إخراجية ذات أهداب تتحرك كشعلة لهب لطرد الفضلات والماء الزائد خارج جسم الدودة المفلطحة.",
    category: "bio1",
    categoryLabel: "أحياء 1",
    unit: "الديدان والرخويات",
    difficulty: "medium",
    type: "post_unit",
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: { timesAnswered: 41, timesCorrect: 31, avgTimeSeconds: 18 }
  },
  {
    id: "q-bio1-07",
    text: "أي من الطوائف التالية للمفصليات تمتلك خمسة أزواج من الأرجل وقرني استشعار؟",
    options: ["الحشرات", "العنكبيات", "متعددة الأرجل", "القشريات"],
    correctAnswer: 3, // د
    explanation: "القشريات مثل الروبيان وجراد البحر تمتلك زوجين من قرون الاستشعار (أربعة مجسات) وخمسة أزواج من الأرجل.",
    category: "bio1",
    categoryLabel: "أحياء 1",
    unit: "المفصليات",
    difficulty: "medium",
    type: "post_unit",
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: { timesAnswered: 32, timesCorrect: 24, avgTimeSeconds: 19 }
  },
  {
    id: "q-bio1-08",
    text: "سؤال التحدي المخبري: كائن حي مجهري يمتلك بقعة عينية، وبلاستيدات خضراء، وسوطاً للحركة، ولكنه يلتهم الغذاء في الظلام، يصنف كـ:",
    options: ["البراميسيوم", "اليوجلينا (طلائعيات شبيهة بالنبات والحيوان)", "الأميبا", "فطر عفن الخبز"],
    correctAnswer: 1, // ب
    explanation: "اليوجلينا تجمع بين خصائص التغذية الذاتية (بناء ضوئي بالبلاستيدات) وغير الذاتية (الالتهام في غياب الضوء)، وتتحرك بالسوط.",
    category: "bio1",
    categoryLabel: "أحياء 1",
    unit: "الطلائعيات",
    difficulty: "medium",
    type: "secret_lab",
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: { timesAnswered: 28, timesCorrect: 22, avgTimeSeconds: 20 }
  },
  {
    id: "q-bio1-09",
    text: "ما نوع الرابطة التي تربط القواعد النيتروجينية المكملة في جزيء الـ DNA المزدوج؟",
    options: ["روابط ببتيدية", "روابط أيونية", "روابط هيدروجينية", "روابط تساهمية قوية فقط"],
    correctAnswer: 2, // ج
    explanation: "ترتبط القواعد النيتروجينية المتقابلة (A مع T برابطتين، و C مع G بثلاث روابط) بروابط هيدروجينية تمنح الحلزون ثباتاً وسهولة في فك الالتفاف أثناء التضاعف.",
    category: "bio1",
    categoryLabel: "أحياء 1",
    unit: "الجزيئات الحيوية والوراثة",
    difficulty: "easy",
    type: "daily",
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: { timesAnswered: 74, timesCorrect: 65, avgTimeSeconds: 15 }
  },
  {
    id: "q-bio1-10",
    text: "التارديغريد (دب الماء) الشهير بقدرته الخارقة على البقاء يدخل في حالة سبات عميق تسمى:",
    options: ["انعدام الحياة الظاهري (Cryptobiosis)", "التحول الشكلي", "الاستنساخ الذاتي", "التبرعم المعلق"],
    correctAnswer: 0, // أ
    explanation: "يدخل التارديغريد في حالة Cryptobiosis حيث ينخفض معدل الأيض إلى أقل من 0.01% ويفقد 99% من مائه، مما يمكنه من تحمل الفضاء والإشعاع والتجمد.",
    category: "bio1",
    categoryLabel: "أحياء 1",
    unit: "التكيف والتنوع الحيوي",
    difficulty: "hard",
    type: "secret_lab",
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: { timesAnswered: 22, timesCorrect: 12, avgTimeSeconds: 24 }
  },

  // --- أحياء 2 (Biology 2) ---
  {
    id: "q-bio2-01",
    text: "أي من المخلوقات الحية التالية يمتلك قلباً يتكون من ثلاث حجرات (أذينان وبطين واحد غير مكتمل الفصل جزئياً)؟",
    options: ["الأسماك العظمية", "الضفدع ومعظم الزواحف", "الطيور والثدييات", "التمساحيات فقط"],
    correctAnswer: 1, // ب
    explanation: "تمتلك البرمائيات والزواحف (عدا التمساحيات التي تمتلك 4 حجرات) قلباً ثلاثي الحجرات، بينما الأسماك حجرتان، والطيور والثدييات أربع حجرات كاملة.",
    category: "bio2",
    categoryLabel: "أحياء 2",
    unit: "الفقاريات وأجهزة الدوران",
    difficulty: "medium",
    type: "tahsili",
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: { timesAnswered: 55, timesCorrect: 41, avgTimeSeconds: 17 }
  },
  {
    id: "q-bio2-02",
    text: "ما الدور الأساسي لمادة الميالين (الغمد الميليني) المغلفة للمحاور العصبية؟",
    options: ["توليد الطاقة العصبية ATP", "حماية النواة العصبية", "زيادة سرعة انتقال السيال العصبي", "إفراز النواقل الكيميائية"],
    correctAnswer: 2, // ج
    explanation: "يعمل الغمد المياليني كعازل كهربائي يسمح بانتقال السيال العصبي عبر التوصيل القفزي بين عقد رانفييه، مما يضاعف سرعة السيال العصبي.",
    category: "bio2",
    categoryLabel: "أحياء 2",
    unit: "الجهاز العصبي",
    difficulty: "easy",
    type: "tahsili",
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: { timesAnswered: 63, timesCorrect: 58, avgTimeSeconds: 13 }
  },
  {
    id: "q-bio2-03",
    text: "أي الهرمونات التالية يفرزه البنكرياس لتحفيز الكبد على تحويل الجليكوجين المخزن إلى جلوكوز عند انخفاض السكر في الدم؟",
    options: ["الإنسولين", "الثايروكسين", "الأدرينالين", "الجلوكاجون"],
    correctAnswer: 3, // د
    explanation: "يفرز هرمون الجلوكاجون من خلايا ألفا في البنكرياس لرفع سكر الدم بتحطيم الجليكوجين، بينما يفرز الإنسولين لخفضه.",
    category: "bio2",
    categoryLabel: "أحياء 2",
    unit: "جهاز الغدد الصماء",
    difficulty: "medium",
    type: "tahsili",
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: { timesAnswered: 49, timesCorrect: 38, avgTimeSeconds: 19 }
  },
  {
    id: "q-bio2-04",
    text: "الوحدة الوظيفية المسؤولة عن ترشيح وتنقية الدم وإعادة الامتصاص في الكلية تسمى:",
    options: ["الحويصلة الهوائية", "النفرون (الكليون)", "الخملة المعوية", "العقدة اللمفاوية"],
    correctAnswer: 1, // ب
    explanation: "يحتوي كل كلية بشرية على نحو مليون نفرون (Nephron)، وهو الوحدة الأنبوبية المجهرية المسؤولة عن الترشيح وإعادة الامتصاص والإفراز.",
    category: "bio2",
    categoryLabel: "أحياء 2",
    unit: "الجهاز الإخراجي",
    difficulty: "easy",
    type: "tahsili",
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: { timesAnswered: 71, timesCorrect: 66, avgTimeSeconds: 10 }
  },
  {
    id: "q-bio2-05",
    text: "أي أنواع العضلات التالية تُصنف بأنها مخططة ولاإرادية في آن واحد؟",
    options: ["عضلة القلب", "عضلات جدار المعدة والأمعاء", "العضلة ذات الرأسين في الذراع", "عضلات جدران الأوعية الدموية"],
    correctAnswer: 0, // أ
    explanation: "عضلة القلب مخططة مجهرياً (بها خطوط وأقراص بينية) ولكنها لا إرادية الحركة تخضع للتحكم الذاتي والعصبي الذاتي.",
    category: "bio2",
    categoryLabel: "أحياء 2",
    unit: "الجهاز العضلي والهيكلي",
    difficulty: "easy",
    type: "post_unit",
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: { timesAnswered: 58, timesCorrect: 50, avgTimeSeconds: 14 }
  },
  {
    id: "q-bio2-06",
    text: "الخلايا المناعية المتخصصة بإنتاج الأجسام المضادة النوعية بعد تمايزها تسمى:",
    options: ["الخلايا التائية القاتلة", "الخلايا الصارية", "الخلايا البائية البلازمية", "الكريات الحمراء"],
    correctAnswer: 2, // ج
    explanation: "تتمايز الخلايا اللمفية البائية (B cells) بعد تنشيطها إلى خلايا بلازمية تُنتج آلاف الأجسام المضادة النوعية لمستضد معين في الثانية.",
    category: "bio2",
    categoryLabel: "أحياء 2",
    unit: "جهاز المناعة",
    difficulty: "medium",
    type: "tahsili",
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: { timesAnswered: 44, timesCorrect: 33, avgTimeSeconds: 18 }
  },
  {
    id: "q-bio2-07",
    text: "أي من الخصائص التالية تميز الثدييات الأولية (مثل منقار البط وآكل النمل الشوكي) عن بقية الثدييات؟",
    options: ["تلد صغاراً غير مكتملي النمو في جراب", "تمتلك مشيمة حقيقية تغذي الجنين", "تفتقر للغدد اللبنية تماماً", "تتكاثر بوضع البيض وترضع صغارها"],
    correctAnswer: 3, // د
    explanation: "الثدييات الأولية تبيض كالأباهل والزواحف، لكنها تفرز الحليب عبر مسامات جلدية أو غدد ثديية لترضع صغارها بعد الفقس.",
    category: "bio2",
    categoryLabel: "أحياء 2",
    unit: "الثدييات والطيور",
    difficulty: "medium",
    type: "post_unit",
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: { timesAnswered: 37, timesCorrect: 27, avgTimeSeconds: 22 }
  },
  {
    id: "q-bio2-08",
    text: "في التنفس الخلوي، تحدث مرحلة حلقة كريبس وسلسلة نقل الإلكترون داخل:",
    options: ["الميتوكندريا", "السيتوسول فقط", "النواة", "أجسام جولجي"],
    correctAnswer: 0, // أ
    explanation: "يحدث التحلل السكري في السيتوسول، بينما تنتقل النواتج إلى مصفوفة وغشاء الميتوكندريا لإكمال حلقة كريبس وسلسلة نقل الإلكترون وإنتاج معظم جزيئات ATP.",
    category: "bio2",
    categoryLabel: "أحياء 2",
    unit: "الطاقة الخلوية والتنفس",
    difficulty: "easy",
    type: "daily",
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: { timesAnswered: 67, timesCorrect: 59, avgTimeSeconds: 13 }
  },
  {
    id: "q-bio2-09",
    text: "ما الدور الحيوي لقنديل البحر في دراسات البيولوجيا الجزيئية الحديثة والحاصلة على جائزة نوبل؟",
    options: ["استخراج سم لعلاج الملاريا", "عزل البروتين الفلوري الأخضر (GFP) كمسبار جزيئي للخلايا", "إنتاج الببتيدات المضادة للتخثر", "تكوين الألياف الضوئية العصبية"],
    correctAnswer: 1, // ب
    explanation: "استُخلص بروتين الأخضر المشع (GFP) من قنديل البحر Aequorea victoria، وأحدث ثورة في تصوير البروتينات والجينات داخل الخلايا الحية.",
    category: "bio2",
    categoryLabel: "أحياء 2",
    unit: "التنوع الحيوي والتقنية الحيوية",
    difficulty: "hard",
    type: "secret_lab",
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: { timesAnswered: 29, timesCorrect: 17, avgTimeSeconds: 26 }
  },
  {
    id: "q-bio2-10",
    text: "العظام التي تنتمي إلى الهيكل العظمي المحوري في جسم الإنسان تشمل:",
    options: ["عظام الذراعين والساقين فقط", "عظام الحوض والكتف والترقوة", "الجمجمة والعمود الفقري والقفص الصدري", "عظام الأطراف السفلية والعلوية"],
    correctAnswer: 2, // ج
    explanation: "يتكون الهيكل المحوري من الجمجمة، والعمود الفقري، والأضلاع، والقص؛ بينما تشكل عظام الأطراف والأحزمة الهيكل الطرفي.",
    category: "bio2",
    categoryLabel: "أحياء 2",
    unit: "الجهاز الهيكلي",
    difficulty: "easy",
    type: "tahsili",
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: { timesAnswered: 53, timesCorrect: 47, avgTimeSeconds: 11 }
  },

  // --- علم البيئة (Ecology) ---
  {
    id: "q-eco-01",
    text: "العلاقة التكافلية بين شقائق النعمان والسمكة المهرجة، حيث تحمي السمكة وتوفر شقائق النعمان المأوى، تعد مثالاً على:",
    options: ["تطفل", "تعايش إيجابي لطرف دون إيذاء الآخر", "افتراس", "تقايض (تبادل منفعة)"],
    correctAnswer: 3, // د
    explanation: "في علاقة التقايض (Mutualism) يستفيد كلا الطرفين؛ فتحصل السمكة على الحماية من المفترسات، وتنظف شقائق النعمان وتجلب له فتات الغذاء.",
    category: "ecology",
    categoryLabel: "علم البيئة",
    unit: "العلاقات المتبادلة في النظام البيئي",
    difficulty: "easy",
    type: "tahsili",
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: { timesAnswered: 65, timesCorrect: 58, avgTimeSeconds: 12 }
  },
  {
    id: "q-eco-02",
    text: "أي المناطق البيئية البرية التالية تتميز بوجود طبقة تربة متجمدة دائمًا تحت السطح (Permafrost) وتفتقر للأشجار العالية؟",
    options: ["التايجا (الغابات الشمالية)", "التندرا", "السافانا الاستوائية", "الغابات المعتدلة"],
    correctAnswer: 1, // ب
    explanation: "التندرا منطقة حيوية باردة وجافة جداً تتميز بطبقة التربة الجليدية الدائمة التي تمنع جذور الأشجار العميقة من النمو.",
    category: "ecology",
    categoryLabel: "علم البيئة",
    unit: "المناطق الحيوية البرية",
    difficulty: "medium",
    type: "tahsili",
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: { timesAnswered: 46, timesCorrect: 35, avgTimeSeconds: 18 }
  },
  {
    id: "q-eco-03",
    text: "العملية التي تصف التحول التدريجي المنتظم في المجتمع الحيوي الذي يبدأ على صخور جرداء حديثة بعد انفجار بركاني تسمى:",
    options: ["التعاقب الثانوي", "التضخم الحيوي", "التعاقب الأولي", "التنوع الإقليمي"],
    correctAnswer: 2, // ج
    explanation: "يبدأ التعاقب الأولي (Primary succession) في مكان لا يحتوي على تربة أصلاً (مثل صخور بركانية حديثة) عبر الأنواع الرائدة كالأشنات.",
    category: "ecology",
    categoryLabel: "علم البيئة",
    unit: "ديناميكية المجتمعات الحيوية",
    difficulty: "easy",
    type: "tahsili",
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: { timesAnswered: 58, timesCorrect: 49, avgTimeSeconds: 14 }
  },
  {
    id: "q-eco-04",
    text: "ما النمط المتوقع لتوزيع أفراد قطيع الذئاب أو الغزلان التي تعيش في جماعات مترابطة لحماية بعضها والبحث عن الغذاء؟",
    options: ["تكتلي", "منتظم", "عشوائي", "دائري طردي"],
    correctAnswer: 0, // أ
    explanation: "التوزيع التكتلي (Clumped) هو الأكثر شيوعاً في الطبيعة للحيوانات التي تعيش في قطعان أو أسراب حول الموارد أو للحماية.",
    category: "ecology",
    categoryLabel: "علم البيئة",
    unit: "ديناميكية الجماعات الحيوية",
    difficulty: "medium",
    type: "post_unit",
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: { timesAnswered: 40, timesCorrect: 31, avgTimeSeconds: 16 }
  },
  {
    id: "q-eco-05",
    text: "ظاهرة زيادة تركيز المواد السامة الكيميائية (مثل مبيد DDT أو الزئبق) في أنسجة المخلوقات الحية كلما ارتفعنا في المستويات الغذائية تسمى:",
    options: ["المعالجة الحيوية", "الإثراء الغذائي", "التضخم الحيوي (Biomagnification)", "التوازن البيئي"],
    correctAnswer: 2, // ج
    explanation: "التضخم الحيوي يعني تراكم السموم غير القابلة للتحلل داخل أنسجة المفترسات العليا بتركيزات مضاعفة عن المنتجات الأولية.",
    category: "ecology",
    categoryLabel: "علم البيئة",
    unit: "المحافظة على التنوع الحيوي",
    difficulty: "hard",
    type: "tahsili",
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: { timesAnswered: 38, timesCorrect: 21, avgTimeSeconds: 23 }
  },
  {
    id: "q-eco-06",
    text: "استخدام الكائنات الحية الدقيقة (مثل البكتيريا أو الفطريات) لإزالة الملوثات السامة من البيئة أو التسرب النفطي يُعرف بـ:",
    options: ["المعالجة الحيوية (Bioremediation)", "الزيادة الحيوية", "التنافس الحيوي", "التنوع الوراثي"],
    correctAnswer: 0, // أ
    explanation: "المعالجة الحيوية هي تقنية صديقة للبيئة تعتمد على قدرة بعض الميكروبات على استهلاك الهيدروكربونات والسموم وتفكيكها إلى مركبات غير ضارة.",
    category: "ecology",
    categoryLabel: "علم البيئة",
    unit: "التقنيات البيئية والتنوع الحيوي",
    difficulty: "medium",
    type: "post_unit",
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: { timesAnswered: 43, timesCorrect: 33, avgTimeSeconds: 17 }
  },
  {
    id: "q-eco-07",
    text: "أي العوامل التالية يُعد عاملاً لا يعتمد على كثافة الجماعة الحيوية؟",
    options: ["انتشار مرض وبائي بكتيري", "التنافس على المأوى والغذاء", "الافتراس بين الأنواع", "الجفاف الشديد وموجات الصقيع"],
    correctAnswer: 3, // د
    explanation: "العوامل غير المعتمدة على الكثافة هي عوامل لاحيوية وفيزيائية (كالكوارث الجوية والحرائق والفيضانات) وتؤثر على الجماعة بغض النظر عن عدد أفرادها.",
    category: "ecology",
    categoryLabel: "علم البيئة",
    unit: "ديناميكية الجماعات الحيوية",
    difficulty: "medium",
    type: "daily",
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: { timesAnswered: 50, timesCorrect: 39, avgTimeSeconds: 16 }
  },
  {
    id: "q-eco-08",
    text: "سلوك صغار الإوز عند ولادتها بتتبع أول جسم متحرك تراه والتصرف كأنه أمها هو سلوك:",
    options: ["إشراط كلاسيكي", "مطبوع (Imprinting)", "إشراط إجرائي", "تعود"],
    correctAnswer: 1, // ب
    explanation: "السلوك المطبوع يحدث في فترة حساسة ومحددة مبكراً من حياة المخلوق، ويدمج بين الاستعداد الوراثي والخبرة البصرية الأولية.",
    category: "ecology",
    categoryLabel: "علم البيئة",
    unit: "سلوك الحيوان",
    difficulty: "easy",
    type: "tahsili",
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: { timesAnswered: 61, timesCorrect: 53, avgTimeSeconds: 13 }
  },
  {
    id: "q-eco-09",
    text: "في هرم الطاقة البيئي النموذجي، كم نسبة الطاقة التقريبية التي تنتقل من مستوى غذائي إلى المستوى الذي يليه؟",
    options: ["50% تقريباً", "90% تقريباً", "10% تقريباً", "1% فقط"],
    correctAnswer: 2, // ج
    explanation: "وفق قانون كفاءة الطاقة البيئية، ينتقل نحو 10% فقط من الطاقة المخزنة إلى المستوى الغذائي التالي، بينما يفقد الباقي على شكل حرارة وأنشطة حيوية.",
    category: "ecology",
    categoryLabel: "علم البيئة",
    unit: "تدفق الطاقة في النظام البيئي",
    difficulty: "easy",
    type: "post_unit",
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: { timesAnswered: 69, timesCorrect: 60, avgTimeSeconds: 11 }
  },
  {
    id: "q-eco-10",
    text: "تعتبر أشجار المانغروف التي تنمو على شواطئ البحر الأحمر والخليج العربي ذات أهمية بيئية حاسمة لأنها:",
    options: ["تحمي الشواطئ من التآكل وتعد حضانة غنية للأسماك والقشريات", "تفرز مواد تقتل جميع الطحالب البحرية", "تمتص الأكسجين لتنقية المياه الجوفية", "تمنع تكاثر الشعاب المرجانية"],
    correctAnswer: 0, // أ
    explanation: "غابات المانغروف (الشورى) تثبت التربة الساحلية بجذورها وتوفر بيئة حضانة وحماية حيوية لصغار الأسماك والربيان والطيور المهاجرة.",
    category: "ecology",
    categoryLabel: "علم البيئة",
    unit: "الأنظمة البيئية المائية والتنوع",
    difficulty: "medium",
    type: "secret_lab",
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: { timesAnswered: 33, timesCorrect: 26, avgTimeSeconds: 20 }
  }
];
