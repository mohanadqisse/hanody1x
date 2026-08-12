const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'client', 'src', 'pages', 'user', 'Thumbnails.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace the <select> element options
content = content.replace(
  '<option value="الكل">الكل</option>\n            <option value="تم التسليم">تم التسليم</option>\n            <option value="قيد العمل">قيد العمل</option>',
  '<option value="الكل">الكل</option>\n            <option value="في انتظار التنفيذ">في انتظار التنفيذ</option>\n            <option value="قيد التنفيذ">قيد التنفيذ</option>\n            <option value="تم التنفيذ">تم التنفيذ</option>\n            <option value="تم التسليم">تم التسليم</option>'
);

// Replace the status badge logic
const oldBadge = "className={`text-xs px-2 py-1 rounded font-bold whitespace-nowrap ${thumb.status === 'تم التسليم' ? 'bg-green-500/20 text-green-500' : 'bg-amber-500/20 text-amber-500'}`}";

const newBadge = "className={`text-xs px-2 py-1 rounded font-bold whitespace-nowrap ${\n                  thumb.status === 'تم التسليم' ? 'bg-green-500/20 text-green-500' :\n                  thumb.status === 'تم التنفيذ' ? 'bg-blue-500/20 text-blue-500' :\n                  thumb.status === 'قيد التنفيذ' ? 'bg-amber-500/20 text-amber-500' :\n                  'bg-gray-500/20 text-gray-400'\n                }`}";

content = content.replace(oldBadge, newBadge);

fs.writeFileSync(filePath, content);
console.log("Thumbnails.tsx updated");
