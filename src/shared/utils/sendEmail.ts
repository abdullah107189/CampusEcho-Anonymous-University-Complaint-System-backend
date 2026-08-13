import nodemailer, {
  SendMailOptions,
  Transporter,
} from "nodemailer";

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_FROM =
  process.env.EMAIL_FROM ||
  `"CampusEcho" <${EMAIL_USER}>`;

const CLIENT_URL =
  process.env.CLIENT_URL ||
  "http://localhost:3000";

const OTP_EXPIRY_MINUTES = 10;

if (!EMAIL_USER || !EMAIL_PASS) {
  throw new Error(
    "EMAIL_USER and EMAIL_PASS must be defined.",
  );
}

/**
 * Email transporter
 */
const transporter: Transporter =
  nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.EMAIL_PORT) || 465,
    secure: process.env.EMAIL_SECURE !== "false",
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 10_000,
  });

/**
 * Escape HTML to prevent HTML injection
 */
const escapeHtml = (value: string): string => {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/**
 * Common email layout
 */
const emailLayout = (
  content: string,
): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />

        <style>
          body {
            margin: 0;
            padding: 20px;
            background: #f4f4f4;
            font-family: Arial, Helvetica, sans-serif;
          }

          .container {
            max-width: 500px;
            margin: 0 auto;
            background: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }

          .header {
            text-align: center;
            border-bottom: 2px solid #4f46e5;
            padding-bottom: 20px;
          }

          .header h1 {
            margin: 0;
            color: #4f46e5;
          }

          .content {
            padding: 20px 0;
            color: #333333;
            line-height: 1.6;
          }

          .otp-code {
            margin: 20px 0;
            padding: 20px;
            background: #f0f4ff;
            border-radius: 8px;
            color: #4f46e5;
            font-size: 36px;
            font-weight: bold;
            letter-spacing: 5px;
            text-align: center;
          }

          .warning {
            padding: 12px;
            background: #fff3cd;
            color: #856404;
            border-radius: 5px;
            font-size: 14px;
            text-align: center;
          }

          .button-wrapper {
            margin: 25px 0;
            text-align: center;
          }

          .button {
            display: inline-block;
            padding: 12px 30px;
            background: #4f46e5;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 5px;
          }

          .footer {
            margin-top: 20px;
            color: #666666;
            font-size: 14px;
            text-align: center;
          }

          .footer-small {
            font-size: 12px;
          }
        </style>
      </head>

      <body>
        <div class="container">
          <div class="header">
            <h1>🏫 CampusEcho</h1>
            <p style="color: #666666;">
              Anonymous Complaint System
            </p>
          </div>

          ${content}

          <div class="footer">
            <p>
              © ${new Date().getFullYear()}
              CampusEcho. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
};

/**
 * Send generic email
 */
const sendEmail = async (
  options: SendMailOptions,
) => {
  return transporter.sendMail({
    from: EMAIL_FROM,
    ...options,
  });
};

/**
 * Verify email configuration
 */
export const verifyEmailConfig = async (): Promise<boolean> => {
  try {
    await transporter.verify();

    console.log("Email transporter is ready");

    return true;
  } catch (error) {
    console.error(
      "Email transporter verification failed:",
      error,
    );

    return false;
  }
};

/**
 * Send OTP email
 */
export const sendOTPEmail = async (
  to: string,
  otp: string,
  name: string,
) => {
  const safeName = escapeHtml(name);
  const safeOtp = escapeHtml(otp);

  const html = emailLayout(`
    <div class="content">
      <p>
        Hello <strong>${safeName}</strong>,
      </p>

      <p>
        Thank you for registering with CampusEcho.
        Please verify your email address using the
        OTP below:
      </p>

      <div class="otp-code">
        ${safeOtp}
      </div>

      <p style="text-align: center;">
        This OTP is valid for
        <strong>${OTP_EXPIRY_MINUTES} minutes</strong>.
      </p>

      <div class="warning">
        ⚠️ If you didn't request this,
        please ignore this email.
      </div>
    </div>
  `);

  try {
    const info = await sendEmail({
      to,
      subject: "🔐 Verify Your CampusEcho Account",
      html,
    });

    console.log(`OTP email sent to ${to}`);

    return info;
  } catch (error) {
    console.error(
      `Failed to send OTP email to ${to}:`,
      error,
    );

    throw new Error(
      "Failed to send verification email. Please try again later.",
    );
  }
};

/**
 * Send welcome email
 *
 * Welcome email is non-critical.
 * Registration remains successful even if this fails.
 */
export const sendWelcomeEmail = async (
  to: string,
  name: string,
): Promise<void> => {
  const safeName = escapeHtml(name);
  const safeClientUrl = escapeHtml(CLIENT_URL);

  const html = emailLayout(`
    <div class="content">
      <p>
        Welcome <strong>${safeName}</strong>! 🎉
      </p>

      <p>
        Your account has been successfully verified.
        You can now:
      </p>

      <ul>
        <li>✅ Submit anonymous complaints</li>
        <li>✅ Track complaint status</li>
        <li>✅ Get real-time updates</li>
      </ul>

      <div class="button-wrapper">
        <a
          href="${safeClientUrl}"
          class="button"
        >
          Visit CampusEcho
        </a>
      </div>
    </div>
  `);

  try {
    await sendEmail({
      to,
      subject: "🎉 Welcome to CampusEcho!",
      html,
    });

    console.log(`Welcome email sent to ${to}`);
  } catch (error) {
    console.error(
      `Failed to send welcome email to ${to}:`,
      error,
    );

    // Intentionally do not throw.
  }
};
