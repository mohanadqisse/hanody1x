import { API_BASE } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

type SectionContent = Record<string, any> | any[];

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
  const portfolioUrls = portfolioSection?.images ? portfolioSection.images.split(/[\s,]+/).filter(Boolean) : urls.slice(2);

  return {
    heroCard1: heroSection?.heroCard1 || urls[0],
    heroCard2: heroSection?.heroCard2 || urls[1],
    portfolio: portfolioUrls,
  };
}
