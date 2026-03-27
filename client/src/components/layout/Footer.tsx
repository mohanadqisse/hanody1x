import { Link } from "wouter";
import { useSection } from "@/hooks/useContent";

const defaultBrand = { name: "Hanody1x", logoLetter: "H", logoImage: "" };

export function Footer() {
  const brand = useSection("brand", defaultBrand as any);

  return (
    <footer className="border-t border-border py-12 mt-20">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center overflow-hidden">
              {brand.logoImage ? (
                <img src={brand.logoImage} alt={brand.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-sm font-black">{brand.logoLetter}</span>
              )}
            </div>
            <span className="text-lg font-bold text-foreground">{brand.name}</span>
          </div>
          <p className="text-muted-foreground text-sm text-center">
            © 2026 Hanody1x. جميع الحقوق محفوظة.
          </p>
          <nav className="flex items-center gap-6">
            <button onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              الخدمات
            </button>
            <button onClick={() => document.getElementById("portfolio")?.scrollIntoView({ behavior: "smooth" })} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              معرض الأعمال
            </button>
            <button onClick={() => document.getElementById("order")?.scrollIntoView({ behavior: "smooth" })} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              اطلب الآن
            </button>
          </nav>
        </div>
      </div>
    </footer>
  );
}
