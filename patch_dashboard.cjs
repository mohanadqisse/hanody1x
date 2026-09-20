const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'client', 'src', 'pages', 'admin', 'AdminDashboard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace {activeTab === 'users' && (...)} to {activeTab === 'users' && (...)} without the UserContentManager
// And add {activeTab === 'creators' && (...)}

// We will find the block {activeTab === 'users' && (
const usersTabStart = content.indexOf("{activeTab === 'users' && (");
const clientsTabStart = content.indexOf("{activeTab === 'clients' && (");

if (usersTabStart !== -1 && clientsTabStart !== -1) {
  let usersTabBlock = content.substring(usersTabStart, clientsTabStart);

  // Extract the UserContentManager out of usersTabBlock
  // And change it so 'users' only shows the general list without the "إدارة محتوى المستخدم" button.
  // Then we will insert 'creators' tab which WILL have UserContentManager.
  
  // Wait, let's just make `creators` tab list ONLY users with role === 'user'.
  const creatorsTabBlock = `
        {activeTab === 'creators' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {managingUser ? (
              <UserContentManager user={managingUser} onBack={() => setManagingUser(null)} token={token || ""} />
            ) : (
              <div className="bg-card/40 border border-white/5 rounded-3xl p-6 sm:p-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-white/10 pb-6">
                  <div>
                    <h2 className="text-2xl font-black text-foreground mb-2">إدارة صناع المحتوى</h2>
                    <p className="text-sm text-muted-foreground">قم بإدارة الثمنيلات والفواتير الخاصة بصناع المحتوى.</p>
                  </div>
                </div>

                {usersData.filter(u => u.role === 'user').length === 0 ? (
                  <div className="text-center py-20">
                    <User className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                    <p className="text-muted-foreground">لا يوجد صناع محتوى مسجلين حالياً.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {usersData.filter(u => u.role === 'user').map(user => (
                      <div key={user.id} className="bg-card p-5 rounded-2xl border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:bg-white/5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold text-xl">
                            {user.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg flex items-center gap-2">
                              {user.fullName}
                              {user.isBanned && <span className="bg-red-500/20 text-red-500 text-[10px] px-2 py-0.5 rounded-full">محظور</span>}
                            </h3>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-1"><AtSign size={12}/> {user.username || "بدون يوزر"}</span>
                              <span className="flex items-center gap-1"><Mail size={12}/> {user.email}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => setManagingUser(user)}
                            className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20"
                          >
                            إدارة بيانات صانع المحتوى
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
`;

  // Remove managingUser logic from usersTabBlock, keep it simple
  const modifiedUsersTab = `        {activeTab === 'users' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-card/40 border border-white/5 rounded-3xl p-6 sm:p-10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-white/10 pb-6">
                <div>
                  <h2 className="text-2xl font-black text-foreground mb-2">حسابات المنصة</h2>
                  <p className="text-sm text-muted-foreground">العملاء الذين قاموا بالتسجيل في الموقع الخاص بك.</p>
                </div>
              </div>

              {usersData.length === 0 ? (
                <div className="text-center py-20">
                  <Users className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                  <p className="text-muted-foreground">لا يوجد مستخدمين مسجلين حالياً.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {usersData.map(user => (
                    <div key={user.id} className="bg-card p-5 rounded-2xl border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:bg-white/5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold text-xl">
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg flex items-center gap-2">
                            {user.fullName}
                            {user.isBanned && <span className="bg-red-500/20 text-red-500 text-[10px] px-2 py-0.5 rounded-full">محظور</span>}
                            <span className="bg-white/10 text-white text-[10px] px-2 py-0.5 rounded-full">{user.role === 'guest' ? 'ضيف' : 'صانع محتوى'}</span>
                          </h3>
                          <div className="flex flex-col gap-1 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center gap-1"><AtSign size={12}/> {user.username || "بدون يوزر"}</span>
                            <span className="flex items-center gap-1"><Mail size={12}/> {user.email}</span>
                            <span className="flex items-center gap-1"><Clock size={12}/> انضم: {new Date(user.createdAt).toLocaleDateString('ar-JO')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Button 
                          size="sm" 
                          onClick={() => handleBanUser(user.id, user.isBanned)}
                          variant={user.isBanned ? "outline" : "destructive"}
                          className="rounded-xl w-full sm:w-auto font-bold h-10"
                        >
                          {user.isBanned ? <ShieldCheck className="w-4 h-4 mr-1 ml-1" /> : <ShieldX className="w-4 h-4 mr-1 ml-1" />}
                          {user.isBanned ? "إلغاء الحظر" : "حظر المستخدم"}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => setModalConfig({ isOpen: true, type: 'deletePlatformUser', title: 'حذف المستخدم نهائياً', description: 'هل أنت متأكد من حذف هذا المستخدم وكل بياناته؟', clientId: user.id })}
                          className="rounded-xl w-full sm:w-auto h-10 bg-red-900/50 hover:bg-red-600 text-white"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
`;

  content = content.replace(usersTabBlock, creatorsTabBlock + modifiedUsersTab);
  fs.writeFileSync(filePath, content);
  console.log("AdminDashboard.tsx patched successfully");
} else {
  console.log("Could not find usersTabStart or clientsTabStart");
}
