export type CaseStudy = {
  id: string;
  name: string;
  niche: string;
  avatarInitials: string;
  avatarImage?: string;
  shortBio: string;
  youtubeUrl?: string;
  story: string;
  metrics: { label: string; value: string }[];
};

export const caseStudies: CaseStudy[] = [
  {
    id: "alex-rivera",
    name: "Alex Rivera",
    niche: "جيمينج / ماينكرافت",
    avatarInitials: "AR",
    shortBio: "انتقل Alex من 50 ألف إلى 500 ألف مشترك بعد إعادة تصميم المقاطع",
    story: "كان Alex يعاني من معدل نقر 3% على سلسلة ماينكرافت الخاصة به. بالرغم من جودة الفيديو العالية، لم تكن الصور المصغرة تجذب الانتباه. بعد إعادة التصميم بالتركيز على التباين العالي ونقاط الفضول، ارتفع معدل النقر بشكل صاروخي.",
    metrics: [
      { label: "ارتفاع معدل النقر", value: "+145%" },
      { label: "مشتركون جدد", value: "450 ألف" },
      { label: "متوسط المشاهدات", value: "2.1 مليون" }
    ]
  },
  {
    id: "sarah-chen",
    name: "Sarah Chen",
    niche: "مالية / استثمار",
    avatarInitials: "SC",
    shortBio: "نمت قناة Sarah المالية 3 أضعاف خلال 6 أشهر",
    story: "كانت دروس Sarah في الاستثمار عالية الجودة لكنها تبدو مثل أي محتوى مالي عادي. أدخلنا تصميماً احترافياً بتباين عالٍ وتعبيرات وجه واضحة، مما ميّز قناتها تماماً عن منافسيها.",
    metrics: [
      { label: "نمو القناة", value: "3 أضعاف" },
      { label: "ارتفاع معدل النقر", value: "+95%" },
      { label: "وقت المشاهدة", value: "+1.2 مليون ساعة" }
    ]
  },
  {
    id: "marcus-johnson",
    name: "Marcus Johnson",
    niche: "فلوج / لايف ستايل",
    avatarInitials: "MJ",
    shortBio: "ضاعف Marcus معدل النقر خلال أسبوعين فقط",
    story: "كان Marcus ينتج فلوجات مليئة بالطاقة لكن صوره المصغرة كانت مزدحمة جداً. أزلنا كل الفوضى وركّزنا على قصة واحدة مقنعة في كل صورة مع ألوان نابضة لضمان لفت الانتباه على الأجهزة المحمولة.",
    metrics: [
      { label: "ارتفاع معدل النقر", value: "+110%" },
      { label: "انتشار الفيديوهات", value: "4 أضعاف" },
      { label: "نقرات الجوال", value: "+180%" }
    ]
  },
  {
    id: "emma-williams",
    name: "Emma Williams",
    niche: "ردود الفعل / ترفيه",
    avatarInitials: "EW",
    shortBio: "فيديوهات Emma تحقق مليون مشاهدة بشكل منتظم الآن",
    story: "احتاجت Emma صوراً مصغرة تنقل فوراً المشاعر القوية في محتوى ردود الفعل. من خلال تضخيم التعبيرات وألوان جريئة متكاملة، خلقنا صوراً مصغرة لا تقاوم التوقف عندها.",
    metrics: [
      { label: "فيديوهات تجاوزت مليون", value: "15+" },
      { label: "ارتفاع معدل النقر", value: "+130%" },
      { label: "زيادة الإيرادات", value: "+210%" }
    ]
  },
  {
    id: "david-kim",
    name: "David Kim",
    niche: "جيمينج / فورتنايت",
    avatarInitials: "DK",
    shortBio: "صور David المصغرة تحقق الآن معدل نقر 8% في المتوسط",
    story: "في سوق الفورتنايت شديد التنافس، كان David بحاجة للتميّز. طورنا له أسلوب تصميم ثلاثي الأبعاد بإضاءة نيون درامية يفصله فوراً عن منافسيه.",
    metrics: [
      { label: "متوسط معدل النقر", value: "8.4%" },
      { label: "التوصيات", value: "أفضل 5%" },
      { label: "مشتركون شهرياً", value: "50 ألف+" }
    ]
  }
];

export const portfolioCategories = ["الكل", "جيمينج", "مالية", "فلوج", "ردود الفعل"];
export const portfolioCategoriesEn = ["All", "Gaming", "Finance", "Vlogs", "Reaction"];

export const portfolioItems = [
  { id: 1, category: "جيمينج", categoryEn: "Gaming" },
  { id: 2, category: "مالية", categoryEn: "Finance" },
  { id: 3, category: "فلوج", categoryEn: "Vlogs" },
  { id: 4, category: "ردود الفعل", categoryEn: "Reaction" },
  { id: 5, category: "جيمينج", categoryEn: "Gaming" },
  { id: 6, category: "مالية", categoryEn: "Finance" },
  { id: 7, category: "فلوج", categoryEn: "Vlogs" },
  { id: 8, category: "ردود الفعل", categoryEn: "Reaction" },
  { id: 9, category: "جيمينج", categoryEn: "Gaming" },
  { id: 10, category: "مالية", categoryEn: "Finance" },
  { id: 11, category: "فلوج", categoryEn: "Vlogs" },
  { id: 12, category: "ردود الفعل", categoryEn: "Reaction" },
];
