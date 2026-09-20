const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'client', 'src', 'pages', 'user', 'Billing.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace('import "jspdf-autotable";', 'import html2canvas from "html2canvas";');

const oldDownloadStart = 'const handleDownloadPDF = () => {';
const oldDownloadEnd = 'doc.save(`Invoice_${user?.fullName || \'Creator\'}.pdf`);\n  };';
const downloadIdxStart = content.indexOf(oldDownloadStart);
const downloadIdxEnd = content.indexOf(oldDownloadEnd) + oldDownloadEnd.length;

const newDownload = `const handleDownloadPDF = async () => {
    setIsLoading(true);
    try {
      const element = document.getElementById("invoice-template");
      if (!element) return;
      
      element.style.display = "block";
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      element.style.display = "none";
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(\`Invoice_\${user?.fullName || 'Creator'}.pdf\`);
    } catch (err) {
      console.error("PDF generation error:", err);
    } finally {
      setIsLoading(false);
    }
  };`;

content = content.substring(0, downloadIdxStart) + newDownload + content.substring(downloadIdxEnd);

const template = `
      {/* Hidden Invoice Template for PDF */}
      <div id="invoice-template" style={{ display: 'none', width: '800px', padding: '40px', backgroundColor: '#0f0f13', color: '#fff', direction: 'rtl', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #2a2a35', paddingBottom: '20px', marginBottom: '30px' }}>
          <div>
            <h1 style={{ fontSize: '32px', margin: 0, color: '#3b82f6' }}>فاتورة حساب</h1>
            <p style={{ margin: '5px 0 0', color: '#9ca3af' }}>صانع المحتوى: {user?.fullName}</p>
          </div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ margin: 0, fontWeight: 'bold' }}>التاريخ: {new Date().toLocaleDateString('ar-JO')}</p>
          </div>
        </div>

        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', borderBottom: '1px solid #2a2a35', paddingBottom: '10px', marginBottom: '15px' }}>الأعمال والثمنيلات</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
            <thead>
              <tr style={{ backgroundColor: '#1e1e24' }}>
                <th style={{ padding: '12px', borderBottom: '1px solid #3b82f6' }}>عنوان العمل</th>
                <th style={{ padding: '12px', borderBottom: '1px solid #3b82f6' }}>التاريخ</th>
                <th style={{ padding: '12px', borderBottom: '1px solid #3b82f6' }}>الحالة</th>
                <th style={{ padding: '12px', borderBottom: '1px solid #3b82f6' }}>السعر</th>
              </tr>
            </thead>
            <tbody>
              {thumbnails.map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid #2a2a35' }}>
                  <td style={{ padding: '12px' }}>{t.title}</td>
                  <td style={{ padding: '12px' }}>{new Date(t.createdAt).toLocaleDateString('ar-JO')}</td>
                  <td style={{ padding: '12px' }}>{t.status}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>$\{t.price || 0}</td>
                </tr>
              ))}
              {thumbnails.length === 0 && <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>لا يوجد أعمال مسجلة</td></tr>}
            </tbody>
          </table>
        </div>

        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', borderBottom: '1px solid #2a2a35', paddingBottom: '10px', marginBottom: '15px' }}>سجل الفواتير والمدفوعات</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
            <thead>
              <tr style={{ backgroundColor: '#1e1e24' }}>
                <th style={{ padding: '12px', borderBottom: '1px solid #10b981' }}>الوصف</th>
                <th style={{ padding: '12px', borderBottom: '1px solid #10b981' }}>التاريخ</th>
                <th style={{ padding: '12px', borderBottom: '1px solid #10b981' }}>الحالة</th>
                <th style={{ padding: '12px', borderBottom: '1px solid #10b981' }}>المبلغ</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid #2a2a35' }}>
                  <td style={{ padding: '12px' }}>{t.description}</td>
                  <td style={{ padding: '12px' }}>{new Date(t.date || t.createdAt).toLocaleDateString('ar-JO')}</td>
                  <td style={{ padding: '12px' }}>{t.status === 'paid' ? 'مدفوع' : 'غير مدفوع'}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>$\{t.amount}</td>
                </tr>
              ))}
              {transactions.length === 0 && <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>لا يوجد مدفوعات مسجلة</td></tr>}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '50px', backgroundColor: '#1e1e24', padding: '25px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <p style={{ color: '#9ca3af', margin: '0 0 5px' }}>المبلغ الإجمالي</p>
            <h3 style={{ fontSize: '24px', margin: 0 }}>$\{total}</h3>
          </div>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <p style={{ color: '#9ca3af', margin: '0 0 5px' }}>تم سداده</p>
            <h3 style={{ fontSize: '24px', margin: 0, color: '#10b981' }}>$\{paid}</h3>
          </div>
          <div style={{ textAlign: 'center', padding: '10px 20px', backgroundColor: '#ef444420', borderRadius: '8px', border: '1px solid #ef444450', flex: 1 }}>
            <p style={{ color: '#ef4444', margin: '0 0 5px', fontSize: '14px' }}>المبلغ المتبقي</p>
            <h3 style={{ fontSize: '28px', margin: 0, color: '#ef4444' }}>$\{remaining}</h3>
          </div>
        </div>
      </div>
    </div>
  );
`;

content = content.replace('    </div>\n  );\n}\n', template + '\n}\n');

fs.writeFileSync(filePath, content);
console.log("Billing.tsx updated properly");
