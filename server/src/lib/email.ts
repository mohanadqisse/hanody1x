import nodemailer from "nodemailer";

// Using environment variables for SMTP settings
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const packageLabels: Record<string, string> = {
  basic: "الباقة الأساسية",
  pro: "الباقة الاحترافية",
  elite: "باقة النخبة",
  custom: "احتياج مخصص",
};

export async function sendAutoReplyEmail(to: string, name: string, packageType: string | null) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("⚠️ إعدادات البريد (SMTP) غير موجودة، تم تخطي إرسال رسالة الرد التلقائي.");
    return;
  }

  const packageLabel = packageType ? (packageLabels[packageType] || packageType) : "غير محددة";
  
  const siteUrl = process.env.FRONTEND_URL || "https://hanody1x.space";

  const htmlContent = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>تم استلام طلبك بنجاح 🚀</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f4f7f6;
          margin: 0;
          padding: 0;
          direction: rtl;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }
        .header {
          background-color: #3b82f6;
          padding: 30px 20px;
          text-align: center;
          color: white;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: bold;
        }
        .content {
          padding: 40px 30px;
          color: #333333;
          line-height: 1.8;
          font-size: 16px;
        }
        h2 {
          color: #1e293b;
          font-size: 20px;
          margin-top: 30px;
          margin-bottom: 10px;
          border-right: 4px solid #3b82f6;
          padding-right: 10px;
        }
        p {
          margin: 0 0 15px 0;
          color: #475569;
        }
        .button {
          display: inline-block;
          background-color: #3b82f6;
          color: #ffffff !important;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: bold;
          margin-top: 20px;
        }
        .footer {
          background-color: #f8fafc;
          padding: 20px;
          text-align: center;
          color: #94a3b8;
          font-size: 14px;
          border-top: 1px solid #e2e8f0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>تم استلام طلبك بنجاح 🚀</h1>
        </div>
        <div class="content">
          <p>مرحباً <strong>${name}</strong>،</p>
          <p>يسعدني جداً تواصلك واهتمامك بخدماتي 🙏</p>
          <p>تم استلام طلبك الخاص بباقة <strong style="color:#3b82f6;">${packageLabel}</strong> بنجاح، وأنا ممتن لثقتك باختياري للعمل على مشروعك.</p>
          <p>حالياً، رح أقوم بمراجعة جميع التفاصيل اللي أرسلتها بعناية، عشان أضمن إني أقدم لك أفضل نتيجة ممكنة وبجودة تليق بتوقعاتك — ويمكن أفضل 😉🔥</p>
          <p>هدفي دائماً إني أساعدك تطلع بمحتوى مميز، احترافي، ويعكس قوة هويتك أو مشروعك بشكل واضح وجذاب.</p>
          <p>خلال وقت قصير، رح أتواصل معك للبدء بخطوات التنفيذ وتحديد كل التفاصيل المطلوبة.</p>
          
          <h2>💬 عندك أي استفسار؟</h2>
          <p>إذا في أي سؤال، فكرة، أو حتى توضيح بسيط — لا تتردد أبداً تتواصل معي عبر حسابي على الإنستجرام، وبكون سعيد جداً بالرد عليك في أي وقت.</p>
          
          <h2>🌐 حاب ترجع للموقع؟</h2>
          <p>تقدر ترجع للموقع بأي وقت لاستكشاف أعمالي أكثر أو متابعة خدماتي والتحديثات الجديدة.</p>
          
          <div style="text-align: center;">
            <a href="${siteUrl}" class="button">زيارة الموقع</a>
          </div>

          <p style="margin-top: 30px;">متحمس جداً نبدأ الشغل مع بعض ونطلع بنتيجة قوية تليق فيك 🚀✨</p>
          <p>تحياتي،<br><strong style="color: #1e293b; font-size: 18px;">مهند القيسي</strong></p>
        </div>
        <div class="footer">
          هذه رسالة تلقائية، برجاء عدم الرد عليها مباشرة. للتواصل، يرجى مراسلتي على حساباتي الشخصية.
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"مهند القيسي" <${process.env.SMTP_USER}>`,
    to,
    subject: "تم استلام طلبك بنجاح 🚀",
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Auto-reply email successfully sent to: ${to}`);
  } catch (error) {
    console.error("Error sending auto-reply email:", error);
  }
}
