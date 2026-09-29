/* ==========================================================================
   Language: English or Arabic (right-to-left).
   - t("English text") returns the Arabic text when Arabic is on, otherwise the same text.
   - content() returns the portfolio content in the current language.
   - Elements with data-i18n / data-i18n-label are updated automatically.
   ========================================================================== */
(function () {
  const LS = "devleb.lang.v1";

  const AR = {
    // pages and tabs
    "Home": "الرئيسية", "Education": "التعليم", "Experience": "الخبرة", "Projects": "المشاريع",
    "Contact": "التواصل", "Resume": "السيرة الذاتية", "Blog": "المدوّنة", "Not found": "غير موجود",
    // browser chrome
    "Close the browser and return to the desk": "إغلاق المتصفح والعودة إلى المكتب",
    "Portfolio pages": "صفحات الملف الشخصي", "Back": "رجوع", "Forward": "تقدّم", "Reload page": "إعادة تحميل الصفحة",
    "Address": "العنوان", "Desk": "المكتب", "Back to the desk": "العودة إلى المكتب", "Switch language": "تبديل اللغة",
    "Travelling back": "سفر إلى الماضي", "Travelling ahead": "سفر إلى المستقبل", "NOW": "الآن", "NEXT": "التالي",
    // home
    "Portrait of {name}": "صورة {name}", "See my projects": "شاهد مشاريعي", "Download CV": "تنزيل السيرة الذاتية",
    "Get in touch": "تواصل معي", "In IT since": "في مجال تكنولوجيا المعلومات منذ", "{n} years": "{n} سنة",
    "Based in": "مقيم في", "Degree": "الشهادة", "BSc Computer Science": "بكالوريوس علوم الحاسوب",
    "What I work on": "مجالات عملي", "Currently exploring": "أستكشف حاليًا",
    // education
    "A computer science degree, then a steady run of certifications.": "شهادة جامعية في علوم الحاسوب، تلتها سلسلة متواصلة من الشهادات المهنية.",
    "Education sections": "أقسام التعليم", "Certificates": "الشهادات", "Copy credential ID {id}": "نسخ رقم الاعتماد {id}",
    // experience
    "From IT support to managing a blockchain team, with the projects behind each role.": "من الدعم التقني إلى إدارة فريق بلوكتشين، مع المشاريع التي تقف وراء كل دور.",
    "Projects in this role": "مشاريع هذا الدور", "Open project {name}": "فتح المشروع {name}",
    // projects
    "Filter by technology or search by name. Tap a project to open it.": "صفِّ المشاريع حسب التقنية أو ابحث بالاسم. المس مشروعًا لفتحه.",
    "Find a project": "ابحث عن مشروع", "Filter by technology": "التصفية حسب التقنية", "Show all {n} technologies": "عرض كل التقنيات ({n})",
    "Show fewer": "عرض أقل", "Clear filters": "مسح عوامل التصفية", "No projects match these filters.": "لا توجد مشاريع تطابق عوامل التصفية هذه.",
    "Description": "الوصف", "Tasks": "المهام", "Filter by {name}": "التصفية حسب {name}", "Open": "افتح", "Close": "إغلاق",
    "See this role on the Experience page: {name}": "عرض هذا الدور في صفحة الخبرة: {name}",
    // contact
    "Open to projects, collaboration and a good technical conversation.": "منفتح على المشاريع والتعاون ونقاش تقني جيد.",
    "Write a message": "اكتب رسالة", "This opens your email app with the message ready to send to {email}.": "سيفتح هذا تطبيق البريد لديك والرسالة جاهزة للإرسال إلى {email}.",
    "Your name": "اسمك", "Subject": "الموضوع", "Message": "الرسالة", "Open in email app": "فتح في تطبيق البريد", "Copy email address": "نسخ البريد الإلكتروني",
    "your name": "اسمك", "a subject": "موضوعًا", "a message": "رسالة", "Add {list} first.": "أضف {list} أولًا.", "Opening your email app": "جارٍ فتح تطبيق البريد",
    // resume
    "View CV": "عرض السيرة الذاتية", "Hide CV": "إخفاء السيرة الذاتية", "About me": "نبذة عني",
    "Keeps up with new technology, especially in development and programming.": "يواكب التقنيات الحديثة، ولا سيما في التطوير والبرمجة.",
    "Interested in data analytics, AI and NLP.": "مهتم بتحليل البيانات والذكاء الاصطناعي ومعالجة اللغات الطبيعية.",
    "Web scraping and automation.": "استخراج بيانات الويب والأتمتة.",
    "Work experience": "الخبرة المهنية", "Info": "معلومات", "Email": "البريد الإلكتروني", "Location": "الموقع", "Languages": "اللغات",
    "Technical leadership": "القيادة التقنية", "Technical qualifications I bring to project management. Pick a category.": "المؤهلات التقنية التي أضيفها إلى إدارة المشاريع. اختر فئة.",
    "{n} qualifications": "{n} مؤهلات", "of {n}": "من {n}", "Skills": "المهارات", "All": "الكل", "Filter skills by category": "تصفية المهارات حسب الفئة",
    "Level legend": "مفتاح المستويات", "85% and above": "85% فأكثر", "75–84%": "75–84%", "65–74%": "65–74%", "below 65%": "أقل من 65%",
    "Skill:": "المهارة:", "Experience:": "الخبرة:", "The CV is currently available in English.": "السيرة الذاتية متوفرة حاليًا بالإنجليزية.",
    "Loading the CV…": "جارٍ تحميل السيرة الذاتية…", "The CV preview couldn't load ({msg}). Use Download CV instead.": "تعذّر تحميل معاينة السيرة الذاتية ({msg}). استخدم زر التنزيل بدلًا من ذلك.",
    "CV page {i}": "الصفحة {i} من السيرة الذاتية", "CV saved": "تم حفظ السيرة الذاتية",
    "The download didn't start here. Try the link on the published site.": "لم يبدأ التنزيل هنا. جرّب الرابط في الموقع المنشور.",
    // blog and 404
    "Notes from learning in public.": "ملاحظات من رحلة التعلّم العلني.", "Read on Medium": "اقرأ على Medium",
    "Lost in time": "تُهت في الزمن", "{path} isn't a page on this site. Pick a destination:": "{path} ليست صفحة في هذا الموقع. اختر وجهتك:",
    // toasts
    "Copied {x}": "تم نسخ {x}", "Copy blocked here. The address is {x}": "النسخ غير متاح هنا. العنوان هو {x}",
    // desk overlay
    "Step inside": "ادخل", "Skip the intro": "تخطَّ المقدمة", "Setting up the desk": "جارٍ تجهيز المكتب",
    "Tap the laptop to enter. Try the hourglass, the CV and the coin.": "المس الحاسوب للدخول. جرّب الساعة الرملية والسيرة الذاتية والعملة.",
    "Flip the hourglass": "اقلب الساعة الرملية", "Open my CV": "افتح سيرتي الذاتية", "See the Egety project": "شاهد مشروع Egety",
    "Backend / Blockchain / Intelligence & data": "الأنظمة الخلفية / بلوكتشين / الاستخبارات والبيانات",
    // scene panel
    "Time of day": "وقت اليوم", "Weather": "الطقس", "Motion": "الحركة", "Auto": "تلقائي", "Dawn": "الفجر", "Day": "النهار", "Dusk": "الغروب", "Night": "الليل",
    "Live": "مباشر", "My location": "موقعي", "Sunny": "مشمس", "Cloudy": "غائم", "Rainy": "ماطر", "Foggy": "ضبابي", "Snowy": "ثلجي", "Clear": "صافٍ",
    "Tilt": "الإمالة", "Time of day and weather": "وقت اليوم والطقس", "Scene: {phase}, {weather}. Change time and weather.": "المشهد: {phase}، {weather}. غيّر الوقت والطقس.",
    "sunny": "مشمس", "clear": "صافٍ", "cloudy": "غائم", "raining": "تمطر", "foggy": "ضبابي", "snowing": "تثلج",
    "It's {time} in {city}: {temp}°C, {cond}.": "الساعة {time} في {city}: {temp}°م، الطقس {cond}.",
    "It's {time} where you are: {temp}°C, {cond}.": "الساعة {time} عندك: {temp}°م، الطقس {cond}.",
    "It's {time} for you. Live weather isn't available here, so the sky is clear.": "الساعة {time} عندك. الطقس المباشر غير متاح هنا، لذا السماء صافية.",
    "It's {time}. Weather set to {w}.": "الساعة {time}. تم ضبط الطقس على {w}.",
    "Checking the weather…": "جارٍ التحقق من الطقس…",
    "Time follows your clock.": "الوقت يتبع ساعتك.", "Time set by you.": "الوقت من اختيارك.",
    "Weather set by you. Pick Live to follow the real weather.": "الطقس من اختيارك. اختر «مباشر» لمتابعة الطقس الفعلي.",
    "Live weather for {city}: {temp}°C.": "الطقس المباشر في {city}: {temp}°م.",
    "Based on your time zone's main city, not your exact location.": "بحسب المدينة الرئيسية في منطقتك الزمنية، وليس موقعك الدقيق.",
    "Based on your device's location. It is not stored.": "بحسب موقع جهازك. لا يتم حفظه.",
    "Weather data by Open-Meteo.com": "بيانات الطقس من Open-Meteo.com",
    "Couldn't reach the weather service (some preview windows and blockers stop it). The sky is clear for now.": "تعذّر الوصول إلى خدمة الطقس (بعض نوافذ المعاينة وبرامج الحجب تمنعها). السماء صافية حاليًا.",
    "Your time zone ({tz}) doesn't name a city. Try My location, or pick a weather.": "منطقتك الزمنية ({tz}) لا تحدد مدينة. جرّب «موقعي»، أو اختر طقسًا.",
    "Location permission was declined, so your time zone's city is used.": "تم رفض إذن الموقع، لذا تُستخدم مدينة منطقتك الزمنية.",
    "your location": "موقعك"
  };

  let lang = "en";
  const listeners = [];
  const cache = { ar: null };

  // merges Arabic text over the English content, by position in lists; null keeps the English value
  function merge(en, ar) {
    if (ar === undefined || ar === null) return en;
    if (Array.isArray(en)) return en.map((v, i) => merge(v, Array.isArray(ar) ? ar[i] : undefined));
    if (en && typeof en === "object") { const o = {}; for (const k in en) o[k] = merge(en[k], typeof ar === "object" ? ar[k] : undefined); return o; }
    return ar;
  }

  function content() {
    if (lang !== "ar") return window.CONTENT;
    return cache.ar || (cache.ar = merge(window.CONTENT, window.CONTENT_AR || {}));
  }

  function t(s, vars) {
    let out = lang === "ar" && AR[s] !== undefined ? AR[s] : s;
    if (vars) out = out.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : ""));
    return out;
  }

  const langLabel = () => (lang === "ar" ? "English" : "عربي");

  function applyStatic() {
    document.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll("[data-i18n-label]").forEach(el => { el.setAttribute("aria-label", t(el.dataset.i18nLabel)); });
    document.querySelectorAll("[data-lang-label]").forEach(el => { el.textContent = langLabel(); });
    document.querySelectorAll("[data-role]").forEach(el => { el.textContent = content().profile.role; });
  }

  function apply(l) {
    lang = l === "ar" ? "ar" : "en";
    const root = document.documentElement;
    root.lang = lang; root.dir = lang === "ar" ? "rtl" : "ltr";
    applyStatic();
  }

  function set(l) {
    if ((l === "ar" ? "ar" : "en") === lang) return;
    apply(l);
    try { localStorage.setItem(LS, lang); } catch (e) {}
    listeners.forEach(fn => fn(lang));
  }

  function init() {
    let saved = null;
    try { saved = localStorage.getItem(LS); } catch (e) {}
    apply(saved === "ar" ? "ar" : "en");
  }

  window.I18N = {
    t, content, set, init, langLabel, applyStatic,
    get lang() { return lang; },
    get rtl() { return lang === "ar"; },
    onChange(fn) { listeners.push(fn); }
  };
  init();
})();
