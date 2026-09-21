import { API_BASE } from "@/lib/api";
import React, { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Trash2, Image as ImageIcon, CreditCard, Bell, Settings, Upload, Camera } from "lucide-react";
import { formatNotificationMessage } from "@/types/dashboard";

export default function UserContentManager({ user, onBack, token }: { user: any, onBack: () => void, token: string }) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'thumbnails' | 'transactions' | 'notifications' | 'settings'>('thumbnails');

  const [thumbnails, setThumbnails] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // States for new items
  const [newThumb, setNewThumb] = useState({
    title: "",
    image: "",
    status: "In Progress",
    downloadUrl: "",
    notes: "",
    price: "",
    creatorName: "",
    videoTitle: "",
    youtubeUrl: "",
    views: "",
    category: "Gaming"
  });
  const [newTrans, setNewTrans] = useState({ description: "", amount: "", status: "pending" });
  const [newNotif, setNewNotif] = useState({ message: "" });

  // States for settings
  const [settings, setSettings] = useState({ fullName: user.fullName || "", avatar: user.avatar || "", password: "" });
  const settingsFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, [user.id, activeTab]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'thumbnails') {
        const res = await fetch(API_BASE + `/api/dashboard/users/${user.id}/thumbnails`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setThumbnails(await res.json());
      } else if (activeTab === 'transactions') {
        const res = await fetch(API_BASE + `/api/dashboard/users/${user.id}/transactions`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setTransactions(await res.json());
      } else if (activeTab === 'notifications') {
        const res = await fetch(API_BASE + `/api/dashboard/users/${user.id}/notifications`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setNotifications(await res.json());
      }
    } catch (e) {
      toast({ title: "Failed to load user data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const fd = new FormData();
    fd.append("image", file);
    try {
      const res = await fetch(API_BASE + "/api/upload", {
        method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd
      });
      if (res.ok) {
        const data = await res.json();
        setter(data.url);
        toast({ title: "Image uploaded successfully!" });
      } else {
        toast({ title: "Error uploading image", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error uploading image", variant: "destructive" });
    }
    setIsUploading(false);
  };

  // --- Thumbnails ---
  const addThumbnail = async () => {
    if (!newThumb.title || !newThumb.image) return toast({ title: "Please provide a title and image", variant: "destructive" });
    try {
      const res = await fetch(API_BASE + "/api/dashboard/thumbnails", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: user.id, ...newThumb })
      });
      if (res.ok) {
        toast({ title: "Thumbnail added successfully" });
        setNewThumb({
          title: "",
          image: "",
          status: "In Progress",
          downloadUrl: "",
          notes: "",
          price: "",
          creatorName: "",
          videoTitle: "",
          youtubeUrl: "",
          views: "",
          category: "Gaming"
        });
        fetchUserData();
      }
    } catch (e) { toast({ title: "An error occurred", variant: "destructive" }); }
  };

  const updateThumbnail = async (id: number, field: string, value: any) => {
    const thumb = thumbnails.find(t => t.id === id);
    if (!thumb) return;
    const updated = { ...thumb, [field]: value };
    setThumbnails(thumbnails.map(t => t.id === id ? updated : t));

    try {
      await fetch(API_BASE + `/api/dashboard/thumbnails/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(updated)
      });
    } catch (e) { toast({ title: "Failed to update thumbnail", variant: "destructive" }); }
  };

  const deleteThumbnail = async (id: number) => {
    if (!confirm("Are you sure you want to delete this thumbnail?")) return;
    try {
      const res = await fetch(API_BASE + `/api/dashboard/thumbnails/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast({ title: "Thumbnail deleted successfully" });
        setThumbnails(thumbnails.filter(t => t.id !== id));
      }
    } catch (e) { toast({ title: "An error occurred", variant: "destructive" }); }
  };

  // --- Transactions ---
  const addTransaction = async () => {
    if (!newTrans.description || !newTrans.amount) return toast({ title: "Please fill in all fields", variant: "destructive" });
    try {
      const res = await fetch(API_BASE + "/api/dashboard/transactions", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: user.id, ...newTrans, amount: parseInt(newTrans.amount) })
      });
      if (res.ok) {
        toast({ title: "Invoice added successfully" });
        setNewTrans({ description: "", amount: "", status: "pending" });
        fetchUserData();
      }
    } catch (e) { toast({ title: "An error occurred", variant: "destructive" }); }
  };

  const updateTransaction = async (id: number, field: string, value: any) => {
    const trans = transactions.find(t => t.id === id);
    if (!trans) return;
    const updated = { ...trans, [field]: value };
    setTransactions(transactions.map(t => t.id === id ? updated : t));

    try {
      await fetch(API_BASE + `/api/dashboard/transactions/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(updated)
      });
    } catch (e) { toast({ title: "Failed to update invoice", variant: "destructive" }); }
  };

  const deleteTransaction = async (id: number) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    try {
      const res = await fetch(API_BASE + `/api/dashboard/transactions/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast({ title: "Invoice deleted successfully" });
        setTransactions(transactions.filter(t => t.id !== id));
      }
    } catch (e) { toast({ title: "An error occurred", variant: "destructive" }); }
  };

  // --- Notifications ---
  const addNotification = async () => {
    if (!newNotif.message) return toast({ title: "Please enter a notification message", variant: "destructive" });
    try {
      const res = await fetch(API_BASE + "/api/dashboard/notifications", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: user.id, ...newNotif })
      });
      if (res.ok) {
        toast({ title: "Notification sent successfully" });
        setNewNotif({ message: "" });
        fetchUserData();
      }
    } catch (e) { toast({ title: "An error occurred", variant: "destructive" }); }
  };

  const deleteNotification = async (id: number) => {
    try {
      const res = await fetch(API_BASE + `/api/dashboard/notifications/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast({ title: "Notification deleted" });
        setNotifications(notifications.filter(n => n.id !== id));
      }
    } catch (e) { toast({ title: "An error occurred", variant: "destructive" }); }
  };

  // --- Settings ---
  const updateSettings = async () => {
    try {
      const body: any = { fullName: settings.fullName, avatar: settings.avatar };
      if (settings.password) body.password = settings.password;

      const res = await fetch(API_BASE + `/api/dashboard/users/${user.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        toast({ title: "Settings updated successfully" });
        setSettings({ ...settings, password: "" });
      }
    } catch (e) { toast({ title: "An error occurred", variant: "destructive" }); }
  };

  const statusOptions = [
    "Pending",
    "In Progress",
    "Completed",
    "Delivered"
  ];

  return (
    <div className="dash-card bg-white p-6 sm:p-8 space-y-6 shadow-xs border border-[#e8e8e5] rounded-2xl" dir="ltr">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#e8e8e5] pb-6 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-[#f0f0ed] flex items-center justify-center text-[#111110] text-xl font-bold overflow-hidden border border-[#e8e8e5] shrink-0">
            {settings.avatar ? <img src={settings.avatar} className="w-full h-full object-cover" /> : user.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#111110] mb-1">
              Managing Account: <span className="underline decoration-1 underline-offset-4">{user.fullName}</span>
            </h2>
            <p className="text-xs text-[#55554e]">Manage thumbnails, invoices, notifications, and profile credentials for this creator.</p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="dash-btn-outline shrink-0 text-xs"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Accounts
        </button>
      </div>

      {/* TABS */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-[#f0f0ed]">
        <button
          onClick={() => setActiveTab('thumbnails')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'thumbnails'
              ? 'bg-[#111110] text-white shadow-xs'
              : 'bg-[#f7f7f5] text-[#55554e] hover:bg-[#e8e8e5] hover:text-[#111110]'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          Thumbnails
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'transactions'
              ? 'bg-[#111110] text-white shadow-xs'
              : 'bg-[#f7f7f5] text-[#55554e] hover:bg-[#e8e8e5] hover:text-[#111110]'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          Invoices & Payments
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'notifications'
              ? 'bg-[#111110] text-white shadow-xs'
              : 'bg-[#f7f7f5] text-[#55554e] hover:bg-[#e8e8e5] hover:text-[#111110]'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          Notifications
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'bg-[#111110] text-white shadow-xs'
              : 'bg-[#f7f7f5] text-[#55554e] hover:bg-[#e8e8e5] hover:text-[#111110]'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          Settings
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-sm text-[#99998f]">Loading creator data...</div>
      ) : (
        <div className="animate-in fade-in duration-200">

          {/* THUMBNAILS TAB */}
          {activeTab === 'thumbnails' && (
            <div className="space-y-6">
              <div className="space-y-4">
                {thumbnails.map(t => (
                  <div key={t.id} className="bg-[#fcfcfb] p-4 rounded-xl border border-[#e8e8e5] space-y-3 shadow-2xs">
                    <div className="flex justify-between items-start gap-2">
                      <input
                        value={t.title}
                        onChange={e => updateThumbnail(t.id, 'title', e.target.value)}
                        className="dash-input h-9 text-xs font-semibold flex-1"
                        placeholder="Design Title"
                      />
                      <button
                        onClick={() => deleteThumbnail(t.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex-1 flex gap-2">
                        <input
                          value={t.image}
                          onChange={e => updateThumbnail(t.id, 'image', e.target.value)}
                          placeholder="Image URL"
                          className="dash-input h-9 text-xs flex-1"
                          dir="ltr"
                        />
                        <label
                          className="dash-btn-outline h-9 px-3 text-xs cursor-pointer relative overflow-hidden shrink-0"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{isUploading ? "..." : "Upload"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => handleImageUpload(e, (url) => updateThumbnail(t.id, 'image', url))}
                          />
                        </label>
                      </div>
                      <select
                        value={t.status}
                        onChange={e => updateThumbnail(t.id, 'status', e.target.value)}
                        className="dash-input h-9 text-xs sm:w-40"
                      >
                        {statusOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <input
                      value={t.downloadUrl || ""}
                      onChange={e => updateThumbnail(t.id, 'downloadUrl', e.target.value)}
                      placeholder="High-Res Download URL"
                      className="dash-input h-9 text-xs"
                      dir="ltr"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={t.price || 0}
                        onChange={e => updateThumbnail(t.id, 'price', parseInt(e.target.value))}
                        placeholder="Price ($)"
                        className="dash-input h-9 text-xs w-28"
                        dir="ltr"
                      />
                      <input
                        value={t.notes || ""}
                        onChange={e => updateThumbnail(t.id, 'notes', e.target.value)}
                        placeholder="Notes (visible to creator)"
                        className="dash-input h-9 text-xs flex-1"
                      />
                    </div>
                    {/* Portfolio Metadata Section */}
                    <div className="pt-3 border-t border-[#e8e8e5] space-y-2 bg-white p-3 rounded-lg border" dir="ltr">
                      <p className="text-[11px] font-bold text-[#55554e] text-left">Portfolio Metadata (Optional):</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input value={t.creatorName || ""} onChange={e => updateThumbnail(t.id, 'creatorName', e.target.value)} placeholder="Creator / Channel" className="dash-input h-8 text-xs" />
                        <input value={t.views || ""} onChange={e => updateThumbnail(t.id, 'views', e.target.value)} placeholder="Views (e.g. 12.4M)" className="dash-input h-8 text-xs" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input value={t.videoTitle || ""} onChange={e => updateThumbnail(t.id, 'videoTitle', e.target.value)} placeholder="Video Title" className="dash-input h-8 text-xs" />
                        <input value={t.youtubeUrl || ""} onChange={e => updateThumbnail(t.id, 'youtubeUrl', e.target.value)} placeholder="YouTube URL" className="dash-input h-8 text-xs font-mono" />
                      </div>
                      <select
                        value={t.category || "Gaming"}
                        onChange={e => updateThumbnail(t.id, 'category', e.target.value)}
                        className="dash-input h-8 text-xs"
                      >
                        <option value="Gaming">Gaming</option>
                        <option value="Finance">Finance</option>
                        <option value="Vlogs">Vlogs</option>
                        <option value="Reaction">Reaction</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Education">Education</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                ))}
                {thumbnails.length === 0 && <p className="text-xs text-[#99998f] text-center py-6">No thumbnails recorded for this account.</p>}
              </div>

              {/* Add new thumbnail */}
              <div className="border border-[#e8e8e5] bg-[#fcfcfb] rounded-xl p-5 space-y-3">
                <h4 className="text-xs font-bold text-[#111110] uppercase tracking-wider">Add New Thumbnail</h4>
                <input
                  placeholder="Title"
                  value={newThumb.title}
                  onChange={e => setNewThumb({...newThumb, title: e.target.value})}
                  className="dash-input h-10 text-xs"
                />
                <div className="flex gap-2">
                  <input
                    placeholder="Image URL"
                    value={newThumb.image}
                    onChange={e => setNewThumb({...newThumb, image: e.target.value})}
                    className="dash-input h-10 text-xs flex-1"
                    dir="ltr"
                  />
                  <label
                    className="dash-btn-outline h-10 px-3 text-xs cursor-pointer relative overflow-hidden shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5 mr-1" />
                    <span>{isUploading ? "..." : "Upload from Device"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => handleImageUpload(e, (url) => setNewThumb({...newThumb, image: url}))}
                    />
                  </label>
                </div>
                <div className="flex gap-2">
                  <select
                    value={newThumb.status}
                    onChange={e => setNewThumb({...newThumb, status: e.target.value})}
                    className="dash-input h-10 text-xs w-1/2"
                  >
                    {statusOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Price ($)"
                    value={newThumb.price}
                    onChange={e => setNewThumb({...newThumb, price: e.target.value})}
                    className="dash-input h-10 text-xs w-1/2"
                    dir="ltr"
                  />
                </div>
                {/* New thumbnail metadata */}
                <div className="space-y-2 pt-3 border-t border-[#e8e8e5]" dir="ltr">
                  <p className="text-[11px] font-bold text-[#55554e] text-left">Portfolio Metadata (Optional):</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input placeholder="Creator / Channel" value={newThumb.creatorName} onChange={e => setNewThumb({...newThumb, creatorName: e.target.value})} className="dash-input h-9 text-xs" />
                    <input placeholder="Views (e.g. 12.4M)" value={newThumb.views} onChange={e => setNewThumb({...newThumb, views: e.target.value})} className="dash-input h-9 text-xs" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input placeholder="Video Title" value={newThumb.videoTitle} onChange={e => setNewThumb({...newThumb, videoTitle: e.target.value})} className="dash-input h-9 text-xs" />
                    <input placeholder="YouTube Video URL" value={newThumb.youtubeUrl} onChange={e => setNewThumb({...newThumb, youtubeUrl: e.target.value})} className="dash-input h-9 text-xs font-mono" />
                  </div>
                  <select
                    value={newThumb.category}
                    onChange={e => setNewThumb({...newThumb, category: e.target.value})}
                    className="dash-input h-9 text-xs"
                  >
                    <option value="Gaming">Gaming</option>
                    <option value="Finance">Finance</option>
                    <option value="Vlogs">Vlogs</option>
                    <option value="Reaction">Reaction</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Education">Education</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <button
                  onClick={addThumbnail}
                  className="dash-btn-primary w-full h-10 mt-2 text-xs"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Thumbnail
                </button>
              </div>
            </div>
          )}

          {/* TRANSACTIONS TAB */}
          {activeTab === 'transactions' && (
            <div className="space-y-6">
              <div className="space-y-3">
                {transactions.map(t => (
                  <div key={t.id} className="bg-[#fcfcfb] p-4 rounded-xl border border-[#e8e8e5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                    <div className="flex-1 w-full sm:w-auto">
                      <input
                        value={t.description}
                        onChange={e => updateTransaction(t.id, 'description', e.target.value)}
                        className="dash-input h-9 text-xs mb-2 sm:mb-0 font-medium"
                      />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <input
                        type="number"
                        value={t.amount}
                        onChange={e => updateTransaction(t.id, 'amount', parseInt(e.target.value))}
                        className="dash-input h-9 text-xs w-24 font-mono font-bold"
                        dir="ltr"
                      />
                      <select
                        value={t.status}
                        onChange={e => updateTransaction(t.id, 'status', e.target.value)}
                        className="dash-input h-9 text-xs w-36"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                      </select>
                      <button
                        onClick={() => deleteTransaction(t.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
                        title="Delete Invoice"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {transactions.length === 0 && <p className="text-xs text-[#99998f] text-center py-6">No invoices recorded.</p>}
              </div>

              {/* Add transaction */}
              <div className="border border-[#e8e8e5] bg-[#fcfcfb] rounded-xl p-5 space-y-3">
                <h4 className="text-xs font-bold text-[#111110] uppercase tracking-wider">Add New Invoice</h4>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    placeholder="Invoice description (e.g. 5 YouTube Thumbnails Batch)"
                    value={newTrans.description}
                    onChange={e => setNewTrans({...newTrans, description: e.target.value})}
                    className="dash-input h-10 text-xs flex-1"
                  />
                  <input
                    type="number"
                    placeholder="Amount ($)"
                    value={newTrans.amount}
                    onChange={e => setNewTrans({...newTrans, amount: e.target.value})}
                    className="dash-input h-10 text-xs w-full sm:w-32 font-mono"
                    dir="ltr"
                  />
                  <button
                    onClick={addTransaction}
                    className="dash-btn-primary h-10 px-5 text-xs shrink-0"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Add Invoice
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="space-y-3">
                {notifications.map(n => (
                  <div key={n.id} className="bg-[#fcfcfb] p-4 rounded-xl border border-[#e8e8e5] flex justify-between items-center gap-4 shadow-2xs">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-[#111110] leading-relaxed">{formatNotificationMessage(n.message)}</p>
                      <p className="text-[11px] text-[#99998f] mt-1">{new Date(n.createdAt).toLocaleDateString('en-US')}</p>
                    </div>
                    <button
                      onClick={() => deleteNotification(n.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors shrink-0"
                      title="Delete Notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {notifications.length === 0 && <p className="text-xs text-[#99998f] text-center py-6">No previous notifications sent.</p>}
              </div>

              {/* Send notification */}
              <div className="border border-[#e8e8e5] bg-[#fcfcfb] rounded-xl p-5 space-y-3">
                <h4 className="text-xs font-bold text-[#111110] uppercase tracking-wider">Send New Notification</h4>
                <div className="flex gap-2">
                  <input
                    placeholder="Type notification message here..."
                    value={newNotif.message}
                    onChange={e => setNewNotif({message: e.target.value})}
                    className="dash-input h-10 text-xs flex-1"
                  />
                  <button
                    onClick={addNotification}
                    className="dash-btn-primary h-10 px-6 text-xs shrink-0"
                  >
                    Send Notification
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="bg-[#fcfcfb] rounded-xl p-6 border border-[#e8e8e5] space-y-6">
              <div className="flex items-center gap-5 pb-6 border-b border-[#e8e8e5]">
                <div className="relative group">
                  <div className="w-18 h-18 rounded-2xl bg-white flex items-center justify-center text-[#111110] text-xl font-bold overflow-hidden border border-[#e8e8e5] shadow-2xs">
                    {settings.avatar ? <img src={settings.avatar} className="w-full h-full object-cover" /> : settings.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div
                    onClick={() => settingsFileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                  >
                    <Camera className="text-white w-5 h-5" />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    ref={settingsFileInputRef}
                    onChange={(e) => handleImageUpload(e, (url) => setSettings({...settings, avatar: url}))}
                    className="hidden"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#111110]">Change Profile Photo</h3>
                  <p className="text-xs text-[#55554e]">Click on the photo to upload a new profile picture for this account.</p>
                </div>
              </div>

              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-semibold text-[#111110] mb-1.5">Full Name</label>
                  <input
                    value={settings.fullName}
                    onChange={(e) => setSettings({...settings, fullName: e.target.value})}
                    className="dash-input h-10 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#111110] mb-1.5">New Password</label>
                  <input
                    type="password"
                    value={settings.password}
                    onChange={(e) => setSettings({...settings, password: e.target.value})}
                    placeholder="Leave blank to keep unchanged"
                    className="dash-input h-10 text-xs"
                    dir="ltr"
                  />
                  <p className="text-[11px] text-[#99998f] mt-1">The new password will be applied immediately upon saving.</p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={updateSettings}
                    className="dash-btn-primary h-10 px-8 text-xs"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
