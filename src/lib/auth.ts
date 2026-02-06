import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import nodemailer from "nodemailer";

// Create a transporter using Ethereal test credentials.
// For production, replace with your actual SMTP server details.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  trustedOrigins: [process.env.APP_URL!],
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "USER",
      },
      phone: {
        type: "string",
        required: false
      },
      status: {
        type: "string",
        defaultValue: "ACTIVE",
        required: false
      }
    }
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      try {
        const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`
        const info = await transporter.sendMail({
          from: '"Prisma Blog" <no-reply@prismablog.com>',
          to: user.email,
          subject: "Verify your email",
          html: `<div style="
              max-width: 600px;
              margin: 0 auto;
              padding: 24px;
              font-family: Arial, Helvetica, sans-serif;
              background-color: #ffffff;
              border-radius: 8px;
              border: 1px solid #e5e7eb;
            ">
              <h2 style="color:#111827; text-align:center;">
                Welcome to Prisma Blog ${user.name}
              </h2>

              <p style="color:#374151; font-size:15px; line-height:1.6;">
                Hi <strong>${user.email}</strong>,
              </p>

              <p style="color:#374151; font-size:15px; line-height:1.6;">
                Thanks for signing up to <strong>Prisma Blog</strong>!  
                Please confirm your email address by clicking the button below.
              </p>

              <div style="text-align:center; margin: 32px 0;">
                <a
                  href="${verificationUrl}"
                  style="
                    display: inline-block;
                    padding: 12px 24px;
                    background-color: #2563eb;
                    color: #ffffff;
                    text-decoration: none;
                    font-weight: 600;
                    border-radius: 6px;
                  "
                >
                  Verify Email
                </a>
              </div>

              <p style="color:#6b7280; font-size:14px; line-height:1.6;">
                If the button doesn’t work, copy and paste this link into your browser:
              </p>

              <p style="word-break: break-all; font-size:13px; color:#2563eb;">
                ${url}
              </p>

              <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;" />

              <p style="color:#9ca3af; font-size:13px;">
                If you did not create an account, you can safely ignore this email.
              </p>

              <p style="color:#9ca3af; font-size:13px;">
                — Prisma Blog Team
              </p>
            </div>
          `
        });
        console.log("Message sent:", info.messageId);
      } catch (error) {
        console.error(error)
        throw error;
      }

    },
  },
   socialProviders: {
        google: { 
            prompt: "select_account consent",
            accessType: "offline",
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }, 
    },
});