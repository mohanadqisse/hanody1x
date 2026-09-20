import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-black/25 mb-4">
        Error 404
      </p>
      <h1 className="text-7xl md:text-9xl font-black text-black tracking-tight mb-4">
        404
      </h1>
      <p className="text-black/40 text-lg mb-8 max-w-xs">
        This page doesn't exist. Head back to the homepage.
      </p>
      <Link href="/">
        <span className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-black text-white text-sm font-semibold hover:bg-black/80 transition-colors cursor-pointer group">
          <ArrowLeft
            size={14}
            className="transition-transform duration-200 group-hover:-translate-x-0.5"
          />
          Back to Home
        </span>
      </Link>
    </div>
  );
}
