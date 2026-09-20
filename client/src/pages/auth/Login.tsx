import { API_BASE } from "@/lib/api";
import { useState } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { Eye, EyeOff, ArrowLeft, AlertCircle } from "lucide-react";

const ease = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number];

const stagger = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.07, delayChildren: 0.1 },
    },
  },
  item: {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease } },
  },
};

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorData, setErrorData] = useState<{
    type: "banned" | "wrong_role";
    message: string;
  } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password)
      return toast({ title: "Please fill in all fields.", variant: "destructive" });
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
        window.location.href = "/dashboard";
      } else {
        if (res.status === 403) {
          const isBanned =
            data.type === "banned" ||
            (data.message && data.message.includes("حظر"));
          const defaultBanMsg =
            "Your account has been temporarily or permanently suspended.\nThis may be due to activity that conflicts with our terms of use.\nIf you believe this is an error, you may request a review.";
          setErrorData({
            type: isBanned ? "banned" : "wrong_role",
            message:
              data.message && data.message.length > 5
                ? data.message
                : isBanned
                ? defaultBanMsg
                : "Your account is registered under a different portal.",
          });
        } else {
          toast({
            title: data.message || "Sign in failed. Please try again.",
            variant: "destructive",
          });
        }
      }
    } catch {
      toast({
        title: "Connection error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-split">
        {/* ─── LEFT — Editorial Brand Panel ─────────── */}
        <div className="auth-brand-panel">
          {/* Top wordmark */}
          <Link href="/">
            <span
              style={{
                fontSize: "13px",
                fontWeight: 900,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#111",
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              MUHANAD
            </span>
          </Link>

          {/* Editorial statement */}
          <div>
            <p
              style={{
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#999",
                marginBottom: "1.5rem",
              }}
            >
              WHERE CREATIVITY MEETS PRECISION
            </p>
            <h2
              style={{
                fontSize: "clamp(2.8rem, 4vw, 4.2rem)",
                fontWeight: 900,
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
                color: "#111",
                marginBottom: "1.5rem",
              }}
            >
              I design
              <br />
              thumbnails
              <br />
              <span style={{ color: "#bbb" }}>that get clicks.</span>
            </h2>
            <p
              style={{
                fontSize: "15px",
                color: "#777",
                lineHeight: 1.65,
                maxWidth: "320px",
                fontWeight: 400,
              }}
            >
              Your projects, revisions, and files — all in one place.
            </p>
          </div>

          {/* Footer tag */}
          <p
            style={{
              fontSize: "12px",
              color: "#bbb",
              letterSpacing: "0.04em",
            }}
          >
            © {new Date().getFullYear()} MUHANAD
          </p>
        </div>

        {/* ─── RIGHT — Form Panel ────────────────────── */}
        <div className="auth-form-panel" style={{ position: "relative" }}>
          {/* Top bar */}
          <div className="auth-topbar">
            {/* Mobile-only brand */}
            <Link href="/">
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 900,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#111",
                  cursor: "pointer",
                }}
              >
                MUHANAD
              </span>
            </Link>
            <Link href="/">
              <button className="auth-btn-ghost" type="button">
                <ArrowLeft size={13} />
                Back to site
              </button>
            </Link>
          </div>

          {/* Form */}
          <div className="auth-form-inner">
            <div style={{ width: "100%", maxWidth: "380px" }}>
              <motion.div
                variants={stagger.container}
                initial="hidden"
                animate="show"
              >
                {/* Eyebrow */}
                <motion.p
                  variants={stagger.item}
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "#aaa",
                    marginBottom: "0.75rem",
                  }}
                >
                  Client Portal
                </motion.p>

                {/* Heading */}
                <motion.h1
                  variants={stagger.item}
                  style={{
                    fontSize: "clamp(1.75rem, 3vw, 2.25rem)",
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                    color: "#111",
                    marginBottom: "0.5rem",
                    lineHeight: 1.1,
                  }}
                >
                  Welcome back.
                </motion.h1>

                {/* Sub-copy */}
                <motion.p
                  variants={stagger.item}
                  style={{
                    fontSize: "14px",
                    color: "#888",
                    marginBottom: "2.25rem",
                    lineHeight: 1.5,
                  }}
                >
                  Sign in to access your projects and files.
                </motion.p>

                {/* Divider */}
                <motion.div
                  variants={stagger.item}
                  style={{
                    height: "1px",
                    backgroundColor: "#ebebea",
                    marginBottom: "2rem",
                  }}
                />

                {/* Form fields */}
                <motion.form
                  variants={stagger.container}
                  initial="hidden"
                  animate="show"
                  onSubmit={handleLogin}
                  style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
                >
                  {/* Email */}
                  <motion.div variants={stagger.item}>
                    <label
                      htmlFor="login-email"
                      style={{
                        display: "block",
                        fontSize: "11px",
                        fontWeight: 600,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "#555",
                        marginBottom: "0.45rem",
                      }}
                    >
                      Email
                    </label>
                    <input
                      id="login-email"
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      className="auth-input"
                    />
                  </motion.div>

                  {/* Password */}
                  <motion.div variants={stagger.item}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "0.45rem",
                      }}
                    >
                      <label
                        htmlFor="login-password"
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "#555",
                        }}
                      >
                        Password
                      </label>
                      <button
                        type="button"
                        className="auth-btn-ghost"
                        style={{ fontSize: "12px" }}
                        onClick={() =>
                          toast({
                            title:
                              "Please contact the admin to reset your password.",
                          })
                        }
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div style={{ position: "relative" }}>
                      <input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        className="auth-input"
                        style={{ paddingRight: "44px" }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        style={{
                          position: "absolute",
                          right: "14px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          color: "#aaa",
                          cursor: "pointer",
                          padding: 0,
                          display: "flex",
                          alignItems: "center",
                          transition: "color 0.15s ease",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = "#555")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color = "#aaa")
                        }
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </motion.div>

                  {/* Submit */}
                  <motion.div variants={stagger.item} style={{ paddingTop: "0.25rem" }}>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="auth-btn-primary"
                    >
                      {isLoading ? (
                        <>
                          <span
                            style={{
                              width: "14px",
                              height: "14px",
                              border: "2px solid rgba(255,255,255,0.3)",
                              borderTopColor: "#fff",
                              borderRadius: "50%",
                              display: "inline-block",
                              animation: "loaderSpin 0.75s linear infinite",
                            }}
                          />
                          Signing in…
                        </>
                      ) : (
                        "Sign in"
                      )}
                    </button>
                  </motion.div>

                  {/* Register link */}
                  <motion.div
                    variants={stagger.item}
                    style={{
                      textAlign: "center",
                      paddingTop: "0.5rem",
                    }}
                  >
                    <span style={{ fontSize: "13px", color: "#999" }}>
                      Don't have an account?{" "}
                    </span>
                    <button
                      type="button"
                      onClick={() => setLocation("/register")}
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#111",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        textDecoration: "underline",
                        textUnderlineOffset: "3px",
                        transition: "opacity 0.15s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.opacity = "0.6")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.opacity = "1")
                      }
                    >
                      Create account
                    </button>
                  </motion.div>
                </motion.form>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Error Modals ──────────────────────────────── */}
      <AnimatePresence>
        {errorData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 50,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem",
              backgroundColor: "rgba(250,250,248,0.9)",
              backdropFilter: "blur(8px)",
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 12, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 12, opacity: 0 }}
              transition={{ duration: 0.25, ease }}
              style={{
                backgroundColor: "#fff",
                border: `1.5px solid ${
                  errorData.type === "banned" ? "#fca5a5" : "#e2e2e0"
                }`,
                borderRadius: "16px",
                padding: "2.5rem",
                maxWidth: "420px",
                width: "100%",
                textAlign: "center",
                boxShadow: "0 16px 48px rgba(0,0,0,0.08)",
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1.5rem",
                  backgroundColor:
                    errorData.type === "banned" ? "#fef2f2" : "#f5f5f3",
                  color: errorData.type === "banned" ? "#ef4444" : "#555",
                }}
              >
                <AlertCircle size={24} />
              </div>

              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  color: errorData.type === "banned" ? "#ef4444" : "#111",
                  marginBottom: "0.75rem",
                }}
              >
                {errorData.type === "banned"
                  ? "Account Suspended"
                  : "Access Denied"}
              </h2>

              <p
                style={{
                  fontSize: "14px",
                  color: "#777",
                  lineHeight: 1.65,
                  marginBottom: "2rem",
                  whiteSpace: "pre-wrap",
                }}
              >
                {errorData.message}
              </p>

              <div style={{ display: "flex", gap: "0.75rem" }}>
                <a href="/" style={{ flex: 1 }}>
                  <button
                    style={{
                      width: "100%",
                      height: "44px",
                      background: "none",
                      border: "1px solid #e2e2e0",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#555",
                      cursor: "pointer",
                      transition: "border-color 0.15s ease, color 0.15s ease",
                      fontFamily: "inherit",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor =
                        "#aaa";
                      (e.currentTarget as HTMLButtonElement).style.color =
                        "#111";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor =
                        "#e2e2e0";
                      (e.currentTarget as HTMLButtonElement).style.color =
                        "#555";
                    }}
                  >
                    Back to site
                  </button>
                </a>
                <button
                  onClick={() => setErrorData(null)}
                  style={{
                    flex: 1,
                    height: "44px",
                    background: errorData.type === "banned" ? "#ef4444" : "#111",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#fff",
                    cursor: "pointer",
                    transition: "opacity 0.15s ease",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.opacity = "0.85")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.opacity = "1")
                  }
                >
                  {errorData.type === "banned" ? "Request Review" : "Try Again"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
