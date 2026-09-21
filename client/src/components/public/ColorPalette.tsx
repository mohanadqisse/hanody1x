import { useState, useEffect, useCallback, useRef } from "react";
import { Check, Copy } from "lucide-react";

interface ColorPaletteProps {
  imageUrl: string;
}

// Convert RGB to HEX string
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(c))).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

// Color distance (Euclidean in RGB space)
function colorDist(c1: [number, number, number], c2: [number, number, number]): number {
  const dr = c1[0] - c2[0];
  const dg = c1[1] - c2[1];
  const db = c1[2] - c2[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

export function ColorPalette({ imageUrl }: ColorPaletteProps) {
  const [colors, setColors] = useState<string[]>([]);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;
    if (!imageUrl) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    img.onload = () => {
      if (isCancelled) return;
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Downscale for fast, efficient color sampling
        const sampleSize = 48;
        canvas.width = sampleSize;
        canvas.height = sampleSize;
        ctx.drawImage(img, 0, 0, sampleSize, sampleSize);

        const imgData = ctx.getImageData(0, 0, sampleSize, sampleSize).data;
        const colorCounts: Map<string, { rgb: [number, number, number]; count: number }> = new Map();

        // Quantize colors by rounding to nearest multiple of 16
        const quant = 16;
        for (let i = 0; i < imgData.length; i += 4) {
          const a = imgData[i + 3];
          if (a < 128) continue; // Skip transparent

          const r = Math.round(imgData[i] / quant) * quant;
          const g = Math.round(imgData[i + 1] / quant) * quant;
          const b = Math.round(imgData[i + 2] / quant) * quant;

          const key = `${r},${g},${b}`;
          const current = colorCounts.get(key);
          if (current) {
            current.count++;
          } else {
            colorCounts.set(key, { rgb: [r, g, b], count: 1 });
          }
        }

        // Sort by frequency
        const sorted = Array.from(colorCounts.values()).sort((a, b) => b.count - a.count);

        // Pick 4-5 visually distinct dominant colors
        const pickedRgb: [number, number, number][] = [];
        for (const item of sorted) {
          const isTooClose = pickedRgb.some((p) => colorDist(p, item.rgb) < 45);
          if (!isTooClose) {
            pickedRgb.push(item.rgb);
            if (pickedRgb.length >= 5) break;
          }
        }

        // If fewer than 4 distinct colors, fill from sorted
        if (pickedRgb.length < 4) {
          for (const item of sorted) {
            if (!pickedRgb.includes(item.rgb)) {
              pickedRgb.push(item.rgb);
              if (pickedRgb.length >= 4) break;
            }
          }
        }

        const hexList = pickedRgb.map(([r, g, b]) => rgbToHex(r, g, b));
        if (hexList.length > 0) {
          setColors(hexList);
        }
      } catch {
        // Fallback gracefully on CORS security errors
        setColors(["#0F172A", "#1E293B", "#64748B", "#F8FAFC"]);
      }
    };

    img.onerror = () => {
      // Graceful fallback palette
      if (!isCancelled) {
        setColors(["#111111", "#333333", "#777777", "#F5F5F5"]);
      }
    };

    return () => {
      isCancelled = true;
    };
  }, [imageUrl]);

  const copyToClipboard = useCallback((hex: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(hex).catch(() => {});
    }
    setCopiedHex(hex);
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }
    copyTimeoutRef.current = setTimeout(() => {
      setCopiedHex(null);
    }, 1800);
  }, []);

  if (colors.length === 0) return null;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-widest text-black/40">
          Color Palette
        </span>
        <span className="text-[10px] text-black/30 font-medium">Click to copy</span>
      </div>

      <div className="space-y-1.5">
        {colors.map((hex) => {
          const isCopied = copiedHex === hex;
          return (
            <button
              key={hex}
              onClick={() => copyToClipboard(hex)}
              className="w-full group flex items-center justify-between px-3 py-2 rounded-xl border border-black/8 bg-black/[0.02] hover:bg-black/[0.05] hover:border-black/15 transition-all duration-200 cursor-pointer text-left"
              title="Click to copy HEX code"
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-5 h-5 rounded-lg border border-black/10 shadow-sm shrink-0 transition-transform group-hover:scale-105"
                  style={{ backgroundColor: hex }}
                />
                <span className="font-mono text-xs font-semibold text-black/80 group-hover:text-black tracking-wider">
                  {hex}
                </span>
              </div>

              <div className="flex items-center text-black/35 group-hover:text-black transition-colors">
                {isCopied ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                    <Check size={12} /> Copied
                  </span>
                ) : (
                  <Copy size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
