const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'client', 'src', 'pages', 'user', 'Overview.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const oldBadge = "className={`text-xs px-3 py-1 rounded-full font-bold ${work.status === 'تم التسليم' ? 'bg-green-500/20 text-green-500' : 'bg-amber-500/20 text-amber-500'}`}";

const newBadge = "className={`text-xs px-3 py-1 rounded-full font-bold ${\n                work.status === 'تم التسليم' ? 'bg-green-500/20 text-green-500' :\n                work.status === 'تم التنفيذ' ? 'bg-blue-500/20 text-blue-500' :\n                work.status === 'قيد التنفيذ' ? 'bg-amber-500/20 text-amber-500' :\n                'bg-gray-500/20 text-gray-400'\n              }`}";

content = content.replace(oldBadge, newBadge);

fs.writeFileSync(filePath, content);
console.log("Overview.tsx updated");
