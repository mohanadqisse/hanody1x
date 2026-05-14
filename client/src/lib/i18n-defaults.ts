/* ──────────────────────────────────────────────
   English default values for every section that
   Home.tsx pulls via useSection().
   When lang === "en" we swap in these instead of
   the Arabic API content.
   ────────────────────────────────────────────── */

export const heroEn = {
  badge: "Available for New Projects",
  headline: "Your Thumbnail Is the Reason They Click.",
  subheadline: "I design professional, high-CTR thumbnails that stop the scroll, grab attention, and significantly boost your channel's views.",
  ctaPrimary: "Get Your Thumbnail",
  ctaSecondary: "View My Work",
  trustText: "Trusted by 50+ YouTubers",
};

export const statsEn = [
  { value: "200", suffix: "+", label: "Thumbnails Delivered" },
  { value: "120", suffix: "%", label: "Avg. CTR Improvement" },
  { value: "48", suffix: "h", label: "Avg. Delivery Time" },
  { value: "50", suffix: "+", label: "Happy Clients" },
];

export const packagesEn = [
  { name: "Basic", price: "29", features: ["1 Revision", "3-Day Delivery", "HD Quality", "Basic Design"], popular: false },
  { name: "Pro", price: "59", features: ["3 Revisions", "2-Day Delivery", "4K Quality", "Advanced Design", "A/B Test Versions"], popular: true },
  { name: "Elite", price: "99", features: ["Unlimited Revisions", "24-Hour Delivery", "4K Quality", "Premium Design", "CTR Analysis", "Priority Support"], popular: false },
];

// English translations map for Arabic admin-entered features
// Used to translate admin features from Arabic to English
export const featureTranslationMap: Record<string, string> = {
  // Basic package features
  "تحسين الألوان والإضاءة": "Color & Lighting Enhancement",
  "ضبط التباين والوضوح": "Contrast & Clarity Adjustment",
  "قص وترتيب العناصر داخل الصورة": "Cropping & Element Arrangement",
  "استخدام خطوط مناسبة لليوتيوب": "YouTube-Optimized Typography",
  "إضافة نصوص واضحة ومقروءة": "Clear & Readable Text Overlay",
  "دمج الصور بشكل نظيف": "Clean Image Compositing",
  "إخراج بجودة عالية": "High Quality Export",
  "تسليم خلال 48 ساعة": "48-Hour Delivery",
  "الحفاظ على بساطة الفكرة": "Keeping the Concept Simple",
  // Pro package features
  "تحسين متقدم للألوان والإضاءة": "Advanced Color & Lighting Enhancement",
  "معالجة البشرة والتفاصيل (Retouch)": "Skin & Detail Retouching",
  "إضافة تأثيرات بصرية خفيفة": "Subtle Visual Effects",
  "اختيار عناصر تدعم الفكرة": "Supporting Elements Selection",
  "تحسين توزيع العناصر داخل التصميم": "Optimized Element Layout",
  "إبراز العنصر الأساسي (Focus)": "Main Element Focus Enhancement",
  "استخدام أسلوب بصري متناسق": "Consistent Visual Style",
  "تحسين قابلية النقر (CTR)": "CTR Optimization",
  "تعديلات 2–3": "2–3 Revisions",
  "أولوية في التنفيذ": "Priority Execution",
  // Elite package features
  "معالجة احترافية جداً للألوان والتفاصيل": "Professional Color & Detail Processing",
  "تعديل كامل على الصورة (Advanced Retouch)": "Full Image Advanced Retouching",
  "إضافة تأثيرات بصرية متقدمة": "Advanced Visual Effects",
  "بناء فكرة بصرية للثمنيل": "Visual Concept Building",
  "اقتراح أكثر من Concept": "Multiple Concept Proposals",
  "إبراز قوي للعنصر الأساسي": "Strong Main Element Emphasis",
  "ضبط دقيق للإضاءة والظلال": "Precise Lighting & Shadow Tuning",
  "تحسين عالي للـ CTR": "Maximum CTR Optimization",
  "الحفاظ على هوية بصرية ثابتة": "Consistent Brand Visual Identity",
  "تعديلات مفتوحة": "Unlimited Revisions",
  "تسليم سريع جداً": "Ultra-Fast Delivery",
  "أولوية قصوى بالتنفيذ": "Top Priority Execution",
  "دعم مستمر وتطوير أسلوب القناة": "Ongoing Support & Channel Style Development",
  "اقتراح A/B بديل للتصميم": "A/B Design Alternative Proposal",
  // Legacy/default features (fallback)
  "تعديل واحد": "1 Revision",
  "تسليم خلال 3 أيام": "3-Day Delivery",
  "جودة HD": "HD Quality",
  "تصميم أساسي": "Basic Design",
  "3 تعديلات": "3 Revisions",
  "تسليم خلال يومين": "2-Day Delivery",
  "جودة 4K": "4K Quality",
  "تصميم متقدم": "Advanced Design",
  "نسختان A/B للاختبار": "A/B Test Versions",
  "تعديلات غير محدودة": "Unlimited Revisions",
  "تسليم خلال 24 ساعة": "24-Hour Delivery",
  "تصميم ممتاز": "Premium Design",
  "تحليل معدل النقر": "CTR Analysis",
  "أولوية الدعم": "Priority Support",
};

export const ctrEn = {
  title: "Designed to Get Clicks — Not Just Look Pretty.",
  subtitle: "Most thumbnails look nice. My work is built on human psychology to deliver real performance. Higher CTR = More Views = Faster Growth.",
  highlight: "Proven Results",
  highlightDesc: "Some clients achieved over 120% increase in click-through rate",
};

export const ctrPrinciplesEn = [
  { title: "High-Contrast Colors", desc: "Colors that pop on YouTube in both dark and light modes." },
  { title: "Emotional Expressions", desc: "Faces that instantly convey the video's emotion to viewers." },
  { title: "Curiosity-Driven Composition", desc: "Visual layouts that create an open loop in the viewer's mind." },
  { title: "Clear Focal Point", desc: "No clutter. One clear subject that draws the eye." },
  { title: "Scroll-Stopping Visuals", desc: "Studied visual patterns that make viewers pause and look." },
];

export const urgencyEn = { text: "Only 3 Spots Left This Week" };

export const whyChooseMeEn = {
  title: "Why Choose Me?",
  feat1Title: "Fast Delivery",
  feat1Desc: "Never miss your upload schedule. Most drafts delivered within 24-48 hours.",
  feat2Title: "CTR Focused",
  feat2Desc: "Decisions based on YouTube analytics and visual hierarchy — not guesswork.",
  feat3Title: "Unique Style",
  feat3Desc: "Custom elements, advanced gradients, and composition that sets you apart.",
  feat4Title: "YouTuber Experience",
  feat4Desc: "I understand channel workflows, retention hooks, and audience psychology.",
};

export const howItWorksEn = {
  title: "How We Work Together",
  subtitle: "Three simple steps to a thumbnail that doubles your views",
  step1Title: "Send Your Details",
  step1Desc: "Tell me about your channel, video topic, and target audience. The more details, the better the design.",
  step2Title: "Design & Revise",
  step2Desc: "I design a professional thumbnail and send it for review. Request revisions based on your package.",
  step3Title: "Receive Your Files",
  step3Desc: "After approval, high-quality files are delivered ready to upload within 24-48 hours max.",
};

export const aboutEn = {
  title: "YouTube Design Specialist",
  bio1: "I'm Muhannad, a graphic designer specializing in YouTube thumbnails. I work with Arab and international YouTubers to transform their ideas into thumbnails that stop the scroll and multiply views.",
  bio2: "My philosophy is simple: a good thumbnail doesn't just look beautiful — it works. Every design I deliver is built on a deep understanding of visual psychology and YouTube algorithms.",
  badge1: "+50 YouTubers",
  badge2: "+120% CTR",
  skills: "Thumbnail Design,CTR Optimization,Channel Analysis,Visual Effects,Graphic Design,Color Psychology",
};

export const specialOfferEn = {
  discount: "20%",
  code: "HANODY20",
  description: "For new clients only. Use the code when ordering to get an instant discount on your chosen package.",
};

export const contactEn = {
  title: "Start Your Order",
  subtitle: "Fill out the form below or message me directly on Instagram to get started.",
};

export const finalCtaEn = {
  headline: "Ready to Go Viral?",
  cta: "Get Your Thumbnail Now",
};

export const caseStudiesEn = [
  {
    id: "shero-amara",
    name: "Shero Amara",
    niche: "Entertainment",
    avatarInitials: "SA",
    shortBio: "Shero Amara is a famous YouTuber and content creator mixing humor and entertainment to create videos for all ages.",
    youtubeUrl: "",
    story: "After switching to professional thumbnail designs, Shero noticed a significant increase in views and engagement on his channel.",
    metrics: [
      { label: "View Increase", value: "+150%" },
      { label: "CTR Improvement", value: "3.2x" },
      { label: "New Subscribers", value: "+45K" },
    ],
  },
  {
    id: "sara-haddadin",
    name: "Sara Haddadin",
    niche: "Sports",
    avatarInitials: "SH",
    shortBio: "A sports content creator covering diverse and exciting stories about matches and players.",
    youtubeUrl: "",
    story: "Sara's channel growth accelerated dramatically after implementing optimized thumbnail designs.",
    metrics: [
      { label: "View Increase", value: "+200%" },
      { label: "CTR Improvement", value: "2.8x" },
      { label: "New Subscribers", value: "+30K" },
    ],
  },
  {
    id: "jalal-amara",
    name: "Jalal Amara",
    niche: "Family Content",
    avatarInitials: "JA",
    shortBio: "A global content creator delivering daily life vlogs and comedy sketches for all ages.",
    youtubeUrl: "",
    story: "Jalal saw immediate results in engagement and subscriber growth after the thumbnail redesign.",
    metrics: [
      { label: "View Increase", value: "+180%" },
      { label: "CTR Improvement", value: "2.5x" },
      { label: "New Subscribers", value: "+60K" },
    ],
  },
  {
    id: "omar-jawad",
    name: "Omar Jawad",
    niche: "Politics",
    avatarInitials: "OJ",
    shortBio: "A political content creator presenting simplified analyses of current events and issues.",
    youtubeUrl: "",
    story: "Omar's audience engagement improved significantly with thumbnails designed to spark curiosity.",
    metrics: [
      { label: "View Increase", value: "+120%" },
      { label: "CTR Improvement", value: "2.1x" },
      { label: "New Subscribers", value: "+25K" },
    ],
  },
  {
    id: "alyssa-pankhon",
    name: "Alyssa Pankhon",
    niche: "Sports",
    avatarInitials: "AP",
    shortBio: "A sports content creator covering global matches with a fun mix of analysis, passion, and travel.",
    youtubeUrl: "",
    story: "Alyssa's travel sports content gained massive traction with visually striking thumbnails.",
    metrics: [
      { label: "View Increase", value: "+160%" },
      { label: "CTR Improvement", value: "3.0x" },
      { label: "New Subscribers", value: "+35K" },
    ],
  },
];
