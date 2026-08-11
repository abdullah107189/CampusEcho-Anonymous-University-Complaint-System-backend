import nodemailer from 'nodemailer';

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOTPEmail = async (to: string, otp: string, name: string) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 2px solid #4F46E5; padding-bottom: 20px; }
        .header h1 { color: #4F46E5; margin: 0; }
        .otp-code { font-size: 36px; text-align: center; padding: 20px; background: #f0f4ff; border-radius: 8px; margin: 20px 0; letter-spacing: 5px; font-weight: bold; color: #4F46E5; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        .warning { background: #fff3cd; padding: 10px; border-radius: 5px; color: #856404; font-size: 14px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏫 CampusEcho</h1>
          <p style="color: #666;">Anonymous Complaint System</p>
        </div>
        
        <p>Hello <strong>${name}</strong>,</p>
        <p>Thank you for registering with CampusEcho. Please verify your email address using the OTP below:</p>
        
        <div class="otp-code">${otp}</div>
        
        <p style="text-align: center;">This OTP is valid for <strong>10 minutes</strong>.</p>
        
        <div class="warning">
          ⚠️ If you didn't request this, please ignore this email.
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} CampusEcho. All rights reserved.</p>
          <p style="font-size: 12px;">This is an automated message, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: '🔐 Verify Your CampusEcho Account',
    html,
  });
};

export const sendWelcomeEmail = async (to: string, name: string) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 2px solid #4F46E5; padding-bottom: 20px; }
        .header h1 { color: #4F46E5; margin: 0; }
        .content { padding: 20px 0; }
        .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏫 CampusEcho</h1>
          <p style="color: #666;">Anonymous Complaint System</p>
        </div>
        
        <div class="content">
          <p>Welcome <strong>${name}</strong>! 🎉</p>
          <p>Your account has been successfully verified. You can now:</p>
          <ul>
            <li>✅ Submit anonymous complaints</li>
            <li>✅ Track complaint status</li>
            <li>✅ Get real-time updates</li>
          </ul>
          <p style="text-align: center;">
            <a href="${process.env.CLIENT_URL}" class="button">Visit CampusEcho</a>
          </p>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} CampusEcho. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: '🎉 Welcome to CampusEcho!',
    html,
  });
};