import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-6xl font-black text-primary mb-4">404</h1>
      <h2 className="text-2xl font-bold text-foreground mb-4">الصفحة غير موجودة</h2>
      <p className="text-muted-foreground mb-8">عذراً، لم نتمكن من إيجاد الصفحة التي تبحث عنها.</p>
      <Link href="/">
        <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-8">
          العودة للرئيسية
        </Button>
      </Link>
    </div>
  );
}
