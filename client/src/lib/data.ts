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

export const portfolioCategories = ["All", "Gaming", "Finance", "Vlogs", "Reaction"];
export const portfolioCategoriesEn = ["All", "Gaming", "Finance", "Vlogs", "Reaction"];

export const portfolioItems = [
  { id: 1, category: "Gaming", categoryEn: "Gaming" },
  { id: 2, category: "Finance", categoryEn: "Finance" },
  { id: 3, category: "Vlogs", categoryEn: "Vlogs" },
  { id: 4, category: "Reaction", categoryEn: "Reaction" },
  { id: 5, category: "Gaming", categoryEn: "Gaming" },
  { id: 6, category: "Finance", categoryEn: "Finance" },
  { id: 7, category: "Vlogs", categoryEn: "Vlogs" },
  { id: 8, category: "Reaction", categoryEn: "Reaction" },
  { id: 9, category: "Gaming", categoryEn: "Gaming" },
  { id: 10, category: "Finance", categoryEn: "Finance" },
  { id: 11, category: "Vlogs", categoryEn: "Vlogs" },
  { id: 12, category: "Reaction", categoryEn: "Reaction" },
  { id: 13, category: "Gaming", categoryEn: "Gaming" },
  { id: 14, category: "Finance", categoryEn: "Finance" },
  { id: 15, category: "Vlogs", categoryEn: "Vlogs" },
  { id: 16, category: "Reaction", categoryEn: "Reaction" },
  { id: 17, category: "Gaming", categoryEn: "Gaming" },
  { id: 18, category: "Finance", categoryEn: "Finance" },
  { id: 19, category: "Vlogs", categoryEn: "Vlogs" },
  { id: 20, category: "Reaction", categoryEn: "Reaction" },
];
