import { API_BASE } from "@/lib/api";
import { useState } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

const ease = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number];

const stagger = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.08 },
    },
  },
  item: {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease } },
  },
};

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useUser();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!fullName || !username || !email || !password || !confirmPassword) {
      return toast({ title: "Please fill in all fields.", variant: "destructive" });
    }
    if (password !== confirmPassword) {
      return toast({ title: "Passwords do not match.", variant: "destructive" });
    }
    if (password.length < 6) {
      return toast({ title: "Password must be at least 6 characters.", variant: "destructive" });
    }
    if (username.includes(" ") || !/^[A-Za-z0-9_]+$/.test(username)) {
      return toast({
        title: "Username must contain only letters, numbers, and underscores.",
        variant: "destructive",
      });
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return toast({
        title: "Password must include an uppercase letter, lowercase letter, and number.",
        variant: "destructive",
      });
    }

    if (!inviteCode) {
      setShowInviteModal(true);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, username, email, password, role: "user", inviteCode }),
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
        toast({ title: "Account created successfully!" });
        setLocation("/dashboard");
      } else {
        toast({ title: data.message || "Registration failed.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Connection error. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const FieldLabel = ({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) => (
    <label
      htmlFor={htmlFor}
      style={{
        display: "block",
        fontSize: "11px",
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase" as const,
        color: "#555",
        marginBottom: "0.45rem",
      }}
    >
      {children}
    </label>
  );

  return (
    <div className="auth-page">
      <div className="auth-split">
        {/* ─── LEFT — Brand Panel ────────────────────── */}
        <div className="auth-brand-panel">
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
              Start your
              <br />
              creative
              <br />
              <span style={{ color: "#bbb" }}>journey.</span>
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
              Get access to your dedicated client portal and manage every project from one place.
            </p>
          </div>

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
            <div style={{ width: "100%", maxWidth: "420px" }}>
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
                  Create account.
                </motion.h1>

                <motion.p
                  variants={stagger.item}
                  style={{
                    fontSize: "14px",
                    color: "#888",
                    marginBottom: "2rem",
                    lineHeight: 1.5,
                  }}
                >
                  Use your invite code to get started.
                </motion.p>

                <motion.div
                  variants={stagger.item}
                  style={{
                    height: "1px",
                    backgroundColor: "#ebebea",
                    marginBottom: "1.75rem",
                  }}
                />

                {/* Fields */}
                <motion.form
                  variants={stagger.container}
                  initial="hidden"
                  animate="show"
                  onSubmit={handleRegister}
                  style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}
                >
                  {/* Two-col: Full Name + Username (stacks on mobile, 2-col on sm+) */}
                  <motion.div
                    variants={stagger.item}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                  >
                    <div>
                      <FieldLabel htmlFor="reg-fullname">Full Name</FieldLabel>
                      <input
                        id="reg-fullname"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your name"
                        autoComplete="name"
                        className="auth-input"
                      />
                    </div>
                    <div>
                      <FieldLabel htmlFor="reg-username">Username</FieldLabel>
                      <input
                        id="reg-username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="username"
                        autoComplete="username"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        className="auth-input"
                      />
                    </div>
                  </motion.div>

                  {/* Email */}
                  <motion.div variants={stagger.item}>
                    <FieldLabel htmlFor="reg-email">Email</FieldLabel>
                    <input
                      id="reg-email"
                      type="email"
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
                    <FieldLabel htmlFor="reg-password">Password</FieldLabel>
                    <div style={{ position: "relative" }}>
                      <input
                        id="reg-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="new-password"
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
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#555")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#aaa")}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </motion.div>

                  {/* Confirm Password */}
                  <motion.div variants={stagger.item}>
                    <FieldLabel htmlFor="reg-confirm">Confirm Password</FieldLabel>
                    <input
                      id="reg-confirm"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      className="auth-input"
                    />
                  </motion.div>

                  {/* Submit */}
                  <motion.div variants={stagger.item} style={{ paddingTop: "0.35rem" }}>
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
                          Creating account…
                        </>
                      ) : (
                        "Create account"
                      )}
                    </button>
                  </motion.div>

                  {/* Sign in link */}
                  <motion.div
                    variants={stagger.item}
                    style={{ textAlign: "center", paddingTop: "0.25rem" }}
                  >
                    <span style={{ fontSize: "13px", color: "#999" }}>
                      Already have an account?{" "}
                    </span>
                    <button
                      type="button"
                      onClick={() => setLocation("/login")}
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
                        fontFamily: "inherit",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.6")}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                    >
                      Sign in
                    </button>
                  </motion.div>
                </motion.form>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Invite Code Modal ──────────────────────────── */}
      <AnimatePresence>
        {showInviteModal && (
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
              transition={{ duration: 0.22, ease }}
              style={{
                backgroundColor: "#fff",
                border: "1px solid #e2e2e0",
                borderRadius: "16px",
                padding: "2rem 2rem 2rem",
                maxWidth: "380px",
                width: "100%",
                boxShadow: "0 16px 48px rgba(0,0,0,0.08)",
              }}
            >
              <p
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "#aaa",
                  marginBottom: "0.5rem",
                }}
              >
                Client Portal
              </p>
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  color: "#111",
                  marginBottom: "0.5rem",
                }}
              >
                Enter invite code
              </h2>
              <p
                style={{
                  fontSize: "13px",
                  color: "#888",
                  marginBottom: "1.5rem",
                  lineHeight: 1.55,
                }}
              >
                Your account requires an invite code to register. Contact the admin to get yours.
              </p>

              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="INVITE-CODE"
                autoFocus
                dir="ltr"
                className="auth-input"
                style={{
                  textAlign: "center",
                  letterSpacing: "0.12em",
                  fontSize: "14px",
                  fontWeight: 600,
                  marginBottom: "1.25rem",
                  textTransform: "uppercase",
                }}
              />

              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  style={{
                    flex: 1,
                    height: "44px",
                    background: "none",
                    border: "1px solid #e2e2e0",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#555",
                    cursor: "pointer",
                    transition: "border-color 0.15s ease",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.borderColor = "#aaa")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.borderColor = "#e2e2e0")
                  }
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!inviteCode}
                  onClick={() => {
                    setShowInviteModal(false);
                    handleRegister();
                  }}
                  className="auth-btn-primary"
                  style={{ flex: 1, height: "44px" }}
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
