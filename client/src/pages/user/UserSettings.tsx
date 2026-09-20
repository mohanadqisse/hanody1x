import { API_BASE } from "@/lib/api";
import { useState, useEffect, useRef } from "react";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { User as UserIcon, Lock, Camera, Upload, ExternalLink } from "lucide-react";

export default function UserSettings() {
  const { user, updateUser } = useUser();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName]             = useState(user?.fullName ?? "");
  const [avatar, setAvatar]                 = useState(user?.avatar ?? "");
  const [password, setPassword]             = useState("");
  const [isLoading, setIsLoading]           = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);

  // Keep local state in sync when user context loads
  useEffect(() => {
    if (user) {
      setFullName(user.fullName ?? "");
      setAvatar(user.avatar ?? "");
    }
  }, [user]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    try {
      const token = localStorage.getItem("user_token");
      const res = await fetch(API_BASE + "/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (res.ok) {
        const data = await res.json();
        setAvatar(data.url);
        toast({ title: "Photo uploaded." });
      } else {
        toast({ title: "Upload failed.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Upload error.", variant: "destructive" });
    }
    setShowImageOptions(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.role === "guest") {
      return toast({ title: "Profile editing is not available in demo mode.", variant: "destructive" });
    }
    setIsLoading(true);
    try {
      const token = localStorage.getItem("user_token");
      const body: Record<string, string> = { fullName, avatar };
      if (password) body.password = password;

      const res = await fetch(API_BASE + "/api/users/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        updateUser({ fullName, avatar });
        setPassword("");
        toast({ title: "Profile updated." });
      } else {
        toast({ title: "Update failed.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Update error.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const initials = fullName.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();

  return (
    <div style={{ maxWidth: "560px" }}>
      <DashboardPageHeader
        title="Account settings"
        description="Update your name, profile photo, and password."
      />

      <form onSubmit={handleUpdate}>

        {/* ── Avatar section ── */}
        <div className="dash-card" style={{ padding: "24px", marginBottom: "16px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--dash-ink-3)", marginBottom: "16px" }}>
            Profile photo
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            {/* Avatar */}
            <div style={{ position: "relative" }}>
              <div
                style={{
                  width: "64px", height: "64px", borderRadius: "50%",
                  background: "#111", overflow: "hidden", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "20px", fontWeight: 800, color: "#fff",
                  border: "2px solid var(--dash-border)",
                }}
              >
                {avatar
                  ? <img src={avatar} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="Avatar" />
                  : initials
                }
              </div>
              {/* Camera overlay */}
              <button
                type="button"
                onClick={() => setShowImageOptions(v => !v)}
                style={{
                  position: "absolute", inset: 0, borderRadius: "50%",
                  background: "rgba(0,0,0,0.5)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: "none", cursor: "pointer", color: "#fff",
                  opacity: 0, transition: "opacity 0.15s ease",
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={e => {
                  if (!showImageOptions) e.currentTarget.style.opacity = "0";
                }}
              >
                <Camera size={16} />
              </button>

              {/* Dropdown */}
              {showImageOptions && (
                <div
                  style={{
                    position: "absolute", top: "calc(100% + 8px)", left: 0,
                    width: "160px", background: "#fff",
                    border: "1px solid var(--dash-border)", borderRadius: "9px",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.08)", overflow: "hidden", zIndex: 10,
                  }}
                >
                  {avatar && (
                    <a
                      href={avatar} target="_blank" rel="noopener noreferrer"
                      onClick={() => setShowImageOptions(false)}
                      style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", fontSize: "13px", color: "var(--dash-ink-2)", textDecoration: "none", transition: "background 0.1s ease" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--dash-border-2)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "")}
                    >
                      <ExternalLink size={13} /> View photo
                    </a>
                  )}
                  <div
                    onClick={() => { fileInputRef.current?.click(); setShowImageOptions(false); }}
                    style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", fontSize: "13px", color: "var(--dash-ink)", cursor: "pointer", fontWeight: 500, transition: "background 0.1s ease" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--dash-border-2)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "")}
                  >
                    <Upload size={13} /> Change photo
                  </div>
                </div>
              )}
            </div>

            <div>
              <p style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--dash-ink)", marginBottom: "4px" }}>
                {fullName || "Your name"}
              </p>
              <p style={{ fontSize: "12px", color: "var(--dash-ink-3)" }}>
                Click the photo to change it
              </p>
            </div>

            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
          </div>
        </div>

        {/* ── Profile info ── */}
        <div className="dash-card" style={{ padding: "24px", marginBottom: "16px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--dash-ink-3)", marginBottom: "16px" }}>
            Profile info
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Full name */}
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600, color: "var(--dash-ink-2)", marginBottom: "7px", letterSpacing: "0.03em" }}>
                <UserIcon size={13} /> Full name
              </label>
              <input
                className="dash-input"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Your full name"
                style={{ height: "40px" }}
              />
            </div>

            {/* Email (read-only display) */}
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600, color: "var(--dash-ink-2)", marginBottom: "7px", letterSpacing: "0.03em" }}>
                Email
              </label>
              <input
                className="dash-input"
                value={user?.email ?? ""}
                readOnly
                style={{ height: "40px", background: "var(--dash-border-2)", color: "var(--dash-ink-3)", cursor: "not-allowed" }}
              />
              <p style={{ fontSize: "11px", color: "var(--dash-ink-3)", marginTop: "5px" }}>
                Contact us to change your email address.
              </p>
            </div>
          </div>
        </div>

        {/* ── Password ── */}
        <div className="dash-card" style={{ padding: "24px", marginBottom: "24px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--dash-ink-3)", marginBottom: "16px" }}>
            Change password
          </p>
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600, color: "var(--dash-ink-2)", marginBottom: "7px", letterSpacing: "0.03em" }}>
              <Lock size={13} /> New password
            </label>
            <input
              className="dash-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
              style={{ height: "40px" }}
            />
            <p style={{ fontSize: "11px", color: "var(--dash-ink-3)", marginTop: "5px" }}>
              Minimum 6 characters, at least one uppercase, one lowercase, and one number.
            </p>
          </div>
        </div>

        {/* ── Save ── */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="submit"
            disabled={isLoading}
            style={{
              height: "40px", padding: "0 24px",
              background: "var(--dash-ink)", color: "#fff",
              border: "none", borderRadius: "8px",
              fontSize: "13.5px", fontWeight: 600, cursor: "pointer",
              fontFamily: "inherit", opacity: isLoading ? 0.5 : 1,
              transition: "opacity 0.15s ease",
            }}
          >
            {isLoading ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
