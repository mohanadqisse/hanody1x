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
  basic: "Basic Package",
  pro: "Pro Package",
  elite: "Elite Package",
  custom: "Custom Request",
};

export async function sendAutoReplyEmail(to: string, name: string, packageType: string | null) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("⚠️ SMTP credentials missing, skipped sending auto-reply email.");
    return;
  }

  const packageLabel = packageType ? (packageLabels[packageType] || packageType) : "Not specified";
  
  const siteUrl = process.env.FRONTEND_URL || "https://hanody1x.space";

  const htmlContent = `
    <!DOCTYPE html>
    <html dir="ltr" lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Order Has Been Received Successfully 🚀</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f4f7f6;
          margin: 0;
          padding: 0;
          direction: ltr;
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
          border-left: 4px solid #3b82f6;
          padding-left: 10px;
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
          <h1>Your Order Has Been Received Successfully 🚀</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${name}</strong>,</p>
          <p>Thank you for reaching out and for your interest in my services 🙏</p>
          <p>Your request for the <strong style="color:#3b82f6;">${packageLabel}</strong> has been received successfully, and I appreciate your trust in choosing me for your project.</p>
          <p>I will carefully review all the details you provided to ensure we deliver the highest quality outcome that exceeds your expectations 🔥</p>
          <p>My goal is always to help you create distinctive, high-converting content that elevates your channel and brand.</p>
          <p>I will get in touch with you shortly to confirm the next steps.</p>
          
          <h2>💬 Have questions?</h2>
          <p>If you have any questions, ideas, or additional notes, feel free to reach out directly on Instagram.</p>
          
          <h2>🌐 Visit the Website</h2>
          <p>You can explore more of my portfolio and services on the website.</p>
          
          <div style="text-align: center;">
            <a href="${siteUrl}" class="button">Visit Website</a>
          </div>

          <p style="margin-top: 30px;">Looking forward to working together 🚀✨</p>
          <p>Best regards,<br><strong style="color: #1e293b; font-size: 18px;">Muhanad Alqaisi</strong></p>
        </div>
        <div class="footer">
          This is an automated message, please do not reply directly. To get in touch, reach out through my personal social links.
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Muhanad Alqaisi" <${process.env.SMTP_USER}>`,
    to,
    subject: "Your Order Has Been Received Successfully 🚀",
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Auto-reply email successfully sent to: ${to}`);
  } catch (error) {
    console.error("Error sending auto-reply email:", error);
  }
}
