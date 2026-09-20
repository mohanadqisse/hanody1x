import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Instagram } from "lucide-react";
import { API_BASE } from "@/lib/api";

const ease = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number];

export function ContactSection() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    packageType: "",
    details: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.details) return;
    setStatus("loading");
    try {
      const res = await fetch(`${API_BASE}/api/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("success");
        setForm({ name: "", email: "", packageType: "", details: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id="contact" className="pub-section border-t border-black/8">
      <div className="pub-container">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.65, ease }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-black/30 mb-3">
              Contact
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-black tracking-tight mb-5">
              Start a Project
            </h2>
            <p className="text-black/50 leading-relaxed mb-8 max-w-sm">
              Fill in the form and I'll get back to you within 24 hours. You can
              also reach me directly on Instagram.
            </p>

            {/* Instagram link */}
            <a
              href="https://www.instagram.com/hanody1x"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-5 py-3 rounded-full border border-black/12 hover:border-black/25 hover:bg-black/3 transition-all group"
            >
              <Instagram size={16} className="text-black/50" />
              <span className="text-sm font-medium text-black/60 group-hover:text-black transition-colors">
                @hanody1x
              </span>
            </a>
          </motion.div>

          {/* Right — Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.65, delay: 0.12, ease }}
          >
            {status === "success" ? (
              <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-green-600" stroke="currentColor" strokeWidth={2.5}>
                    <polyline points="20,6 9,17 4,12" />
                  </svg>
                </div>
                <h3 className="font-black text-black text-lg mb-1">Message sent!</h3>
                <p className="text-black/50 text-sm">I'll get back to you within 24 hours.</p>
                <button
                  onClick={() => setStatus("idle")}
                  className="mt-5 text-xs text-black/40 hover:text-black underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-black/50 mb-1.5">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Alex Johnson"
                      className="w-full px-4 py-3 rounded-xl border border-black/12 bg-white text-black text-sm placeholder:text-black/25 outline-none focus:border-black/30 focus:ring-2 focus:ring-black/5 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-black/50 mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-black/12 bg-white text-black text-sm placeholder:text-black/25 outline-none focus:border-black/30 focus:ring-2 focus:ring-black/5 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-black/50 mb-1.5">
                    Project Details *
                  </label>
                  <textarea
                    name="details"
                    value={form.details}
                    onChange={handleChange}
                    required
                    rows={4}
                    placeholder="Tell me about your channel, the video topic, and what style you're going for..."
                    className="w-full px-4 py-3 rounded-xl border border-black/12 bg-white text-black text-sm placeholder:text-black/25 outline-none focus:border-black/30 focus:ring-2 focus:ring-black/5 transition-all resize-none"
                  />
                </div>

                {status === "error" && (
                  <p className="text-sm text-red-500">
                    Something went wrong. Please try again or message me on Instagram.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-black text-white text-sm font-semibold hover:bg-black/80 transition-colors disabled:opacity-50 group"
                >
                  {status === "loading" ? "Sending..." : "Send Message"}
                  <Send size={14} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
