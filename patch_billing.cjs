const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'client', 'src', 'pages', 'user', 'Billing.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace state and fetch logic
const newFetchLogic = `  const [transactions, setTransactions] = useState<any[]>([]);
  const [thumbnails, setThumbnails] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBilling = async () => {
      try {
        const token = localStorage.getItem("user_token");
        const res = await fetch(API_BASE + "/api/users/dashboard/billing", {
          headers: { Authorization: \`Bearer \${token}\` }
        });
        if (res.ok) {
          const data = await res.json();
          // If the backend isn't updated yet or returns array, handle gracefully
          if (Array.isArray(data)) {
            setTransactions(data);
          } else {
            setTransactions(data.transactions || []);
            setThumbnails(data.thumbnails || []);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBilling();
  }, []);

  if (isLoading) return <div className="flex items-center justify-center h-full"><div className="loader" /></div>;

  const total = thumbnails.reduce((sum, t) => sum + (t.price || 0), 0) + (thumbnails.length === 0 ? transactions.reduce((sum, t) => sum + t.amount, 0) : 0);
  const paid = transactions.filter(t => t.status === "paid").reduce((sum, t) => sum + t.amount, 0);
  const remaining = total - paid;`;

// We will do a full string replacement for the relevant part
const startIdx = content.indexOf('const [transactions, setTransactions] = useState<any[]>([]);');
const endIdx = content.indexOf('const remaining = total - paid;') + 'const remaining = total - paid;'.length;

content = content.substring(0, startIdx) + newFetchLogic + content.substring(endIdx);

// Add imports for jsPDF
const importLine = `import jsPDF from "jspdf";
import "jspdf-autotable";
`;
content = content.replace('import { Button } from "@/components/ui/button";', importLine + 'import { Button } from "@/components/ui/button";');

// Add the download function
const downloadFn = `
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Add Arabic Font Support (using a basic embedded font trick or simply English/Romanized for now if a specific font isn't loaded)
    // To support Arabic properly, we need to load an Arabic font. For simplicity, we can use default fonts, but they might not render Arabic well.
    // However, jspdf-autotable handles basic tables. We will write English or simple text if Arabic is corrupted, but we will try.
    
    doc.setFontSize(22);
    doc.text("Invoice - " + (user?.fullName || "Creator"), 14, 20);
    
    doc.setFontSize(12);
    doc.text("Date: " + new Date().toLocaleDateString(), 14, 30);
    
    doc.setFontSize(16);
    doc.text("Thumbnails & Work", 14, 45);
    
    const thumbData = thumbnails.map(t => [
      t.title, 
      new Date(t.createdAt).toLocaleDateString(), 
      t.status, 
      "$" + (t.price || 0)
    ]);
    
    (doc as any).autoTable({
      startY: 50,
      head: [["Thumbnail Name", "Date", "Status", "Price"]],
      body: thumbData.length ? thumbData : [["No thumbnails", "-", "-", "-"]],
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
    });
    
    let finalY = (doc as any).lastAutoTable.finalY || 50;
    
    doc.setFontSize(16);
    doc.text("Payments & Transactions", 14, finalY + 15);
    
    const transData = transactions.map(t => [
      t.description,
      new Date(t.date || t.createdAt).toLocaleDateString(),
      t.status === "paid" ? "Paid" : "Pending",
      "$" + t.amount
    ]);
    
    (doc as any).autoTable({
      startY: finalY + 20,
      head: [["Description", "Date", "Status", "Amount"]],
      body: transData.length ? transData : [["No payments", "-", "-", "-"]],
      theme: 'grid',
      headStyles: { fillColor: [39, 174, 96] },
    });
    
    finalY = (doc as any).lastAutoTable.finalY || finalY + 20;
    
    doc.setFontSize(14);
    doc.text("Summary", 14, finalY + 15);
    
    (doc as any).autoTable({
      startY: finalY + 20,
      head: [["Total Owed", "Total Paid", "Remaining Balance"]],
      body: [["$" + total, "$" + paid, "$" + remaining]],
      theme: 'plain',
      styles: { fontSize: 12, fontStyle: 'bold' }
    });
    
    doc.save(\`Invoice_\${user?.fullName || 'Creator'}.pdf\`);
  };
`;

const returnIdx = content.indexOf('return (');
content = content.substring(0, returnIdx) + downloadFn + content.substring(returnIdx);

// Hook the button
content = content.replace(
  '<Button className="rounded-xl font-bold gap-2">',
  '<Button onClick={handleDownloadPDF} className="rounded-xl font-bold gap-2">'
);

fs.writeFileSync(filePath, content);
console.log("Updated Billing.tsx");
