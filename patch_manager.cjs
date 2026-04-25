const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'client', 'src', 'pages', 'admin', 'UserContentManager.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  'const [newThumb, setNewThumb] = useState({ title: "", image: "", status: "قيد العمل", downloadUrl: "", notes: "" });',
  'const [newThumb, setNewThumb] = useState({ title: "", image: "", status: "قيد العمل", downloadUrl: "", notes: "", price: "" });'
);

content = content.replace(
  'setNewThumb({ title: "", image: "", status: "قيد العمل", downloadUrl: "", notes: "" });',
  'setNewThumb({ title: "", image: "", status: "قيد العمل", downloadUrl: "", notes: "", price: "" });'
);

content = content.replace(
  '<Input value={t.downloadUrl || ""} onChange={e => updateThumbnail(t.id, \'downloadUrl\', e.target.value)} placeholder="رابط التحميل عالي الجودة" className="bg-black/30 h-8 text-xs" dir="ltr" />\n                  <Input value={t.notes || ""} onChange={e => updateThumbnail(t.id, \'notes\', e.target.value)} placeholder="ملاحظات (تظهر للعميل)" className="bg-black/30 h-8 text-xs" />',
  '<Input value={t.downloadUrl || ""} onChange={e => updateThumbnail(t.id, \'downloadUrl\', e.target.value)} placeholder="رابط التحميل عالي الجودة" className="bg-black/30 h-8 text-xs" dir="ltr" />\n                  <div className="flex gap-2">\n                    <Input type="number" value={t.price || 0} onChange={e => updateThumbnail(t.id, \'price\', parseInt(e.target.value))} placeholder="السعر ($)" className="bg-black/30 h-8 text-xs w-24" dir="ltr" />\n                    <Input value={t.notes || ""} onChange={e => updateThumbnail(t.id, \'notes\', e.target.value)} placeholder="ملاحظات (تظهر للعميل)" className="bg-black/30 h-8 text-xs flex-1" />\n                  </div>'
);

content = content.replace(
  '<Input placeholder="رابط الصورة" value={newThumb.image} onChange={e => setNewThumb({...newThumb, image: e.target.value})} className="bg-black/20" dir="ltr" />\n              <Button onClick={addThumbnail} className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl">',
  '<Input placeholder="رابط الصورة" value={newThumb.image} onChange={e => setNewThumb({...newThumb, image: e.target.value})} className="bg-black/20" dir="ltr" />\n              <div className="flex gap-2">\n                <Input type="number" placeholder="السعر ($)" value={newThumb.price} onChange={e => setNewThumb({...newThumb, price: e.target.value})} className="bg-black/20 w-1/3" dir="ltr" />\n                <Button onClick={addThumbnail} className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-xl">\n                  <Plus className="w-4 h-4 ml-2" /> إضافة\n                </Button>\n              </div>'
);

fs.writeFileSync(filePath, content);
console.log("Updated UserContentManager.tsx");
