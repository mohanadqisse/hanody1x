import { API_BASE } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

interface ImagesMap {
  heroCard1?: string;
  heroCard2?: string;
  portfolio?: string[];
  [key: string]: string | string[] | undefined;
}

async function fetchSection(section: string): Promise<any> {
  try {
    const res = await fetch(API_BASE + `/api/content/${section}`);
    if (!res.ok) return {};
    return res.json();
  } catch {
    return {};
  }
}

async function fetchImagesFromApi(): Promise<string[]> {
  try {
    const res = await fetch(API_BASE + "/api/content/images");
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export function useSection<T>(
  section: string,
  defaults: T
): T {
  const { data } = useQuery({
    queryKey: ["section", section],
    queryFn: () => fetchSection(section),
    staleTime: 1000 * 60 * 5,
  });

  if (!data || (Object.keys(data).length === 0 && !Array.isArray(data))) {
    return defaults;
  }

  if (Array.isArray(defaults)) {
    return (Array.isArray(data) ? data : defaults) as T;
  }

  return { ...defaults, ...data } as T;
}

export function useLocalizedSection<T>(
  section: string,
  arDefault: T,
  enDefault: T,
  lang: string,
): T {
  const apiData = useSection(section, arDefault);
  return lang === "ar" ? apiData : enDefault;
}

export function useImages(): ImagesMap {
  const { data: allImages } = useQuery({
    queryKey: ["images"],
    queryFn: fetchImagesFromApi,
    staleTime: 1000 * 60 * 5,
  });

  const { data: heroSection } = useQuery({
    queryKey: ["section", "hero"],
    queryFn: () => fetchSection("hero"),
    staleTime: 1000 * 60 * 5,
  });

  const { data: portfolioSection } = useQuery({
    queryKey: ["section", "portfolio"],
    queryFn: () => fetchSection("portfolio"),
    staleTime: 1000 * 60 * 5,
  });

  const urls = allImages ?? [];
  const portfolioUrls = portfolioSection?.images ? portfolioSection.images.split(",").map((s: string) => s.trim()) : urls.slice(2);

  return {
    heroCard1: heroSection?.heroCard1 || urls[0],
    heroCard2: heroSection?.heroCard2 || urls[1],
    portfolio: portfolioUrls,
  };
}

// ─────────────────────────────────────────────────────────────
// CREATOR-GROUPED PORTFOLIO TYPES & HOOKS
// ─────────────────────────────────────────────────────────────

export interface PortfolioItem {
  id: number | string;
  creatorId?: number;
  imageUrl: string;
  title?: string;
  videoTitle?: string;
  creatorName?: string;
  youtubeUrl?: string;
  views?: string;
  category?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface PortfolioCreator {
  id: number;
  name: string;
  avatarUrl?: string | null;
  subscriberCount?: string | null;
  youtubeUrl?: string | null;
  description?: string | null;
  displayOrder: number;
  isActive: boolean;
  items: PortfolioItem[];
}

async function fetchPortfolioCreators(): Promise<PortfolioCreator[]> {
  try {
    const res = await fetch(API_BASE + "/api/portfolio/creators");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn("Relational portfolio creators fetch failed, trying site_content fallback...", err);
  }

  // Resilient fallback to site_content
  try {
    const res = await fetch(API_BASE + "/api/content/portfolio_creators");
    if (res.ok) {
      const data = await res.json();
      let list: PortfolioCreator[] = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (data && Array.isArray(data.creators)) {
        list = data.creators;
      }
      if (list.length > 0) {
        return list
          .filter(c => c && c.isActive !== false)
          .map(c => ({
            ...c,
            items: (c.items || []).filter((it: any) => it && it.isActive !== false),
          }));
      }
    }
  } catch (err) {
    console.warn("Content portfolio creators fetch failed:", err);
  }

  return [];
}

/**
 * Fetch legacy portfolio items from Cloudinary / siteContent (fallback only)
 */
function useLegacyPortfolioItems(): PortfolioItem[] {
  const images = useImages();
  const { data: portfolioSection } = useQuery({
    queryKey: ["section", "portfolio"],
    queryFn: () => fetchSection("portfolio"),
    staleTime: 1000 * 60 * 5,
  });

  const portfolioUrls: string[] = images.portfolio ?? [];
  const storedItems: any[] = Array.isArray(portfolioSection?.items) ? portfolioSection.items : [];

  return portfolioUrls.map((url, i) => {
    const meta = storedItems[i] || storedItems.find((it: any) => it && it.imageUrl === url);
    return {
      id: meta?.id ?? i + 1,
      imageUrl: url,
      creatorName: meta?.creatorName || undefined,
      videoTitle: meta?.videoTitle || undefined,
      title: meta?.videoTitle || meta?.title || undefined,
      youtubeUrl: meta?.youtubeUrl || undefined,
      views: meta?.views || undefined,
      category: meta?.category || undefined,
    };
  });
}

/**
 * Primary hook for the Creator-Grouped public portfolio
 */
export function usePortfolioCreators(): { creators: PortfolioCreator[]; isLoading: boolean } {
  const { data: dbCreators, isLoading } = useQuery<PortfolioCreator[]>({
    queryKey: ["portfolio", "creators"],
    queryFn: fetchPortfolioCreators,
    staleTime: 1000 * 60 * 2,
  });

  const legacyItems = useLegacyPortfolioItems();

  if (dbCreators && dbCreators.length > 0) {
    return { creators: dbCreators, isLoading };
  }

  // Fallback if no creators in relational database yet: group legacy items by creatorName
  if (!isLoading && legacyItems.length > 0) {
    const map = new Map<string, PortfolioItem[]>();
    for (const item of legacyItems) {
      const cName = item.creatorName?.trim() || "Featured Creators";
      if (!map.has(cName)) {
        map.set(cName, []);
      }
      map.get(cName)!.push(item);
    }

    const syntheticCreators: PortfolioCreator[] = Array.from(map.entries()).map(([name, items], idx) => ({
      id: -(idx + 1),
      name,
      avatarUrl: null,
      subscriberCount: null,
      youtubeUrl: null,
      description: null,
      displayOrder: idx,
      isActive: true,
      items,
    }));

    return { creators: syntheticCreators, isLoading: false };
  }

  return { creators: dbCreators ?? [], isLoading };
}

/**
 * Flattened portfolio items across all creators (for lightboxes and quick lists)
 */
export function usePortfolioItems(): PortfolioItem[] {
  const { creators } = usePortfolioCreators();
  if (creators.length > 0) {
    return creators.flatMap((c) =>
      c.items.map((it) => ({
        ...it,
        creatorName: it.creatorName || c.name,
      }))
    );
  }
  return [];
}
